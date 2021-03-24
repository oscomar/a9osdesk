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

class a9os_app_vf_modules_tags_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 7];
	const arrVersion = [0, 1, 7];

	const appName = "VF - módulo file source tags";
	const iconUrl = "/resources/a9os/app/vf/icons/filesources/tags/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$arrDataModels = [
			"/vf/copyMove/checkProblems" => "a9os.app.vf.modules.tags.copymove::checkProblems",
			"/vf/copyMove/finalMove" => "a9os.app.vf.modules.tags.copymove::finalMove",
			"/vf/delete" => "a9os.app.vf.modules.tags.delete",
			"/vf/download" => "a9os.app.vf.modules.tags.download",
			"/vf/fileGetContents" => "a9os.app.vf.modules.tags.file::fileGetContents",
			"/vf/filePutContents" => "a9os.app.vf.modules.tags.file::filePutContents",
			"/vf/folder" => "a9os.app.vf.modules.tags.folder",
			"/vf/getRegistry" => "a9os.app.vf.modules.tags.registry",
			"/vf/rename" => "a9os.app.vf.modules.tags.file::rename",
			"/vf/newitem" => "a9os.app.vf.modules.tags.file::newItem",
			"/vf/update" => "a9os.app.vf.modules.tags.folder::updateData"
		];

		$vfSourcerouter = $this->getCore()->getModel("a9os.app.vf.sourcerouter");
		$controllersCollection = $vfSourcerouter->getControllerCollection();

		$pathPrefix = "TAGS";

		while ($currController = $controllersCollection->fetch()) {
			$newCoreComponent = $this->getCore()->getModel("core.component");
			$newCoreComponent->setDataModel($arrDataModels[$currController->getPath()]);
			if ($currController->getPath() == "/vf/copyMove/finalMove") {
				$newCoreComponent->setIsAsyncOutput(1);
			}
			$newCoreComponent->save();

			$vfSourcerouter = $this->getCore()->getModel("a9os.app.vf.sourcerouter");
			$vfSourcerouter->setPathPrefix($pathPrefix);
			$vfSourcerouter->setCoreControllerId($currController->getID());
			$vfSourcerouter->setCoreComponentId($newCoreComponent->getID());
			$vfSourcerouter->save();
		}

		$vfSourcerouterItem = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item");
		$vfSourcerouterItem->setPathPrefix($pathPrefix);
		$vfSourcerouterItem->setName("Tags");
		$vfSourcerouterItem->setIconUrl(self::iconUrl);
		$vfSourcerouterItem->setApplicationApplicationId($appAppObj->getID());
		$vfSourcerouterItem->save();



		$coreComponent = $this->getCore()->getModel("core.component");
		$coreComponent->setComponentName("a9os_app_vf_modules_tags_folderaddon");
		$coreComponent->setDesignPath(".a9os-main .a9os_app_vf_desktop > .window-folderaddons-components");
		$coreComponent->setOnlyOne(1);
		$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon");
		$coreComponent->save();

		$folderaddonsInstaller = $this->getCore()->getModel("a9os.app.vf.window.folderaddons");
		$folderaddonsInstaller->installAddon($coreComponent);


		$coreComponent = $this->getCore()->getModel("core.component");
		$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon::addNewTagToFile");
		$coreComponent->save();

		$coreController = $this->getCore()->getModel("core.controller");
		$coreController->setPath("/vf/modules/tags/addnew");
		$coreController->save();

		$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponent->setCoreControllerId($coreController->getID());
		$coreControllerComponent->setCoreComponentId($coreComponent->getID());
		$coreControllerComponent->setOrder(0);
		$coreControllerComponent->save();

		$coreControllerApplication->addNew($coreController, $appAppObj, false);


		$coreComponent = $this->getCore()->getModel("core.component");
		$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon::deleteTag");
		$coreComponent->save();

		$coreController = $this->getCore()->getModel("core.controller");
		$coreController->setPath("/vf/modules/tags/delete");
		$coreController->save();

		$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponent->setCoreControllerId($coreController->getID());
		$coreControllerComponent->setCoreComponentId($coreComponent->getID());
		$coreControllerComponent->setOrder(0);
		$coreControllerComponent->save();

		$coreControllerApplication->addNew($coreController, $appAppObj, false);


		return true;
	}


	public function update($appApp){
		$arrInstalledVersion = json_decode($appApp->getAppVersion(), true);
		$arrCodeUpdateVersion = self::arrVersion;

		if ($arrInstalledVersion == $arrCodeUpdateVersion) return false;

		$installedVersionInt = $this->getCore()->arrVersionToInt($arrInstalledVersion);


		$this->arrChangelog["0.1.1"] = "agrego appappID de vf alsourcerouter item \"TAGS\"";
		if ($installedVersionInt < 10001) {
			/*$sourcerouterItem = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item")->load("TAGS", "path_prefix");
			$sourcerouterItem->setApplicationApplicationId($appApp->getID());
			$sourcerouterItem->save();*/
		}


		$this->arrChangelog["0.1.2"] = "Arreglo nombre de datamodels en core.component";
		if ($installedVersionInt < 10002) {
			/*$arrDataModelsToFix = [
				"a9os_app_vf_filesources_tags_copymove::checkProblems" => "a9os.app.vf.filesources.tags.copymove::checkProblems",
				"a9os_app_vf_filesources_tags_copymove::finalMove" => "a9os.app.vf.filesources.tags.copymove::finalMove",
				"a9os_app_vf_filesources_tags_delete" => "a9os.app.vf.filesources.tags.delete",
				"a9os_app_vf_filesources_tags_download" => "a9os.app.vf.filesources.tags.download",
				"a9os_app_vf_filesources_tags_file::fileGetContents" => "a9os.app.vf.filesources.tags_file::fileGetContents",
				"a9os_app_vf_filesources_tags_file::filePutContents" => "a9os.app.vf.filesources.tags.file::filePutContents",
				"a9os_app_vf_filesources_tags_folder" => "a9os.app.vf.filesources.tags.folder",
				"a9os_app_vf_filesources_tags_registry" => "a9os.app.vf.filesources.tags.registry",
				"a9os_app_vf_filesources_tags_file::rename" => "a9os.app.vf.filesources.tags.file::rename",
				"a9os_app_vf_filesources_tags_file::newItem" => "a9os.app.vf.filesources.tags.file::newItem",
				"a9os_app_vf_filesources_tags_folder::updateData" => "a9os.app.vf.filesources.tags.folder::updateData"
			];

			foreach ($arrDataModelsToFix as $oldDTM => $newDTM) {
				$coreComponent = $this->getCore()->getModel("core.component")->load($oldDTM, "data_model");
				$coreComponent->setDataModel($newDTM);
				$coreComponent->save();
			}*/
		}




		$this->arrChangelog["0.1.3"] = "instalo new component de folderaddon para tags";
		if ($installedVersionInt < 10003) {
			/*$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setComponentName("a9os_app_vf_modules_tags_folderaddon");
			$coreComponent->setOnlyOne(1);
			$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon");
			$coreComponent->save();

			$folderaddonsInstaller = $this->getCore()->getModel("a9os.app.vf.window.folderaddons");
			$folderaddonsInstaller->installAddon($coreComponent);*/

		}




		$this->arrChangelog["0.1.4"] = "agrego html para el component";
		if ($installedVersionInt < 10004) {
			/*$coreComponent = $this->getCore()->getModel("core.component")->load("a9os_app_vf_modules_tags_folderaddon", "component_name");
			$coreComponent->setDesignPath(".a9os-main .a9os_app_vf_desktop > .window-folderaddons-components");
			$coreComponent->save();*/
		}





		$this->arrChangelog["0.1.5"] = "filesources_tags to modules_tags";
		if ($installedVersionInt < 10005) {
			/*$arrDataModelsToFix = [
				"a9os.app.vf.filesources.tags.copymove::checkProblems" => "a9os.app.vf.modules.tags.copymove::checkProblems",
				"a9os.app.vf.filesources.tags.copymove::finalMove" => "a9os.app.vf.modules.tags.copymove::finalMove",
				"a9os.app.vf.filesources.tags.delete" => "a9os.app.vf.modules.tags.delete",
				"a9os.app.vf.filesources.tags.download" => "a9os.app.vf.modules.tags.download",
				"a9os.app.vf.filesources.tags_file::fileGetContents" => "a9os.app.vf.modules.tags.file::fileGetContents",
				"a9os.app.vf.filesources.tags.file::filePutContents" => "a9os.app.vf.modules.tags.file::filePutContents",
				"a9os.app.vf.filesources.tags.folder" => "a9os.app.vf.modules.tags.folder",
				"a9os.app.vf.filesources.tags.registry" => "a9os.app.vf.modules.tags.registry",
				"a9os.app.vf.filesources.tags.file::rename" => "a9os.app.vf.modules.tags.file::rename",
				"a9os.app.vf.filesources.tags.file::newItem" => "a9os.app.vf.modules.tags.file::newItem",
				"a9os.app.vf.filesources.tags.folder::updateData" => "a9os.app.vf.modules.tags.folder::updateData"
			];

			foreach ($arrDataModelsToFix as $oldDTM => $newDTM) {
				$coreComponent = $this->getCore()->getModel("core.component")->load($oldDTM, "data_model");
				$coreComponent->setDataModel($newDTM);
				$coreComponent->save();
			}*/
		}




		$this->arrChangelog["0.1.6"] = "Agrego controller para submit new tag a file";
		if ($installedVersionInt < 10006) {
			/*$coreControllerApplication = $this->getCore()->getModel("core.controller.application");


			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon::addNewTagToFile");
			$coreComponent->save();

			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/modules/tags/addnew");
			$coreController->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);*/
		}

		$this->arrChangelog["0.1.7"] = "Agrego controller para borrar tag";
		if ($installedVersionInt < 10007) {
		/*	$coreControllerApplication = $this->getCore()->getModel("core.controller.application");


			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.app.vf.modules.tags.folderaddon::deleteTag");
			$coreComponent->save();

			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/modules/tags/delete");
			$coreController->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);*/
		}

		return true;
	}
}