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

class a9os_app_vf_copymove extends a9os_app_vf_main {
	public function checkProblems($data){
		$arrMoveFiles = $data["data"]["arrMoveFiles"];
		$dest = $data["data"]["dest"];
		$type = $data["data"]["type"];

		if ($type == "copy") {
			if ($this->checkOutOfSpace(array_keys($arrMoveFiles))) {
				return "out of space";
			}
		}

		if ($type == "move") {
			if ($this->checkMoveInSameDir($arrMoveFiles, $dest)) {
				return "move in same dir";
			}
		}

		$arrFileFolderExists = $this->checkFileFolderExists($arrMoveFiles, $dest);

		return $arrFileFolderExists;
	}

	public function checkMoveInSameDir($arrMoveFiles, $dest){
		foreach ($arrMoveFiles as $currMovePath => $fileObj) {
			if ($fileObj["type"] == "folder") {
				if (strpos($dest, $currMovePath) === 0) return true;
			}
		}

		return false;
	}



	public function checkFileFolderExists($arrMoveFiles, $dest, $fromInternal = false){
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();

		foreach ($arrMoveFiles as $currMovePath => $fileObj) {
			$origMovePath = $currMovePath;

			$currMovePath = explode("/", $currMovePath);
			if (substr($origMovePath, -1) == "/") {
				$type = "folder";

				if (isset($arrMoveFiles[$origMovePath]["newName"])) {
					$currRelativeFile = $arrMoveFiles[$origMovePath]["newName"]."/";
				} else {
					$currRelativeFile = $currMovePath[count($currMovePath)-2]."/";
				}

			} else {
				$type = "file";

				if (isset($arrMoveFiles[$origMovePath]["newName"])) {
					$currRelativeFile = $arrMoveFiles[$origMovePath]["newName"];
				} else {
					$currRelativeFile = $currMovePath[count($currMovePath)-1];
				}

			}

			if (file_exists(substr($userFolder, 0, -1).$dest.$currRelativeFile) && file_exists(substr($userFolder, 0, -1).$origMovePath)) {

				$arrMoveFiles[$origMovePath]["destPath"] = $dest.$currRelativeFile;

				if ($arrMoveFiles[$origMovePath]["status"] == "ok" || $arrMoveFiles[$origMovePath]["status"] == "rename") {
					$arrMoveFiles[$origMovePath]["status"] = "exist";
				}

				if ($type == "folder" && ($arrMoveFiles[$origMovePath]["status"] == "rename" || $arrMoveFiles[$origMovePath]["status"] == "overwrite")) {
					$arrInternalMoveFiles = [];

					$arrInternalReaddir = scandir(substr($userFolder, 0, -1).$origMovePath);
					$maxSlashCount = 0;
					foreach ($arrInternalReaddir as $k => $currReaddir) {
						if ($currReaddir[0] == ".") continue;

						$currAbsoluteInternal = "";
						$readDirType = "";
						if (is_dir(substr($userFolder, 0, -1).$origMovePath.$currReaddir)) {
							$currAbsoluteInternal = $origMovePath.$currReaddir."/";

							$readDirType = "folder";

							$slashQty = substr_count($currAbsoluteInternal, "/") -1;
							if ($slashQty > $maxSlashCount) $maxSlashCount = $slashQty;
						} else {
							$currAbsoluteInternal = $origMovePath.$currReaddir;

							$readDirType = "file";

							$slashQty = substr_count($currAbsoluteInternal, "/");
							if ($slashQty > $maxSlashCount) $maxSlashCount = $slashQty;
						}


						if (!$fromInternal) {
							$arrRefInternal = $fileObj["internal"]??[];
						} else {
							$arrRefInternal = $arrMoveFiles;
						}
						if (isset($arrRefInternal[$currAbsoluteInternal])) {
							$arrInternalMoveFiles[$currAbsoluteInternal] = $arrRefInternal[$currAbsoluteInternal];
						} else {
							$arrInternalMoveFiles[$currAbsoluteInternal] = [ "status" => "ok", "type" => $readDirType ];
						}
					}

					foreach ($arrRefInternal as $currFile => $currFileObj) { // subfiles from callback to compare
						if (!array_key_exists($currFile, $arrInternalMoveFiles) && substr_count($currFile, "/") > $maxSlashCount){
							$arrInternalMoveFiles[$currFile] = $currFileObj;
						}
					}
		
					if (!$fromInternal) {
						$arrMoveFiles[$origMovePath]["internal"] = $this->checkFileFolderExists($arrInternalMoveFiles, $dest.$currRelativeFile, true);
					} else {
						$internalArrFiles = $this->checkFileFolderExists($arrInternalMoveFiles, $dest.$currRelativeFile, true);
						$arrMoveFiles = array_merge($arrMoveFiles, $internalArrFiles);
					}

				}
			}

		}

		return $arrMoveFiles;
	}



