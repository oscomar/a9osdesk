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

class a9os_app_vf_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 14];
	
	const appName = "Navegador de Archivos";
	const iconUrl = "/resources/a9os/app/vf/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");
		$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");
		$appAppExtension = $this->getCore()->getModel("application.application.extension");


		$coreComponentVfMain = $this->getCore()->getModel("core.component");
		$coreComponentVfMain->setComponentName("a9os_app_vf_main");
		$coreComponentVfMain->setOnlyOne(1);
		$coreComponentVfMain->setDataModel("a9os.app.vf.main");
		$coreComponentVfMain->save();

		$coreComponentDependVfMain = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependVfMain->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependVfMain->setChildId($coreComponentVfMain->getID());
		$coreComponentDependVfMain->setOrder(2);
		$coreComponentDependVfMain->save();


		$coreComponentVfDesktop = $this->getCore()->getModel("core.component");
		$coreComponentVfDesktop->setComponentName("a9os_app_vf_desktop");
		$coreComponentVfDesktop->setDesignPath("#main-content .a9os-main");
		$coreComponentVfDesktop->setOnlyOne(1);
		$coreComponentVfDesktop->setDataModel("a9os.app.vf.desktop");
		$coreComponentVfDesktop->save();

		$coreComponentDependVfDesktop = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependVfDesktop->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependVfDesktop->setChildId($coreComponentVfDesktop->getID());
		$coreComponentDependVfDesktop->setOrder(3);
		$coreComponentDependVfDesktop->save();


		$coreComponentVfWindow = $this->getCore()->getModel("core.component");
		$coreComponentVfWindow->setComponentName("a9os_app_vf_window");
		$coreComponentVfWindow->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentVfWindow->setOnlyOne(0);
		$coreComponentVfWindow->setDataModel("a9os.app.vf.window");
		$coreComponentVfWindow->save();

		$coreControllerVfWindow = $this->getCore()->getModel("core.controller");
		$coreControllerVfWindow->setPath("/vf");
		$coreControllerVfWindow->save();

		$coreControllerComponentVfWindow = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfWindow->setCoreControllerId($coreControllerVfWindow->getID());
		$coreControllerComponentVfWindow->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentVfWindow->setOrder(0);
		$coreControllerComponentVfWindow->save();

		$coreControllerComponentVfWindow = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfWindow->setCoreControllerId($coreControllerVfWindow->getID());
		$coreControllerComponentVfWindow->setCoreComponentId($coreComponentVfWindow->getID());
		$coreControllerComponentVfWindow->setOrder(1);
		$coreControllerComponentVfWindow->save();

		$coreControllerApplication->addNew($coreControllerVfWindow, $appAppObj, true);


		$coreComponentVfFolder = $this->getCore()->getModel("core.component");
		$coreComponentVfFolder->setDataModel("a9os.app.vf.folder");
		$coreComponentVfFolder->save();

		$coreControllerVfFolder = $this->getCore()->getModel("core.controller");
		$coreControllerVfFolder->setPath("/vf/folder");
		$coreControllerVfFolder->save();

		$coreControllerComponentVfFolder = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfFolder->setCoreControllerId($coreControllerVfFolder->getID());
		$coreControllerComponentVfFolder->setCoreComponentId($coreComponentVfFolder->getID());
		$coreControllerComponentVfFolder->setOrder(0);
		$coreControllerComponentVfFolder->save();

		$coreControllerApplication->addNew($coreControllerVfFolder, $appAppObj, false);


		$coreComponentVfFolderUpdate = $this->getCore()->getModel("core.component");
		$coreComponentVfFolderUpdate->setDataModel("a9os.app.vf.folder::updateData");
		$coreComponentVfFolderUpdate->save();

		$coreControllerVfFolderUpdate = $this->getCore()->getModel("core.controller");
		$coreControllerVfFolderUpdate->setPath("/vf/update");
		$coreControllerVfFolderUpdate->save();

		$coreControllerComponentVfFolderUpdate = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfFolderUpdate->setCoreControllerId($coreControllerVfFolderUpdate->getID());
		$coreControllerComponentVfFolderUpdate->setCoreComponentId($coreComponentVfFolderUpdate->getID());
		$coreControllerComponentVfFolderUpdate->setOrder(0);
		$coreControllerComponentVfFolderUpdate->save();

		$coreControllerApplication->addNew($coreControllerVfFolderUpdate, $appAppObj, false);


		$coreComponentVfOpenwith = $this->getCore()->getModel("core.component");
		$coreComponentVfOpenwith->setComponentName("a9os_app_vf_openwith");
		$coreComponentVfOpenwith->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentVfOpenwith->setOnlyOne(0);
		$coreComponentVfOpenwith->setDataModel("a9os.app.vf.openwith");
		$coreComponentVfOpenwith->save();

		$coreControllerVfOpenwith = $this->getCore()->getModel("core.controller");
		$coreControllerVfOpenwith->setPath("/vf/openwith");
		$coreControllerVfOpenwith->save();

		$coreControllerComponentVfOpenwith = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfOpenwith->setCoreControllerId($coreControllerVfOpenwith->getID());
		$coreControllerComponentVfOpenwith->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentVfOpenwith->setOrder(0);
		$coreControllerComponentVfOpenwith->save();

		$coreControllerComponentVfOpenwith = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfOpenwith->setCoreControllerId($coreControllerVfOpenwith->getID());
		$coreControllerComponentVfOpenwith->setCoreComponentId($coreComponentVfOpenwith->getID());
		$coreControllerComponentVfOpenwith->setOrder(1);
		$coreControllerComponentVfOpenwith->save();

		$coreControllerApplication->addNew($coreControllerVfOpenwith, $appAppObj, false);


		$coreComponentVfFilegetcontents = $this->getCore()->getModel("core.component");
		$coreComponentVfFilegetcontents->setDataModel("a9os.app.vf.main::fileGetContents");
		$coreComponentVfFilegetcontents->save();

		$coreControllerVfFilegetcontents = $this->getCore()->getModel("core.controller");
		$coreControllerVfFilegetcontents->setPath("/vf/fileGetContents");
		$coreControllerVfFilegetcontents->save();

		$coreControllerComponentVfFilegetcontents = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfFilegetcontents->setCoreControllerId($coreControllerVfFilegetcontents->getID());
		$coreControllerComponentVfFilegetcontents->setCoreComponentId($coreComponentVfFilegetcontents->getID());
		$coreControllerComponentVfFilegetcontents->setOrder(0);
		$coreControllerComponentVfFilegetcontents->save();

		$coreControllerApplication->addNew($coreControllerVfFilegetcontents, $appAppObj, false);


		$coreComponentVfUpdateapp = $this->getCore()->getModel("core.component");
		$coreComponentVfUpdateapp->setDataModel("a9os.app.vf.file::updateDefaultApp");
		$coreComponentVfUpdateapp->save();

		$coreControllerVfUpdateapp = $this->getCore()->getModel("core.controller");
		$coreControllerVfUpdateapp->setPath("/vf/updateDefaultApp");
		$coreControllerVfUpdateapp->save();

		$coreControllerComponentVfUpdateapp = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfUpdateapp->setCoreControllerId($coreControllerVfUpdateapp->getID());
		$coreControllerComponentVfUpdateapp->setCoreComponentId($coreComponentVfUpdateapp->getID());
		$coreControllerComponentVfUpdateapp->setOrder(0);
		$coreControllerComponentVfUpdateapp->save();

		$coreControllerApplication->addNew($coreControllerVfUpdateapp, $appAppObj, false);


		$coreComponentVfFileputcontents = $this->getCore()->getModel("core.component");
		$coreComponentVfFileputcontents->setDataModel("a9os.app.vf.main::filePutContents");
		$coreComponentVfFileputcontents->save();

		$coreControllerVfFileputcontents = $this->getCore()->getModel("core.controller");
		$coreControllerVfFileputcontents->setPath("/vf/filePutContents");
		$coreControllerVfFileputcontents->save();

		$coreControllerComponentVfFileputcontents = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfFileputcontents->setCoreControllerId($coreControllerVfFileputcontents->getID());
		$coreControllerComponentVfFileputcontents->setCoreComponentId($coreComponentVfFileputcontents->getID());
		$coreControllerComponentVfFileputcontents->setOrder(0);
		$coreControllerComponentVfFileputcontents->save();

		$coreControllerApplication->addNew($coreControllerVfFileputcontents, $appAppObj, false);


		$coreComponentVfRegistry = $this->getCore()->getModel("core.component");
		$coreComponentVfRegistry->setDataModel("a9os.app.vf.registry");
		$coreComponentVfRegistry->save();

		$coreControllerVfRegistry = $this->getCore()->getModel("core.controller");
		$coreControllerVfRegistry->setPath("/vf/getRegistry");
		$coreControllerVfRegistry->save();

		$coreControllerComponentVfRegistry = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfRegistry->setCoreControllerId($coreControllerVfRegistry->getID());
		$coreControllerComponentVfRegistry->setCoreComponentId($coreComponentVfRegistry->getID());
		$coreControllerComponentVfRegistry->setOrder(0);
		$coreControllerComponentVfRegistry->save();

		$coreControllerApplication->addNew($coreControllerVfRegistry, $appAppObj, false);



		$coreComponentVfDialog = $this->getCore()->getModel("core.component");
		$coreComponentVfDialog->setComponentName("a9os_app_vf_dialog");
		$coreComponentVfDialog->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentVfDialog->setOnlyOne(0);
		$coreComponentVfDialog->setDataModel("a9os.app.vf.dialog");
		$coreComponentVfDialog->save();

		$coreControllerVfDialog = $this->getCore()->getModel("core.controller");
		$coreControllerVfDialog->setPath("/vf/dialog");
		$coreControllerVfDialog->save();

		$coreControllerComponentVfDialog = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfDialog->setCoreControllerId($coreControllerVfDialog->getID());
		$coreControllerComponentVfDialog->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentVfDialog->setOrder(0);
		$coreControllerComponentVfDialog->save();

		$coreControllerComponentVfDialog = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfDialog->setCoreControllerId($coreControllerVfDialog->getID());
		$coreControllerComponentVfDialog->setCoreComponentId($coreComponentVfDialog->getID());
		$coreControllerComponentVfDialog->setOrder(1);
		$coreControllerComponentVfDialog->save();

		$coreControllerApplication->addNew($coreControllerVfDialog, $appAppObj, false);


		$coreComponentVfDelete = $this->getCore()->getModel("core.component");
		$coreComponentVfDelete->setDataModel("a9os.app.vf.delete");
		$coreComponentVfDelete->save();

		$coreControllerVfDelete = $this->getCore()->getModel("core.controller");
		$coreControllerVfDelete->setPath("/vf/delete");
		$coreControllerVfDelete->save();

		$coreControllerComponentVfDelete = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfDelete->setCoreControllerId($coreControllerVfDelete->getID());
		$coreControllerComponentVfDelete->setCoreComponentId($coreComponentVfDelete->getID());
		$coreControllerComponentVfDelete->setOrder(0);
		$coreControllerComponentVfDelete->save();

		$coreControllerApplication->addNew($coreControllerVfDelete, $appAppObj, false);


		$coreComponentVfMove = $this->getCore()->getModel("core.component");
		$coreComponentVfMove->setDataModel("a9os.app.vf.move");
		$coreComponentVfMove->save();

		$coreControllerVfMove = $this->getCore()->getModel("core.controller");
		$coreControllerVfMove->setPath("/vf/move");
		$coreControllerVfMove->save();

		$coreControllerComponentVfMove = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfMove->setCoreControllerId($coreControllerVfMove->getID());
		$coreControllerComponentVfMove->setCoreComponentId($coreComponentVfMove->getID());
		$coreControllerComponentVfMove->setOrder(0);
		$coreControllerComponentVfMove->save();

		$coreControllerApplication->addNew($coreControllerVfMove, $appAppObj, false);


		$coreComponentVfNewitem = $this->getCore()->getModel("core.component");
		$coreComponentVfNewitem->setDataModel("a9os.app.vf.newitem");
		$coreComponentVfNewitem->save();

		$coreControllerVfNewitem = $this->getCore()->getModel("core.controller");
		$coreControllerVfNewitem->setPath("/vf/newitem");
		$coreControllerVfNewitem->save();

		$coreControllerComponentVfNewitem = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfNewitem->setCoreControllerId($coreControllerVfNewitem->getID());
		$coreControllerComponentVfNewitem->setCoreComponentId($coreComponentVfNewitem->getID());
		$coreControllerComponentVfNewitem->setOrder(0);
		$coreControllerComponentVfNewitem->save();

		$coreControllerApplication->addNew($coreControllerVfNewitem, $appAppObj, false);


		$coreComponentVfDownload = $this->getCore()->getModel("core.component");
		$coreComponentVfDownload->setDataModel("a9os.app.vf.download");
		$coreComponentVfDownload->save();

		$coreControllerVfDownload = $this->getCore()->getModel("core.controller");
		$coreControllerVfDownload->setPath("/vf/download");
		$coreControllerVfDownload->save();

		$coreControllerComponentVfDownload = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfDownload->setCoreControllerId($coreControllerVfDownload->getID());
		$coreControllerComponentVfDownload->setCoreComponentId($coreComponentVfDownload->getID());
		$coreControllerComponentVfDownload->setOrder(0);
		$coreControllerComponentVfDownload->save();

		$coreControllerApplication->addNew($coreControllerVfDownload, $appAppObj, false);


		$coreComponentVfCheckproblems = $this->getCore()->getModel("core.component");
		$coreComponentVfCheckproblems->setDataModel("a9os.app.vf.copymove::checkProblems");
		$coreComponentVfCheckproblems->save();

		$coreControllerVfCheckproblems = $this->getCore()->getModel("core.controller");
		$coreControllerVfCheckproblems->setPath("/vf/copyMove/checkProblems");
		$coreControllerVfCheckproblems->save();

		$coreControllerComponentVfCheckproblems = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfCheckproblems->setCoreControllerId($coreControllerVfCheckproblems->getID());
		$coreControllerComponentVfCheckproblems->setCoreComponentId($coreComponentVfCheckproblems->getID());
		$coreControllerComponentVfCheckproblems->setOrder(0);
		$coreControllerComponentVfCheckproblems->save();

		$coreControllerApplication->addNew($coreControllerVfCheckproblems, $appAppObj, false);


		$coreComponentVfCheckdialog = $this->getCore()->getModel("core.component");
		$coreComponentVfCheckdialog->setComponentName("a9os_app_vf_copymove_checkdialog");
		$coreComponentVfCheckdialog->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentVfCheckdialog->setOnlyOne(0);
		$coreComponentVfCheckdialog->setDataModel("a9os.app.vf.copymove.checkdialog");
		$coreComponentVfCheckdialog->save();

		$coreControllerVfCheckdialog = $this->getCore()->getModel("core.controller");
		$coreControllerVfCheckdialog->setPath("/vf/copyMove/checkDialog");
		$coreControllerVfCheckdialog->save();

		$coreControllerComponentVfCheckdialog = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfCheckdialog->setCoreControllerId($coreControllerVfCheckdialog->getID());
		$coreControllerComponentVfCheckdialog->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentVfCheckdialog->setOrder(0);
		$coreControllerComponentVfCheckdialog->save();

		$coreControllerComponentVfCheckdialog = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfCheckdialog->setCoreControllerId($coreControllerVfCheckdialog->getID());
		$coreControllerComponentVfCheckdialog->setCoreComponentId($coreComponentVfCheckdialog->getID());
		$coreControllerComponentVfCheckdialog->setOrder(1);
		$coreControllerComponentVfCheckdialog->save();

		$coreControllerApplication->addNew($coreControllerVfCheckdialog, $appAppObj, false);


		$coreComponentVfFinalmove = $this->getCore()->getModel("core.component");
		$coreComponentVfFinalmove->setDataModel("a9os.app.vf.copymove::finalMove");
		$coreComponentVfFinalmove->setIsAsyncOutput(1);
		$coreComponentVfFinalmove->save();

		$coreControllerVfFinalmove = $this->getCore()->getModel("core.controller");
		$coreControllerVfFinalmove->setPath("/vf/copyMove/finalMove");
		$coreControllerVfFinalmove->save();

		$coreControllerComponentVfFinalmove = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfFinalmove->setCoreControllerId($coreControllerVfFinalmove->getID());
		$coreControllerComponentVfFinalmove->setCoreComponentId($coreComponentVfFinalmove->getID());
		$coreControllerComponentVfFinalmove->setOrder(0);
		$coreControllerComponentVfFinalmove->save();

		$coreControllerApplication->addNew($coreControllerVfFinalmove, $appAppObj, false);


		$coreComponentVfBookmark = $this->getCore()->getModel("core.component");
		$coreComponentVfBookmark->setDataModel("a9os.app.vf.window.bookmark");
		$coreComponentVfBookmark->save();

		$coreControllerVfBookmark = $this->getCore()->getModel("core.controller");
		$coreControllerVfBookmark->setPath("/vf/bookmarks/update");
		$coreControllerVfBookmark->save();

		$coreControllerComponentVfBookmark = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentVfBookmark->setCoreControllerId($coreControllerVfBookmark->getID());
		$coreControllerComponentVfBookmark->setCoreComponentId($coreComponentVfBookmark->getID());
		$coreControllerComponentVfBookmark->setOrder(0);
		$coreControllerComponentVfBookmark->save();

		$coreControllerApplication->addNew($coreControllerVfBookmark, $appAppObj, false);


		return true;
	}

	public function update($appApp){

		$arrInstalledVersion = json_decode($appApp->getAppVersion(), true);
		$arrCodeUpdateVersion = self::arrVersion;

		if ($arrInstalledVersion == $arrCodeUpdateVersion) return false;

		$installedVersionInt = $this->getCore()->arrVersionToInt($arrInstalledVersion);
		

		$this->arrChangelog["0.1.1"] = "Normalizar data models para simplificar la creación de sourcerouter";
		if ($installedVersionInt < 10001) {
			$coreComponentMainGetCnts = $this->getCore()->getModel("core.component")->load("a9os.app.vf.main::fileGetContents", "data_model");
			$coreComponentMainGetCnts->setDataModel("a9os.app.vf.file::fileGetContents");
			$coreComponentMainGetCnts->save();

			$coreComponentMainPutCnts = $this->getCore()->getModel("core.component")->load("a9os.app.vf.main::filePutContents", "data_model");
			$coreComponentMainPutCnts->setDataModel("a9os.app.vf.file::filePutContents");
			$coreComponentMainPutCnts->save();

			$coreComponentVfNewitem = $this->getCore()->getModel("core.component")->load("a9os.app.vf.newitem", "data_model");
			$coreComponentVfNewitem->setDataModel("a9os.app.vf.file::newItem");
			$coreComponentVfNewitem->save();


			$coreControllerVfMove = $this->getCore()->getModel("core.controller")->load("/vf/move", "path");
			$coreControllerVfMove->setPath("/vf/rename");
			$coreControllerVfMove->save();

			$coreComponentVfMove = $this->getCore()->getModel("core.component")->load("a9os.app.vf.move", "data_model");
			$coreComponentVfMove->setDataModel("a9os.app.vf.file::rename");
			$coreComponentVfMove->save();
		}


		$this->arrChangelog["0.1.2"] = "Creo componente sourcerouter";
		if ($installedVersionInt < 10002) {
			$coreComponentSourcerouter = $this->getCore()->getModel("core.component");
			$coreComponentSourcerouter->setDataModel("a9os.app.vf.sourcerouter");
			$coreComponentSourcerouter->save();
		}


		$this->arrChangelog["0.1.3"] = "Cambio de todos los controllerComponent de vf a sourcerouter";
		if ($installedVersionInt < 10003) {
			$coreComponentSourcerouter = $this->getCore()->getModel("core.component")->load("a9os.app.vf.sourcerouter", "data_model");
			$coreControllerCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter")->getControllerCollection();

			while ($currController = $coreControllerCollection->fetch()) {
				$coreControllerComponent = $this->getCore()->getModel("core.controller.component")->load($currController->getID(), "core_controller_id");
				$coreControllerComponent->setCoreComponentId($coreComponentSourcerouter->getID());
				$coreControllerComponent->save();
			}
		}


		$this->arrChangelog["0.1.4"] = "Por un error en controllerCollection paso nuevo component id a /vf/rename devuelta";
		if ($installedVersionInt < 10004) {
			$coreComponentSourcerouter = $this->getCore()->getModel("core.component")->load("a9os.app.vf.sourcerouter", "data_model");
			$currController = $this->getCore()->getModel("core.controller")->load("/vf/rename", "path");

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component")->load($currController->getID(), "core_controller_id");
			$coreControllerComponent->setCoreComponentId($coreComponentSourcerouter->getID());
			$coreControllerComponent->save();
		}


		$this->arrChangelog["0.1.5"] = "instalación de sourcerouter controllercomponents para \"/\"";
		if ($installedVersionInt < 10005) {
			$coreControllerCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter")->getControllerCollection();
			$arrDataModels = [
				"/vf/copyMove/checkProblems" => "a9os.app.vf.copymove::checkProblems",
				"/vf/copyMove/finalMove" => "a9os.app.vf.copymove::finalMove",
				"/vf/delete" => "a9os.app.vf.delete",
				"/vf/download" => "a9os.app.vf.download",
				"/vf/fileGetContents" => "a9os.app.vf.file::fileGetContents",
				"/vf/filePutContents" => "a9os.app.vf.file::filePutContents",
				"/vf/folder" => "a9os.app.vf.folder",
				"/vf/getRegistry" => "a9os.app.vf.registry",
				"/vf/rename" => "a9os.app.vf.file::rename",
				"/vf/newitem" => "a9os.app.vf.file::newItem",
				"/vf/update" => "a9os.app.vf.folder::updateData",
			];

			while ($currController = $coreControllerCollection->fetch()) {
				$newSourceRouter = $this->getCore()->getModel("a9os.app.vf.sourcerouter");
				$newSourceRouter->setPathPrefix("/");
				$newSourceRouter->setCoreControllerId($currController->getID());

				$coreComponent = $this->getCore()->getModel("core.component")->load($arrDataModels[$currController->getPath()], "data_model");
				$newSourceRouter->setCoreComponentId($coreComponent->getID());
				$newSourceRouter->save();
			}
		}


		$this->arrChangelog["0.1.6"] = "creación de sourcerouter_item para \"/\"";
		if ($installedVersionInt < 10006) {
			$sourcerouterItem = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item");
			$sourcerouterItem->setPathPrefix("/");
			$sourcerouterItem->setName("Archivos");
			$sourcerouterItem->setIconUrl("/resources/a9os/app/vf/icons/sidebar-folder-icon.svg");
			$sourcerouterItem->save();
		}


		$this->arrChangelog["0.1.7"] = "nueva ventana para editar la lista de fuentes";
		if ($installedVersionInt < 10007) {
			$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");
			$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/sourceslist/edit");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setComponentName("a9os_app_vf_sourcerouter_edit_window");
			$coreComponent->setDesignPath(".a9os-main .window > .main-content");
			$coreComponent->setDataModel("a9os.app.vf.sourcerouter.edit.window");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponentA9osCoreMain->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(1);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);
		}


		$this->arrChangelog["0.1.8"] = "agrego appappID de vf alsourcerouter item \"/\"";
		if ($installedVersionInt < 10008) {
			$sourcerouterItem = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item")->load("/", "path_prefix");
			$sourcerouterItem->setApplicationApplicationId($appApp->getID());
			$sourcerouterItem->save();
		}


		$this->arrChangelog["0.1.9"] = "ventana de lista de fuentes -> submit controller";
		if ($installedVersionInt < 10009) {
			$coreControllerApplication = $this->getCore()->getModel("core.controller.application");
			
			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/sourceslist/edit/submit");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.app.vf.sourcerouter.edit.window::submit");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);
		}

		$this->arrChangelog["0.1.10"] = "Limpio todo preview_made por nueva ruta de thumbnails - borro vieja carpeta thumbs";
		if ($installedVersionInt < 10010) {
			$vfFileCollection = $this->getCore()->getModel("a9os.app.vf.file");
			$vfFileCollection->_setSelect("
				SELECT * from {$vfFileCollection->getTableName()}
				where preview_made = 1
			");

			while ($currVfFile = $vfFileCollection->fetch()) {
				$currVfFile->setPreviewMade(0);
				$currVfFile->save();
			}

			$oldThumbsPath = $this->getCore()->getRootFolder()."/resources/a9os/app/vf/thumbs";
			shell_exec("rm -rf ".$oldThumbsPath);
		}

		$this->arrChangelog["0.1.11"] = "Controller Configurar Escritorio";
		if ($installedVersionInt < 10011) {
			$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");
			$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/desktopsettings");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setComponentName("a9os_app_vf_desktop_settings");
			$coreComponent->setDesignPath(".a9os-main .window > .main-content");
			$coreComponent->setDataModel("a9os.app.vf.desktop.settings");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponentA9osCoreMain->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(1);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);
		}

		$this->arrChangelog["0.1.12"] = "Controller Configurar Escritorio - onlyOne";
		if ($installedVersionInt < 10012) {
			$coreComponent = $this->getCore()->getModel("core.component")->load("a9os_app_vf_desktop_settings", "component_name");
			$coreComponent->setOnlyOne(1);
			$coreComponent->save();
		}

		$this->arrChangelog["0.1.13"] = "Configurar Escritorio - selectuserwallpaper";
		if ($installedVersionInt < 10013) {
			$coreControllerApplication = $this->getCore()->getModel("core.controller.application");
			
			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/desktopsettings/selectuserwallpaper");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.app.vf.desktop.settings::selectUserWallpaper");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);
		}


		$this->arrChangelog["0.1.14"] = "Configurar Escritorio - saveData";
		if ($installedVersionInt < 10014) {
			$coreControllerApplication = $this->getCore()->getModel("core.controller.application");
			
			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/vf/desktopsettings/savedata");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.app.vf.desktop.settings::saveData");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();

			$coreControllerApplication->addNew($coreController, $appApp, false);
		}

		return true;
	}
}