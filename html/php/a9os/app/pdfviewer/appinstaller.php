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

class a9os_app_pdfviewer_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 0];
	
	const appName = "Visor PDF";
	const iconUrl = "/resources/a9os/app/pdf-viewer/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$coreComponentPdfviewerMain = $this->getCore()->getModel("core.component");
		$coreComponentPdfviewerMain->setComponentName("a9os_app_pdfviewer_main");
		$coreComponentPdfviewerMain->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentPdfviewerMain->setDataModel("a9os.app.pdfviewer.main");
		$coreComponentPdfviewerMain->save();

		$coreControllerPdfviewerMain = $this->getCore()->getModel("core.controller");
		$coreControllerPdfviewerMain->setPath("/pdf-viewer");
		$coreControllerPdfviewerMain->save();

		$coreComponentA9osMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		$coreControllerComponentPdfviewerMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentPdfviewerMain->setCoreControllerId($coreControllerPdfviewerMain->getID());
		$coreControllerComponentPdfviewerMain->setCoreComponentId($coreComponentA9osMain->getID());
		$coreControllerComponentPdfviewerMain->setOrder(0);
		$coreControllerComponentPdfviewerMain->save();

		$coreControllerComponentPdfviewerMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentPdfviewerMain->setCoreControllerId($coreControllerPdfviewerMain->getID());
		$coreControllerComponentPdfviewerMain->setCoreComponentId($coreComponentPdfviewerMain->getID());
		$coreControllerComponentPdfviewerMain->setOrder(1);
		$coreControllerComponentPdfviewerMain->save();


		$coreControllerApplication->addNew($coreControllerPdfviewerMain, $appAppObj, true);

		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$appAppExtension->addApplicationExtensions($appAppObj, [
			"PDF" => [
				"icon_file" => "file-icon-pdf.svg"
			]
		]);


		return true;
	}
}