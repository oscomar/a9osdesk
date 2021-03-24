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

class a9os_app_imgviewer_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 0];
	
	const appName = "Visor de fotos";
	const iconUrl = "/resources/a9os/app/imgviewer/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$coreComponentImgviewerMain = $this->getCore()->getModel("core.component");
		$coreComponentImgviewerMain->setComponentName("a9os_app_imgviewer_main");
		$coreComponentImgviewerMain->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentImgviewerMain->setDataModel("a9os.app.imgviewer.main");
		$coreComponentImgviewerMain->save();

		$coreControllerImgviewerMain = $this->getCore()->getModel("core.controller");
		$coreControllerImgviewerMain->setPath("/imgviewer");
		$coreControllerImgviewerMain->save();

		$coreComponentA9osMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		$coreControllerComponentTxedMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentTxedMain->setCoreControllerId($coreControllerImgviewerMain->getID());
		$coreControllerComponentTxedMain->setCoreComponentId($coreComponentA9osMain->getID());
		$coreControllerComponentTxedMain->setOrder(0);
		$coreControllerComponentTxedMain->save();

		$coreControllerComponentTxedMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentTxedMain->setCoreControllerId($coreControllerImgviewerMain->getID());
		$coreControllerComponentTxedMain->setCoreComponentId($coreComponentImgviewerMain->getID());
		$coreControllerComponentTxedMain->setOrder(1);
		$coreControllerComponentTxedMain->save();


		$coreControllerApplication->addNew($coreControllerImgviewerMain, $appAppObj, true);

		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$appAppExtension->addApplicationExtensions($appAppObj, [
			"JPG" => [
				"icon_file" => "img-icon.svg",
				"make_preview_model" => "a9os.app.vf.file.extension.preview.imagick"
			],
			"PNG" => [
				"icon_file" => "img-icon.svg",
				"make_preview_model" => "a9os.app.vf.file.extension.preview.imagick"
			],
			"GIF" => [
				"icon_file" => "img-icon.svg",
				"make_preview_model" => "a9os.app.vf.file.extension.preview.imagick"
			],
			"SVG" => [
				"icon_file" => "img-icon.svg",
				"make_preview_model" => "a9os.app.vf.file.extension.preview.imagick"
			],
			"BMP" => [
				"icon_file" => "img-icon.svg",
				"make_preview_model" => "a9os.app.vf.file.extension.preview.imagick"
			]
		]);

		return true;
	}
}