	public function finalMove($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");
		

		$arrCheckDialogInfo = $data["data"]["arrMoveFiles"];
		$dest = $data["data"]["dest"];
		$type = $data["data"]["type"];

		$asyncGear = $this->getCore()->getModel("a9os.core.asyncgear");

		return $asyncGear->asyncProcess(function($asyncGear, $arrCheckDialogInfo, $dest, $type) {

			$arrCheckDialogInfo = $this->fillAllFilesAndFolders($arrCheckDialogInfo, $dest);
			$arrPathsToRefresh = $this->copyMove($arrCheckDialogInfo, $dest, $type, $asyncGear);

			return [
				"arrPathsToRefresh" => $arrPathsToRefresh
			];

		}, $arrCheckDialogInfo, $dest, $type);
	}





	public function fillAllFilesAndFolders($arrCheckDialogInfo, $dest){
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		$userFolder = substr($userFolder, 0, -1);

		$arrAllFilesAndFolders = [];
		foreach ($arrCheckDialogInfo as $currFileOrFolder => $fileObj) {
			$fileObj = $arrCheckDialogInfo[$currFileOrFolder];

			if ($fileObj["status"] == "skip") continue;

			$fileObj["destPath"] = $this->getDestPath($dest, $currFileOrFolder, $fileObj["newName"]??false);
			
			$arrCheckDialogInfo[$currFileOrFolder] = $fileObj;
			if (!is_dir($userFolder.$currFileOrFolder)) continue;

			if (!isset($fileObj["internal"])) $fileObj["internal"] = [];

			$fileObj["subfiles"] = $this->getFilesAndFoldersFrom($userFolder, $dest, $currFileOrFolder, $fileObj["internal"]??[], $fileObj["destPath"]);

			uasort($fileObj["subfiles"]["folders"], function($a, $b) {
				return substr_count($a["destPath"], "/") - substr_count($b["destPath"], "/");
			});

			$arrCheckDialogInfo[$currFileOrFolder] = $fileObj;
		}

		return $arrCheckDialogInfo;
	}




	public function getFilesAndFoldersFrom($userFolder, $dest, $folder, $arrCheckDialogInternal, $parentFolderDestPath){
		$arrFolderFiles = scandir($userFolder.$folder);

		$arrOutput = [];
		$arrOutput["files"] = [];
		$arrOutput["folders"] = [];

		foreach ($arrFolderFiles as $k => $currRelativeFolderItem) {
			if (substr($currRelativeFolderItem, -1) == ".") continue;
			if (is_dir($userFolder.$folder.$currRelativeFolderItem)) { //folder
				$currRelativeFolderItem .= "/";
			}


			if (in_array($folder.$currRelativeFolderItem, array_keys($arrCheckDialogInternal))) {
				$internalFileObj = $arrCheckDialogInternal[$folder.$currRelativeFolderItem];
				if ($internalFileObj["status"] == "skip") continue;
			}

			$destPath = $this->getDestPath($dest, $folder.$currRelativeFolderItem, $internalFileObj["newName"]??false, $parentFolderDestPath);

			if (is_dir($userFolder.$folder.$currRelativeFolderItem)) { //folder
				$arrOutput["folders"][$folder.$currRelativeFolderItem] = [ 
					"destPath" => $destPath
				];

				$subfolderOutput = $this->getFilesAndFoldersFrom($userFolder, $dest, $folder.$currRelativeFolderItem, $arrCheckDialogInternal, $destPath);
				$arrOutput["folders"] = array_merge($arrOutput["folders"], $subfolderOutput["folders"]);
				$arrOutput["files"] = array_merge($arrOutput["files"], $subfolderOutput["files"]);

			} else { //file
				$arrOutput["files"][$folder.$currRelativeFolderItem] = [ 
					"destPath" => $destPath
				];
			}
		}

		return $arrOutput;
	}

