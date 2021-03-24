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

class a9os_app_browser1_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 0];
	
	const appName = "Web Browser";
	const iconUrl = "/resources/a9os/app/browser1/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$coreComponentBrowser1Main = $this->getCore()->getModel("core.component");
		$coreComponentBrowser1Main->setComponentName("a9os_app_browser1_main");
		$coreComponentBrowser1Main->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentBrowser1Main->setDataModel("a9os.app.browser1.main");
		$coreComponentBrowser1Main->save();


		$coreControllerBrowser1Main = $this->getCore()->getModel("core.controller");
		$coreControllerBrowser1Main->setPath("/browser1");
		$coreControllerBrowser1Main->save();

		$coreComponentA9osMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		$coreControllerComponentBrowser1Main = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentBrowser1Main->setCoreControllerId($coreControllerBrowser1Main->getID());
		$coreControllerComponentBrowser1Main->setCoreComponentId($coreComponentA9osMain->getID());
		$coreControllerComponentBrowser1Main->setOrder(0);
		$coreControllerComponentBrowser1Main->save();

		$coreControllerComponentBrowser1Main = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentBrowser1Main->setCoreControllerId($coreControllerBrowser1Main->getID());
		$coreControllerComponentBrowser1Main->setCoreComponentId($coreComponentBrowser1Main->getID());
		$coreControllerComponentBrowser1Main->setOrder(1);
		$coreControllerComponentBrowser1Main->save();


		$coreControllerApplication->addNew($coreControllerBrowser1Main, $appAppObj, true);

		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$appAppExtension->addApplicationExtensions($appAppObj, [
			"HTML" => [
				"icon_file" => "file-icon-html.svg"
			], 
			"URL" => []
		]);


		$coreComponentBrowser1Home = $this->getCore()->getModel("core.component");
		$coreComponentBrowser1Home->setComponentName("a9os_app_browser1_home");
		$coreComponentBrowser1Home->setDesignPath("#main-content");
		$coreComponentBrowser1Home->setClearPath("#main-content");
		$coreComponentBrowser1Home->setDataModel("a9os.app.browser1.home");
		$coreComponentBrowser1Home->save();

		$coreControllerBrowser1Home = $this->getCore()->getModel("core.controller");
		$coreControllerBrowser1Home->setPath("/browser1/home");
		$coreControllerBrowser1Home->save();

		$coreControllerComponentBrowser1Browser = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentBrowser1Browser->setCoreControllerId($coreControllerBrowser1Home->getID());
		$coreControllerComponentBrowser1Browser->setCoreComponentId($coreComponentBrowser1Home->getID());
		$coreControllerComponentBrowser1Browser->setOrder(0);
		$coreControllerComponentBrowser1Browser->save();

		$coreControllerApplication->addNew($coreControllerBrowser1Home, $appAppObj, false);
		

		return true;
	}
}