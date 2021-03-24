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

class a9os_app_texteditor_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 0];
	
	const appName = "Editor de texto";
	const iconUrl = "/resources/a9os/app/texteditor/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$coreComponentTxedMain = $this->getCore()->getModel("core.component");
		$coreComponentTxedMain->setComponentName("a9os_app_texteditor_main");
		$coreComponentTxedMain->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentTxedMain->setDataModel("a9os.app.texteditor.main");
		$coreComponentTxedMain->save();

		$coreControllerTxedMain = $this->getCore()->getModel("core.controller");
		$coreControllerTxedMain->setPath("/texteditor");
		$coreControllerTxedMain->save();

		$coreComponentA9osMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		$coreControllerComponentTxedMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentTxedMain->setCoreControllerId($coreControllerTxedMain->getID());
		$coreControllerComponentTxedMain->setCoreComponentId($coreComponentA9osMain->getID());
		$coreControllerComponentTxedMain->setOrder(0);
		$coreControllerComponentTxedMain->save();

		$coreControllerComponentTxedMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentTxedMain->setCoreControllerId($coreControllerTxedMain->getID());
		$coreControllerComponentTxedMain->setCoreComponentId($coreComponentTxedMain->getID());
		$coreControllerComponentTxedMain->setOrder(1);
		$coreControllerComponentTxedMain->save();


		$coreControllerApplication->addNew($coreControllerTxedMain, $appAppObj, true);

		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$appAppExtension->addApplicationExtensions($appAppObj, [
			"TXT" => [
				"icon_file" => "file-icon-txt.svg"
			],
			"HTML" => [
				"icon_file" => "file-icon-txt.svg"
			],
			"CSV" => [
				"icon_file" => "file-icon-xls.svg"
			],
			"ADRP" => [
				"icon_file" => "file-icon-txt.svg"
			]
		]);

		return true;
	}
}