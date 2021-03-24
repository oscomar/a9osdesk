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

class a9os_app_vf_file_extension_preview extends application_application_extension {
	public function getPreviewsFolder($completePath = true){
		$systemVfThumbsFolder = "a9os/app/vf/thumbs/";
		$vfMain = $this->getCore()->getModel("a9os.app.vf.main");

		$completeSystemUserFolder = $vfMain->getUserSystemFolder(true);

		if (!is_dir($completeSystemUserFolder.$systemVfThumbsFolder)) 
			mkdir($completeSystemUserFolder.$systemVfThumbsFolder, 0775, true);

		if ($completePath) return $completeSystemUserFolder.$systemVfThumbsFolder;
		else return "/.system/".$systemVfThumbsFolder;
	}

	public function getPreviewUrl($hash, $path, $realPreviewFilePath = false){
		$file = $this->getPreviewsFolder().$hash.".PNG";

		if ($realPreviewFilePath) {
			return $file;
		} else {
			if (!is_file($file)) return false;
			else return "data:image/png;base64,".base64_encode(file_get_contents($file));
		}
	}


	public function ifPathNeedsPreview($path){
		$extension = $this->getFileExtensionByPath($path);

		$arrExtensionList = $this->getFileExtensionList();

		if (in_array($extension, array_keys($arrExtensionList))) {
			if (!is_null($arrExtensionList[ $extension ]->getMakePreviewModel())) return true;
		}
		return false;
	}

	public function getThumbObjectByPath($path){
		$extension = $this->getFileExtensionByPath($path);

		$arrExtensionList = $this->getFileExtensionList();

		if (in_array($extension, array_keys($arrExtensionList))) {
			if (is_null($arrExtensionList[ $extension ]->getMakePreviewModel())) return false;
			return $this->getCore()->getModel($arrExtensionList[ $extension ]->getMakePreviewModel());
		}
		return false;
	}
}