	public function getDestPath($dest, $fileOrFolderFrom, $lastLevelNewName = false, $parentFolderDestPath = false){
		$newName = "";

		if (!$parentFolderDestPath) {
			$isFolder = false;
			if (substr($fileOrFolderFrom, -1) == "/") {
				$isFolder = true;
				$fileOrFolderFrom = substr($fileOrFolderFrom, 0, -1);
			}
			$arrFileOrFolderFrom = explode("/", $fileOrFolderFrom);

			if ($lastLevelNewName) {
				$lastLevelName = $lastLevelNewName;
			} else {
				$lastLevelName = $arrFileOrFolderFrom[ count($arrFileOrFolderFrom)-1 ];
			}
			
			$newName = $dest.$lastLevelName;
			if ($isFolder) {
				$newName .= "/";
			}
		} else {
			$isFolder = false;
			if (substr($fileOrFolderFrom, -1) == "/") {
				$isFolder = true;
			}

			$arrParentFolderDestPath = explode("/", $parentFolderDestPath);
			if ($lastLevelNewName) {
				$lastLevelName = $lastLevelNewName;
			} else {
				$arrFileOrFolderFrom = explode("/", $fileOrFolderFrom);
				if (substr($fileOrFolderFrom, -1) == "/") {
					$lastLevelName = $arrFileOrFolderFrom[ count($arrFileOrFolderFrom) -2 ];
				} else {
					$lastLevelName = $arrFileOrFolderFrom[ count($arrFileOrFolderFrom) -1 ];
				}
			}
			$arrParentFolderDestPath[ count($arrParentFolderDestPath)-1 ] = $lastLevelName;	

			$newName = implode("/", $arrParentFolderDestPath);
			if ($isFolder) {
				$newName .= "/";
			}
		}

		return $newName;
	}




	public function copyMove($arrCheckDialogInfo, $dest, $type, $asyncGear){
		//error_log(json_encode($arrCheckDialogInfo));
		//return;

		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		$userFolder = substr($userFolder, 0, -1);

		$sizeOfAll = $this->countBytes($arrCheckDialogInfo);
		$copiedBytes = 0;

		if ($sizeOfAll*$copiedBytes == 0) {
			$sizeOfAll = 1;
			$copiedBytes = 1;
		}

		foreach ($arrCheckDialogInfo as $currFileOrFolderFirstLevel => $fileObj) {
			if (substr($currFileOrFolderFirstLevel, -1) == "/") { //folder

				if (!is_dir($userFolder.$fileObj["destPath"])) {
					mkdir($userFolder.$fileObj["destPath"], 0755);
				}

				$asyncGear->pushMessage([
					"percent" => round(100/$sizeOfAll*$copiedBytes) ,
					"type" => $type,
					"currFile" => $currFileOrFolderFirstLevel,
					"destFile" => $fileObj["destPath"]
				]);
				//sleep(2);

				foreach ($fileObj["subfiles"]["folders"] as $currSubfolder => $currSubfolderObj) {

					if (!is_dir($userFolder.$currSubfolderObj["destPath"])) {
						mkdir($userFolder.$currSubfolderObj["destPath"], 0755);
					}

					$asyncGear->pushMessage([
						"percent" => round(100/$sizeOfAll*$copiedBytes) ,
						"type" => $type,
						"currFile" => $currSubfolder,
						"destFile" => $currSubfolderObj["destPath"]
					]);
					//sleep(2);
				}

				foreach ($fileObj["subfiles"]["files"] as $currSubfile => $currSubfileObj) {
					$copyMoveCommand = "copy";
					if ($type == "move") $copyMoveCommand = "rename";

					$copiedBytes += filesize($userFolder.$currSubfile);
					$copyMoveCommand($userFolder.$currSubfile, $userFolder.$currSubfileObj["destPath"]);

					if ($type == "move") {
						$this->getCore()->getModel("a9os.app.vf.file")->moveFilePathReference($currSubfile, $currSubfileObj["destPath"]);
					}

					$asyncGear->pushMessage([
						"percent" => round(100/$sizeOfAll*$copiedBytes) ,
						"type" => $type,
						"currFile" => $currSubfile,
						"destFile" => $currSubfileObj["destPath"]
					]);
					//sleep(2);
				}

				if ($type == "move") {
					$vfDelete = $this->getCore()->getModel("a9os.app.vf.delete");
					$vfDelete->deleteDirectory($userFolder.$currFileOrFolderFirstLevel);
				}
			} else { //file
				$copyMoveCommand = "copy";
				if ($type == "move") $copyMoveCommand = "rename";

				$copiedBytes += filesize($userFolder.$currFileOrFolderFirstLevel);
				$copyMoveCommand($userFolder.$currFileOrFolderFirstLevel, $userFolder.$fileObj["destPath"]);

				if ($type == "move") {
					$this->getCore()->getModel("a9os.app.vf.file")->moveFilePathReference($currFileOrFolderFirstLevel, $fileObj["destPath"]);
				}

				$asyncGear->pushMessage([
					"percent" => round(100/$sizeOfAll*$copiedBytes) ,
					"type" => $type,
					"currFile" => $currFileOrFolderFirstLevel,
					"destFile" => $fileObj["destPath"]
				]);
				//sleep(2);
			}
		}


		return $this->getArrPathsToRefresh($arrCheckDialogInfo);
	}


