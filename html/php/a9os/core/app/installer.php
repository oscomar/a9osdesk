<?php 
/*_gtlsc_
 * os.com.ar (a9os) - Open web LAMP framework and desktop environment
 * Copyright (C) 2019-2021  Santiago Pereyra (asp95)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.*/

class a9os_core_app_installer extends a9os_core_window {

	private $appsBasedir = false;

	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		$this->syncExistingApps();

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		if ($a9osUser->getCanRequestSyskey()) {
			return [
				"window" => [
					"title" => "Administrar Programas",
					"favicon-url" => "/resources/a9os/core/app/installer/icon.svg",
				],
				"can_syskey" => true,
				"allUsers" => $this->getAllUsers(),
				"arrApps" => $this->getAllAppsAndInfo()
			];
		} else {
			return [
				"window" => [
					"title" => "Instalar programa",
					"favicon-url" => "/resources/a9os/core/app/installer/icon.svg",
					"resize" => "false",
					"width" => "350px",
					"height" => "auto",
					"position" => "center",
				],
			];
		}
	}

	protected function getAllUsers(){
		$a9osUserCollection = $this->getCore()->getModel("a9os.user");
		$a9osUserCollection->_setSelect("SELECT * from {$a9osUserCollection->getTableName()}");

		$arrAllUsers = [];
		while ($currUser = $a9osUserCollection->fetch()) {
			$arrAllUsers[$currUser->getID()] = [
				"id" => $currUser->getID(),
				"name" => $currUser->getName()
			];
		}

		return $arrAllUsers;
	}

	protected function getAllAppsAndInfo(){
		$appAppCollection = $this->getCore()->getModel("application.application");
		$appAppUser = $this->getCore()->getModel("application.application.user");
		$a9osUser = $this->getCore()->getModel("a9os.user");

		$appAppCollection = $appAppCollection->_setSelect("
			SELECT aa.*, GROUP_CONCAT(aau.{$a9osUser->getPrimaryIdx()}) AS 'user_id_list' 
			FROM {$appAppCollection->getTableName()} aa
			LEFT JOIN {$appAppUser->getTableName()} aau ON (aa.{$appAppCollection->getPrimaryIdx()} = aau.{$appAppCollection->getPrimaryIdx()})

			GROUP BY aa.{$appAppCollection->getPrimaryIdx()}
		");

		$arrAllApps = [];
		while ($currApp = $appAppCollection->fetch()) {
			$arrAllApps[$currApp->getID()] = $this->buildAppReturnObject($currApp)["appInstallerAppData"];
		}

		return $arrAllApps;
	}

	public function buildAppReturnObject($currApp){
		$appInstallStatus = "";
		$versionToUpdate = false;

		$installerClassName = $currApp->getAppinstallerName();
		
		if ($currApp->getIsInstalled() == 0) {
			$appInstallStatus = "not-installed";
			$versionToUpdate = json_decode($currApp->getAppVersion(), true);
		} else {
			$versionToUpdateFile = $installerClassName::arrVersion;

			if ($versionToUpdateFile != json_decode($currApp->getAppVersion(), true)) {
				$appInstallStatus = "to-update";
				$versionToUpdate = $versionToUpdateFile;
			} else {
				$appInstallStatus = "installed";
			}
		} 

		return [
			"appInstallerAppData" => [
				"id" => $currApp->getID(),
				"name" => $currApp->getName(),
				"icon_url" => $currApp->getIconUrl(),
				"app_scope" => $currApp->getAppScope(),
				"app_code" => $currApp->getAppCode(),
				"version_installed" => implode(".", json_decode($currApp->getAppVersion(), true)),
				"version_to_update" => implode(".", $versionToUpdate?:[]),
				"user_id_list" => explode(",", $currApp->getUserIdList()),
				"app_install_status" => $appInstallStatus,
				"arr_changelog" => $this->getArrChangelog($installerClassName)
			],
			"appList" => $this->getCore()->getModel("a9os.core.taskbar.applist")->getAllUserApps()
		];
	}

	public function getArrChangelog($installerClassName){
		$appInstallerModel = $this->getCore()->getModel($this->getCore()->getModelDescriptorByClassName($installerClassName));
		if (!method_exists($appInstallerModel, "loadArrChangelog")) return [];
		
		$appInstallerModel->loadArrChangelog();

		return array_reverse($appInstallerModel->arrChangelog, true);
	}



	public function submitCode($data, $returnObject = false){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		$code = $data["data"]["code"];

		$appApp = $this->getCore()->getModel("application.application")->load($code, "app_code");

		if (!$appApp->getID()) return "error";

		if ($returnObject) {
			return $appApp;
		} else {
			return $appApp->getData();
		}
	}

	public function confirmCode($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");
		
		$newApp = $this->submitCode($data, true);
		if ($newApp == "error") return "error";

		$newAppID = $newApp->getID();
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		
		$newApp->install();

		$newAppEnable = $this->getCore()->getModel("application.application.user");
		$newAppEnable->setApplicationApplicationId($newAppID);
		$newAppEnable->setA9osUserId($user->getID());
		$newAppEnable->save();

		$newApp->setIsInstalled(1);
		$newApp->save();

		$appAppData = $newApp->getData();
		$appAppData["url"] = $this->getAppPathFromCode($data["data"]["code"]);

		$appAppData["appList"] = $this->getCore()->getModel("a9os.core.taskbar.applist")->getAllUserApps();

		return $appAppData;
	}

	public function getAppPathFromCode($code){
		$aa = $this->getCore()->getModel("application.application")->load($code, "app_code");

		$cca = $this->getCore()->getModel("core.controller.application");
		$cca = $cca->_setSelect("
			SELECT * from {$cca->getTableName()}
			where {$aa->getPrimaryIdx()} = {$aa->getID()}
			and is_main_window = 1
		")->fetch();

		return $this->getCore()->getModel("core.controller")->load($cca->getCoreControllerId())->getPath();
	}





	public function installBaseApps(){
		error_log(" * Syncing base apps to DB");

		$this->syncExistingApps();

		$appAppAllCollection = $this->getCore()->getModel("application.application");
		$appAppAllCollection->_setSelect("SELECT * 
			from {$appAppAllCollection->getTableName()} 
			where app_scope = 'public' 
			and is_installed = 0");

		while($currAppAppToInstall = $appAppAllCollection->fetch()) {
			error_log(" * ".$currAppAppToInstall->getName()." Installing");
			$currAppAppToInstall->install();
		}
		
		$appAppAllCollection->resetFetch();

		while($currAppAppToUpdate = $appAppAllCollection->fetch()) {
			$currAppAppToUpdate->setIsInstalled(1);
			$installerClassName = $currAppAppToUpdate->getAppinstallerName();
			$versionToUpdateFile = $installerClassName::arrVersion;

			if ($versionToUpdateFile != json_decode($currAppAppToUpdate->getAppVersion(), true)) {
				error_log(" * ".$currAppAppToUpdate->getName()." Updating");
				$currAppAppToUpdate->update();
			}

		}
	}




	public function syncExistingApps(){
		if (!$this->appsBasedir) $this->appsBasedir = $this->getCore()->getRootFolder()."/php/a9os/app/";

		$arrAppFolderDirs = shell_exec("cd ".$this->appsBasedir." && find * -type d -print");
		$arrAppFolderDirs = rtrim($arrAppFolderDirs, "\n");
		$arrAppFolderDirs = explode("\n", $arrAppFolderDirs);

		foreach ($arrAppFolderDirs as $k => $currFolderEntry) {
			if (!is_file($this->appsBasedir.$currFolderEntry."/appinstaller.php")) {
				unset($arrAppFolderDirs[$k]);
			}
		}


		$appAppCollection = $this->getCore()->getModel("application.application");
		$appAppCollection->_setSelect("SELECT * from {$appAppCollection->getTableName()}");


		$arrAppsToDelete = [];

		$arrAppsToImport = $arrAppFolderDirs;

		while ($currAppApp = $appAppCollection->fetch()) {
			if (empty($currAppApp->getAppVersion())) {
				$installerClassName = $currAppApp->getAppinstallerName();

				if ($currAppApp->getIsInstalled()) {
					$currAppApp->syncSetVersion($installerClassName::arrVersion);
				} else {
					$currAppApp->syncSetVersion($installerClassName::arrBaseVersion);
				}
			}

			if (!in_array($currAppApp->getAppFolder(), $arrAppFolderDirs)) {
				$arrAppsToDelete = $currAppApp;
				continue;
			}

			if (($arrAppsToImportK = array_search($currAppApp->getAppFolder(), $arrAppsToImport)) !== false) {
				unset($arrAppsToImport[$arrAppsToImportK]);
			}
		}

		foreach ($arrAppsToDelete as $k => $currAppToDelete) {
			$this->deleteApp($currAppToDelete);
		}

		foreach ($arrAppsToImport as $k => $currAppToImport) {
			$this->importApp($currAppToImport);
		}
	}


	public function deleteApp($appToDelete){
		error_log("TO DO: con core.controller.application sacar todos los controllers y components de la app, y borrarlos. | ".$appToDelete->getAppFolder());
		return;
	}

	public function importApp($currAppFolderToImport){
		if (!is_file($this->appsBasedir.$currAppFolderToImport."/appinstaller.php")) return false;
		
		$currAppFolderToImportToCN = str_replace("/", "_", $currAppFolderToImport);
		$currAppFolderToImportToCN = rtrim($currAppFolderToImportToCN, "_");

		$installerClassName = "a9os_app_{$currAppFolderToImportToCN}_appinstaller";

		if (!class_exists($installerClassName)) return false;
		$appName = $installerClassName::appName??false;
		$iconUrl = $installerClassName::iconUrl??false;

		$arrBaseVersion = $installerClassName::arrBaseVersion??false;
		$arrVersion = $installerClassName::arrVersion??false;

		if (!$appName || !$iconUrl) throw new Exception($currAppFolderToImport."| importApp | appname or iconurl not found.");
		if (!$arrBaseVersion || !$arrVersion) throw new Exception($currAppFolderToImport."| importApp | not version defined.");

		$appScope = "private";
		if (defined($installerClassName."::appScopePublic") && $installerClassName::appScopePublic) $appScope = "public";
		
		$newAppApp = $this->getCore()->getModel("application.application");

		$newAppApp->addNew($appName, $iconUrl, $appScope, $currAppFolderToImport, $arrBaseVersion);
	}


}