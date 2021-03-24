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

class a9os_app_vf_desktop_settings extends a9os_core_window {
	public function main($data){
		$vfDesktop = $this->getCore()->getModel("a9os.app.vf.desktop");
		$arrUserWallpaperData = $vfDesktop->getUserWallpaperData();
		$arrUserWallpaperData["arrSystemWallpapers"] = $vfDesktop->getAllSystemWallpapers();


		return [
			"window" => [
				"title" => "Configurar Escritorio",
				"favicon-url" => "/resources/a9os/app/vf/desktop/desktop-icon.svg",
				"resize" => "false",
				"width" => "650px",
				"height" => "560px",
				"position" => "center",
				"windowColor" => "rgba(200,200,200,0.7)"
			],
			"windowData" => $this->convertToWindowData($arrUserWallpaperData, $vfDesktop),
			"arrUserWallpaperData" => $arrUserWallpaperData
		];
	}

	public function convertToWindowData($arrUserWallpaperData, $vfDesktop){
		$arrReturn = [];
		$arrReturn["arrSystemWallpapers"] = [];

		foreach ($arrUserWallpaperData["arrSystemWallpapers"] as $k => $currSystemWallpaper) {
			$arrReturn["arrSystemWallpapers"][] = [
				"valueId" => $currSystemWallpaper,
				"thumbUrl" => $arrUserWallpaperData["systemWallpaperResourceFolder"]."thumbs/".$currSystemWallpaper,
				"selected" => ($currSystemWallpaper == $arrUserWallpaperData["wallpaperValue"])?"true":"false"
			];
		}

		$userWallpaperThumb = $vfDesktop->getUserWallpaperFolder(true)."thumb.jpg";
		if (!is_file($userWallpaperThumb)) $userWallpaperThumb = $this->getCore()->getRootFolder()."/resources/a9os/app/vf/desktop/img-icon.png";

		$arrReturn["userWallpaperThumbUrl"] = "data:image/png;base64,".base64_encode(file_get_contents($userWallpaperThumb));

		$a9osUserConfig = $this->getCore()->getModel("a9os.user.config");
		$arrReturn["userWallpaperFilePath"] = $a9osUserConfig->getConfig("a9os_app_vf_desktop.userWallpaperOriginalPath") ?? "";

		$arrReturn["colorValue"] = $arrUserWallpaperData["wallpaperBackgroundColor"];

		return $arrReturn;
	}


	public function selectUserWallpaper($data){
		$userWallpaperPath = $data["data"]["path"];
		$maxResW = $data["data"]["maxResW"];
		$maxResH = $data["data"]["maxResH"];

		$a9osUserConfig = $this->getCore()->getModel("a9os.user.config");
		$a9osUserConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResW", $maxResW, false);
		$a9osUserConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResH", $maxResH, false);
		$a9osUserConfig->setConfig("a9os_app_vf_desktop.userWallpaperOriginalPath", $userWallpaperPath, false);

		$vfDesktop = $this->getCore()->getModel("a9os.app.vf.desktop");
		$backendRealUserWallpaperFolder = $vfDesktop->getUserWallpaperFolder(true);

		$vfMain = $this->getCore()->getModel("a9os.app.vf.main");
		$completeWpPath = $vfMain->getUserFolder().$userWallpaperPath;

		try {		
			$img = new Imagick();

			$img->readImage($completeWpPath);
			$arrImageRes = $img->getImageGeometry();
			$img->setImageFormat("jpg");

			if ($arrImageRes["width"] > $maxResW || $arrImageRes["height"] > $maxResH) {
				$img->thumbnailImage($maxResW, $maxResH, true);
			}

			$img->setCompressionQuality(89);
			$img->writeImage($backendRealUserWallpaperFolder."wallpaper.jpg");




			$img = new Imagick();

			$img->readImage($completeWpPath);
			$img->setImageFormat("jpg");

			$img->thumbnailImage(200, 200, true);

			$img->setCompressionQuality(90);
			$img->writeImage($backendRealUserWallpaperFolder."thumb.jpg");	

		} catch (Exception $e) {
			error_log($e);
		}

		return [
			"thumb" => "data:image/png;base64,".base64_encode(file_get_contents($vfDesktop->getUserWallpaperFolder(true)."thumb.jpg"))
		];
	}

	public function saveData($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$userConfig = $this->getCore()->getModel("a9os.user.config");
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperType", $data["data"]["wallpaperType"], false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperValue", $data["data"]["wallpaperValue"], false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperSizeType", $data["data"]["wallpaperSizeType"], false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperBackgroundColor", $data["data"]["wallpaperBackgroundColor"], false);

		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResW", $data["data"]["userWallpaperMaxResW"], false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResH", $data["data"]["userWallpaperMaxResH"], false);

		return true;
	}
}