	public function countBytes($arrCheckDialogInfo){
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		$userFolder = substr($userFolder, 0, -1);

		$bytesTransfered = 0;
		foreach ($arrCheckDialogInfo as $currFileOrFolderFirstLevel => $fileObj) {
			if (substr($currFileOrFolderFirstLevel, -1) == "/") { //folder
				foreach ($fileObj["subfiles"]["files"] as $currSubfile => $currSubfileObj) {
					$bytesTransfered += filesize($userFolder.$currSubfile);
				}
			} else { //file
				$bytesTransfered += filesize($userFolder.$currFileOrFolderFirstLevel);
			}
		}

		return $bytesTransfered;
	}

	public function getArrPathsToRefresh($arrCheckDialogInfo){
		$arrPathsToRefresh = [];

		foreach ($arrCheckDialogInfo as $currFileOrFolderFirstLevel => $fileObj) {
			if (substr($currFileOrFolderFirstLevel, -1) == "/") { //folder
				$arrPathsToRefresh[] = $currFileOrFolderFirstLevel;

				$arrDivideParentPath = explode("/", $currFileOrFolderFirstLevel);
				$arrDivideParentPath = array_slice($arrDivideParentPath, 0,-2);
				$arrPathsToRefresh[] = implode("/", $arrDivideParentPath)."/";

				/*foreach ($fileObj["subfiles"]["folders"] as $currSubfolder => $currSubfolderObj) {
				}*/ // debería, pero muy pesado

				$arrDivideParentDestPath = explode("/", $fileObj["destPath"]);
				$arrDivideParentDestPath = array_slice($arrDivideParentDestPath, 0,-2);
				$arrPathsToRefresh[] = implode("/", $arrDivideParentDestPath)."/";
			} else {
				$arrDivideParentPath = explode("/", $currFileOrFolderFirstLevel);
				$arrDivideParentPath = array_slice($arrDivideParentPath, 0,-1);
				$arrPathsToRefresh[] = implode("/", $arrDivideParentPath)."/";

				$arrDivideParentDestPath = explode("/", $fileObj["destPath"]);
				$arrDivideParentDestPath = array_slice($arrDivideParentDestPath, 0,-1);
				$arrPathsToRefresh[] = implode("/", $arrDivideParentDestPath)."/";
			}
		}

		$arrPathsToRefresh = array_unique($arrPathsToRefresh);

		return $arrPathsToRefresh;
	}
}