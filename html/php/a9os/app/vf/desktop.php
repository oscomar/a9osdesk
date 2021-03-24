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

class a9os_app_vf_desktop extends a9os_app_vf_main {
	public function main($data){
		$this->checkAndCreateDefaultUserFolders();

		return [
			"desktopPath" => "/desktop/",
			"userWallpaperData" => $this->getUserWallpaperData()
		];
	}

	public function checkAndCreateDefaultUserFolders(){
		$arrDefaultUserFolders = ["desktop", "imagenes", "videos", "documentos", "musica"];

		foreach ($arrDefaultUserFolders as $currDefaultUserFolder) {
			$currFullPath = $this->getUserFolder()."/".$currDefaultUserFolder;
			if (!is_dir($currFullPath)) mkdir($currFullPath);
		}

		return;
	}




	public function getSystemWallpaperResourceFolder(){
		return "/resources/a9os/app/vf/desktop/default-wallpapers/";
	}

	public function getAllSystemWallpapers(){
		$systemWallpaperResourceFolder = $this->getSystemWallpaperResourceFolder();
		$arrResourceFolderFiles = scandir($this->getCore()->getRootFolder().$systemWallpaperResourceFolder);

		$arrSystemWallpaperFiles = [];
		foreach ($arrResourceFolderFiles as $k => $currResourceEntry) {
			if ($currResourceEntry[0] == ".") continue;
			if (is_dir($this->getCore()->getRootFolder().$systemWallpaperResourceFolder.$currResourceEntry)) continue;
			$arrSystemWallpaperFiles[] = $currResourceEntry;
		}
		
		return $arrSystemWallpaperFiles;
	}

	public function getSystemWallpaperRandomImage(){
		$arrSystemWallpaperFiles = $this->getAllSystemWallpapers();
		return $arrSystemWallpaperFiles[random_int(0, count($arrSystemWallpaperFiles)-1)];
	}

	public function getUserWallpaperData(){ 
		// wallpaperType = system | user | color
		// wallpaperValue = "#012345" <- NO | "uri1.jpg" | path original del wallpaper en user type
		// wallpaperBackgroundColor = "#012345" <- siempre, para el fondo de size contain
		// wallpaperSizeType = "contain" | "cover" | "100% 100%" <- deform and hackeable
		
		$userWallpaperFilename = "wallpaper.jpg";
		$systemWallpaperResourceFolder = $this->getSystemWallpaperResourceFolder();
		$defaultWallpaperBackgroundColor = "#222222";

		$backendRealUserWallpaperFolder = $this->getUserWallpaperFolder(true);
		$userWallpaperFolder = $this->getUserWallpaperFolder();

		$userConfig = $this->getCore()->getModel("a9os.user.config");
		$wallpaperType = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperType");
		$wallpaperValue = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperValue");
		$wallpaperBackgroundColor = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperBackgroundColor");
		$wallpaperSizeType = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperSizeType");


		if (empty($wallpaperSizeType)) $wallpaperSizeType = "cover";

		if (empty($wallpaperType)) {
			$wallpaperType = "system";
			$wallpaperValue = $this->getSystemWallpaperRandomImage();
		}

		if ($wallpaperType == "system" 
		&& !file_exists($this->getCore()->getRootFolder().$systemWallpaperResourceFolder.$wallpaperValue)
		) {
			$wallpaperValue = $this->getSystemWallpaperRandomImage();
		}

		if ($wallpaperType == "user" 
		&& !file_exists($backendRealUserWallpaperFolder.$userWallpaperFilename)
		) { // ej: .system borrado
			$wallpaperType = "system";
			$wallpaperValue = $this->getSystemWallpaperRandomImage();
		}

		if (empty($wallpaperBackgroundColor)) $wallpaperBackgroundColor = $defaultWallpaperBackgroundColor;

		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperType", $wallpaperType, false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperValue", $wallpaperValue, false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperSizeType", $wallpaperSizeType, false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperBackgroundColor", $wallpaperBackgroundColor, false);
		


		$userWallpaperMaxResW = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperMaxResW") ?? 1920;
		$userWallpaperMaxResH = $userConfig->getConfig("a9os_app_vf_desktop.userWallpaperMaxResH") ?? 1080;

		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResW", $userWallpaperMaxResW, false);
		$userConfig->setConfig("a9os_app_vf_desktop.userWallpaperMaxResH", $userWallpaperMaxResH, false);


		return [
			"wallpaperType" => $wallpaperType,
			"wallpaperValue" => $wallpaperValue,
			"wallpaperSizeType" => $wallpaperSizeType,
			"wallpaperBackgroundColor" => $wallpaperBackgroundColor,
			"systemWallpaperResourceFolder" => $systemWallpaperResourceFolder,
			"userWallpaperFolder" => $userWallpaperFolder,
			"userWallpaperMaxResW" => $userWallpaperMaxResW,
			"userWallpaperMaxResH" => $userWallpaperMaxResH,
		];
	}
	
	public function getUserWallpaperFolder($backendRealPath = false){
		$userSystemFolder = $this->getUserSystemFolder(true);
		$userWallpaperSystemFolder = "a9os/app/vf/desktop/wallpaper/";

		if (!is_dir($userSystemFolder.$userWallpaperSystemFolder)) mkdir($userSystemFolder.$userWallpaperSystemFolder, 0775, true);

		if ($backendRealPath) return $userSystemFolder.$userWallpaperSystemFolder;
		else return "/.system/".$userWallpaperSystemFolder;
	}
}