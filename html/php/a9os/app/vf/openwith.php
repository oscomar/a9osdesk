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

class a9os_app_vf_openwith extends a9os_core_window {
	public function main($data){
		if (!$data["data"]["file"]){
			return false;
		}
		
		$filePath = base64_decode($data["data"]["file"]);


		$fileExtension = $this->getCore()->getModel("application.application.extension")->getFileExtensionByPath($filePath);


		$appExtension = $this->getCore()->getModel("application.application.extension");
		$appApp = $this->getCore()->getModel("application.application");
		$coreController = $this->getCore()->getModel("core.controller");
		$cca = $this->getCore()->getModel("core.controller.application");
		$aau = $this->getCore()->getModel("application.application.user");

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$arrApps = [];
		if (isset($data["data"]["all"]) && $data["data"]["all"]) { // todas las apps - TODO

			$appCollection = $appApp->_setSelect("
				SELECT aa.*, cc.path 
				from {$appApp->getTableName()} aa
			");

		} else {
			$appCollection = $appApp->_setSelect("
				SELECT distinct aa.*, cc.path 
				from {$appApp->getTableName()} aa 
				left join {$appExtension->getTableName()} ae 
					on (aa.{$appApp->getPrimaryIdx()} = ae.{$appApp->getPrimaryIdx()})

				left join {$cca->getTableName()} cca
					on (cca.{$appApp->getPrimaryIdx()} = aa.{$appApp->getPrimaryIdx()} and cca.is_main_window = 1)

				left join {$coreController->getTableName()} cc 
					on (cc.{$coreController->getPrimaryIdx()} = cca.{$coreController->getPrimaryIdx()})

				LEFT JOIN {$aau->getTableName()} aau
					ON (aau.{$appApp->getPrimaryIdx()} = aa.{$appApp->getPrimaryIdx()} )

				where ae.file_extension = {$this->_quote($fileExtension)}
				AND (aau.{$a9osUser->getPrimaryIdx()} IS NULL OR aau.{$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()})
			");
		}
		while ($currApp = $appCollection->fetch()) {
			$currApp->setPathData([
				"file" => $filePath  //#!#!# AND FOLDER
			]);
			$arrApps[] = $currApp->getData();
		}

		return [
			"window" => [
				"title" => "Abrir con...",
				"favicon-url" => "/resources/a9os/app/vf/icons/gear-icon.svg",
				"resize" => "false",
				"width" => "300px",
				"height" => "450px",
				"position" => "center",
				"windowColor" => "rgba(40,40,40,0.8)"
			],
			"apps" => $arrApps,
			"filePath" => $filePath
		];
	}
}