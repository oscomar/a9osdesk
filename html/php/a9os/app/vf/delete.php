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

class a9os_app_vf_delete extends a9os_app_vf_main {
	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$arrPathstoDelete = $data["data"]["path"];

		$arrParentPaths = [];
		foreach ($arrPathstoDelete as $pathToDelete) {
			if ($pathToDelete == "/desktop") continue;
			
			$userFolder = $this->getUserFolder();
			$relativePath = $pathToDelete;
			$pathToDelete = $userFolder.$pathToDelete;
			if (is_dir($pathToDelete)) {
				$this->deleteDirectory($pathToDelete);
			} else {
				$this->deleteFile($pathToDelete);

			}

			$relativePath = rtrim($relativePath, "/");
			$arrRelativePath = explode("/", $relativePath);
			unset($arrRelativePath[count($arrRelativePath)-1]);
			$arrParentPaths[] = implode("/", $arrRelativePath);
		}

		return $arrParentPaths;
	}

	public function deleteFile($path){
		unlink($path);
		return true;
	}

	public function deleteDirectory($path){
		$arrDirectoryItems = scandir($path);
		foreach ($arrDirectoryItems as $currItem) {
			if ($currItem == "." || $currItem == "..") continue;
			if (is_dir($path."/".$currItem)) {
				$this->deleteDirectory($path."/".$currItem);
			} else {
				unlink($path."/".$currItem);
			}
		}
		rmdir($path);
	}
}