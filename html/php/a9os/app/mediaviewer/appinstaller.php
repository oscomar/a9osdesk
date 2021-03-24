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

class a9os_app_mediaviewer_appinstaller extends a9os_core_app_installer_base {
	const arrBaseVersion = [0, 1, 0];
	const arrVersion = [0, 1, 0];
	
	const appName = "Media Viewer";
	const iconUrl = "/resources/a9os/app/mediaviewer/icon.svg";
	const appScopePublic = true;

	public function install($appAppObj){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["application_application"]
		]);

		$coreControllerApplication = $this->getCore()->getModel("core.controller.application");

		$coreComponentMediaviewerMain = $this->getCore()->getModel("core.component");
		$coreComponentMediaviewerMain->setComponentName("a9os_app_mediaviewer_main");
		$coreComponentMediaviewerMain->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentMediaviewerMain->setDataModel("a9os.app.mediaviewer.main");
		$coreComponentMediaviewerMain->save();

		$coreControllerMediaviewerMain = $this->getCore()->getModel("core.controller");
		$coreControllerMediaviewerMain->setPath("/mediaviewer");
		$coreControllerMediaviewerMain->save();

		$coreComponentA9osMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		$coreControllerComponentMediaviewerMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentMediaviewerMain->setCoreControllerId($coreControllerMediaviewerMain->getID());
		$coreControllerComponentMediaviewerMain->setCoreComponentId($coreComponentA9osMain->getID());
		$coreControllerComponentMediaviewerMain->setOrder(0);
		$coreControllerComponentMediaviewerMain->save();

		$coreControllerComponentMediaviewerMain = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentMediaviewerMain->setCoreControllerId($coreControllerMediaviewerMain->getID());
		$coreControllerComponentMediaviewerMain->setCoreComponentId($coreComponentMediaviewerMain->getID());
		$coreControllerComponentMediaviewerMain->setOrder(1);
		$coreControllerComponentMediaviewerMain->save();


		$coreControllerApplication->addNew($coreControllerMediaviewerMain, $appAppObj, true);

		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$appAppExtension->addApplicationExtensions($appAppObj, [
			"MP4" => [
				"icon_file" => "file-video-icon.svg"
			],
			"MP3" => [
				"icon_file" => "file-audio-icon.svg"
			],
			"OGG" => [
				"icon_file" => "file-audio-icon.svg"
			],
			"OGV" => [
				"icon_file" => "file-video-icon.svg"
			],
			"WEBM" => [
				"icon_file" => "file-video-icon.svg"
			],
			"M4V" => [
				"icon_file" => "file-video-icon.svg"
			],
			"M4A" => [
				"icon_file" => "file-audio-icon.svg"
			],
			"WAV" => [
				"icon_file" => "file-audio-icon.svg"
			]
		]);

		return true;
	}
}