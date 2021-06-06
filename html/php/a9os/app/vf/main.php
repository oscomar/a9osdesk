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
ini_set('post_max_size', '50G');
ini_set('upload_max_filesize', '50G');

class a9os_app_vf_main extends a9os_core_main {

	public function main($data){
		return false;
	}


	public function returnFile($rawPath){
		$rawPath = str_replace("../", "", $rawPath);
		if (!file_exists($rawPath)) {
			http_response_code(404);
			echo "File not found";
			$this->getCore()->end();
		}

		if (function_exists("apache_setenv")) apache_setenv("no-gzip", "1");
		header("Content-Encoding: identity");
		header("Content-Type: ".mime_content_type($rawPath));
		header("Accept-Ranges: bytes");
		$filePointer = fopen($rawPath, "r");
		$bytesToSend = filesize($rawPath);

		$arrHeaders = getallheaders();
		if (in_array("Range", array_keys($arrHeaders))) { //RETURN RANGE ONLY WITH MULTI-PROCESS SERVERS
			$arrRange = str_replace(" ", "", $arrHeaders["Range"]);
			$arrRange = explode("=", $arrRange);
			$arrRange = explode(",", $arrRange[1]);
			$arrRange = explode("-", $arrRange[0]);

			$offset = intval($arrRange[0]);
			if ($arrRange[1] == "") $arrRange[1] = $bytesToSend;
			$length = intval($arrRange[1]) - $offset;
			header("HTTP/1.1 206 Partial Content");
			header("Content-Range: bytes ".$offset."-".($offset + $length - 1)."/".$bytesToSend);

			$bytesToSend = $length;
			fseek($filePointer, $offset);
		}

		$bytesSent = 0;
		while (!feof($filePointer) || $bytesSent < $bytesToSend) {
			$chunkToSend = 1048576;

			echo fread($filePointer, $chunkToSend);
			ob_flush();
			flush();
			$bytesSent += $chunkToSend;

			//sleep(2); // SLOW TEST MODE
		}

		fclose($filePointer);
		$this->getCore()->end();
	}



	public function getUserFolder($onlyHome = false){

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$vfMain = $this->getCore()->getModel("a9os.app.vf.main");
		$rootPath = $vfMain->_getJsonConfig("rootPath")."/user/";

		$userFolder = $rootPath.$user->getName()."/";

		if (!is_dir($userFolder)) {
			mkdir($userFolder, 0775, true);
		}

		if ($onlyHome) {
			return $user->getName()."/";
		} else {
			return $userFolder;
		}
	}

	public function getUserSystemFolder($fullPath = false){
		$userRootFolder = $this->getUserFolder();
		$userSystemFolder = $userRootFolder.".system/";

		if (!is_dir($userSystemFolder)) mkdir($userSystemFolder, 0775);

		if ($fullPath) {
			return $userSystemFolder;
		} else {
			$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
			
			return $user->getName()."/.system/";
		}
	}


	public function getIconsFolder(){
		return "/resources/a9os/app/vf/icons/files/";
	}


	public function getFiles($path, $makeSaves = false) { // entry point of getFolder
		if (mb_strlen($path) > 0 && $path[ mb_strlen($path) -1 ] != "/") $path .= "/";
		$path = str_replace("../", "", $path); 

		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		if (!file_exists(mb_substr($userFolder, 0, -1).$path)){
			return [
				"files" => [],
				"path" => $path,
				"postUpdate" => false,
				"folderNotExists" => true
			];
		}

		if ($path[0] == "/"){
			$arrFolderFiles = scandir(mb_substr($userFolder, 0, -1).$path);

			$arrFiles = [];
			$hasFiles = false;
			foreach ($arrFolderFiles as $kFolderFile => $currFile) {
				if ($currFile[0] == "."){
					continue;
				}
				$hasFiles = true;
				$arrFiles[] = $path.$currFile.(is_dir($this->getUserFolder().$path.$currFile)?"/":"");
			}

			if ($hasFiles) $dbSavedFilesCollection = $this->getDbSavedFiles($arrFiles);
			else $dbSavedFilesCollection = false;

		}


		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$vfExtPreview = $this->getCore()->getModel("a9os.app.vf.file.extension.preview");

		$pathIsUserThumbsFolder = ($path == $vfExtPreview->getPreviewsFolder(false));

		$dataToPostUpdate = false;
		$arrDbEntriesUsed = [];

		$arrFolders = [];
		$arrFiles = [];

		foreach ($arrFolderFiles as $kFolderFile => $currFile) {
			if ($currFile[0] == "."){
				continue;
			}

			$currFileObj = $this->getCore()->getModel("a9os.app.vf.file");

			$isFolder = (is_dir($this->getUserFolder().$path.$currFile));
			$currFileObj->setType(($isFolder?"folder":"file"));

			$currFileObj->setA9osUserId($user->getID());
			$currFileObj->setPath($path.$currFile.(($isFolder)?"/":""));

			$currFileMtime = false;

			if (!$isFolder) {
				$extension = $appAppExtension->getFileExtensionByPath($currFileObj->getPath());
				$currFileObj->setExtension($extension);


				$arrOpenApp = $appAppExtension->getApplicationByExtension($currFileObj->getExtension());
				$currFileObj->setOpenWithPath($arrOpenApp["path"]);
				$currFileObj->setOpenWithName($arrOpenApp["name"]);
				$currFileObj->setOpenWithIconUrl($arrOpenApp["icon_url"]);


				$arrFileStat = stat(mb_substr($this->getUserFolder(), 0, -1).$path.$currFile);
				$currFileMtime = $arrFileStat["mtime"];
				$currSize = (double)$arrFileStat["size"];

				$currFileObj->setSize($currSize);

				$currFileObj->setDateModified(date('Y-m-d H:i:s', $currFileMtime));
			}

			$currFileObj->setPreviewMade(0);


			$fileInDb = false;
			if (!$dbSavedFilesCollection) $fileInDb = true;

			while ($dbSavedFilesCollection && $currDbFile = $dbSavedFilesCollection->fetch()) {
				if ($currDbFile->getPath() == $currFileObj->getPath()) {
					$fileInDb = true;
					$arrDbEntriesUsed[] = $currDbFile;

					$currFileObj->setID($currDbFile->getID());
					$currFileObj->setHash($currDbFile->getHash());
					$currFileObj->setPreviewMade($currDbFile->getPreviewMade());

					if ($currFileMtime) {
						if (date('Y-m-d H:i:s', $currFileMtime) != $currDbFile->getDateModified()) {
							$currFileObj->setHash(0);
							$currFileObj->setPreviewMade(0);
							$dataToPostUpdate = 1;
						}
					}

					$dbSavedFilesCollection->resetFetch();
					break;
				}
			}
			if ($dbSavedFilesCollection) $dbSavedFilesCollection->resetFetch();

			if (!$currFileObj->getHash() && $currFileObj->getType() == "file") {
				if ($makeSaves) $currFileObj->setHash(md5_file($this->getUserFolder().$currFileObj->getPath()));
				$dataToPostUpdate = 2;
			}

			if ($currFileObj->getType() == "file") {
				$thumbObject = $vfExtPreview->getThumbObjectByPath($currFileObj->getPath());

				$fileIcon = $appAppExtension->getFileIconByPath($currFileObj->getPath());
				if ($fileIcon) $currFileObj->setPreviewUrl($this->getIconsFolder().$fileIcon);
			}

			if ($currFileObj->getHash() && $currFileObj->getType() == "file"){

				$previewImgUrl = $vfExtPreview->getPreviewUrl($currFileObj->getHash(), $currFileObj->getPath());
				$previewImgUrlComplete = $vfExtPreview->getPreviewUrl($currFileObj->getHash(), $currFileObj->getPath(), true);

				if (file_exists($previewImgUrlComplete) && !$currFileObj->getPreviewMade()) {
					$currFileObj->setPreviewMade(1);
					$currFileObj->setPreviewUrl($previewImgUrl);
					$dataToPostUpdate = 3;
				}

				if (!$currFileObj->getPreviewMade() && $vfExtPreview->ifPathNeedsPreview($currFileObj->getPath()) && !$pathIsUserThumbsFolder) {
					$dataToPostUpdate = 4;

					if ($makeSaves && $thumbObject) {				
						$previewMade = $thumbObject->createThumb($this->getUserFolder().$currFileObj->getPath(), $currFileObj->getHash());
						if ($previewMade) {
							$currFileObj->setPreviewMade((int)$previewMade);
							$previewImgUrl = $vfExtPreview->getPreviewUrl($currFileObj->getHash(), $currFileObj->getPath());
							$currFileObj->setPreviewUrl($previewImgUrl);
							$dataToPostUpdate = 5;
						}
					}
				}

				if ($currFileObj->getPreviewMade() && $vfExtPreview->ifPathNeedsPreview($currFileObj->getPath()) && !$pathIsUserThumbsFolder) {

					if (!file_exists($previewImgUrlComplete)) {
						$currFileObj->setPreviewMade(0);
						$dataToPostUpdate = 6;
					} else {
						$currFileObj->setPreviewUrl($previewImgUrl);
					}
				}
			}

			if ($makeSaves) {
 				$currFileObj->save();
			}


			if ($currFileObj->getType() == "folder") {
				$arrFolders[] = $currFileObj;
			} else {
				$arrFiles[] = $currFileObj;
			}
		}

		if ($this->checkFilesToDelete($path, count($arrFiles), count($arrFolders))) $dataToPostUpdate = 7;

		if ($makeSaves) {
			$this->purgeDbDeletedFiles($path);
		}

		$arrFoldersAndFiles = array_merge($arrFolders, $arrFiles);

		$arrFolderAddons = [];
		if (!$makeSaves) {
			$arrFolderAddons = $this->processFolderAddons($path, $arrFoldersAndFiles);
		}

		foreach ($arrFoldersAndFiles as $k => $currFile) {
			$arrFoldersAndFiles[$k] = $currFile->getData();
		}

		return [
			"files" => $arrFoldersAndFiles,
			"path" => $path,
			"postUpdate" => $dataToPostUpdate,
			"folderAddons" => $arrFolderAddons
		];

	}

	public function updateData($path){ // calculate hashes, make previews
		$arrFilesAndFolders = $this->getFiles($path, true);

		return $arrFilesAndFolders;
	}


	public function getDbSavedFiles($arrPaths, $arrIds = false){
		$file = $this->getCore()->getModel("a9os.app.vf.file");
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		foreach ($arrPaths as $k => $currPath) {
			$arrPaths[$k] = $this->_quote($currPath);
		}
		$arrPaths[] = "''";
		$sqlWhere = "where f.path in (".implode(",", $arrPaths).") ";


		if ($arrIds != false){
			$arrIds[] = -10;
			$sqlWhere = "where f.{$file->getPrimaryIdx()} in (".implode(",", $arrIds).") ";
		}
		

		$sqlWhere .= " and f.{$user->getPrimaryIdx()} = {$user->getID()}";


		$fileCollection = $file->_setSelect("SELECT
			f.*
			from {$file->getTableName()} f 
			{$sqlWhere} and f.{$user->getPrimaryIdx()} = {$user->getID()}
		");

		return $fileCollection;
	}

	public function checkFilesToDelete($path, $qtyOriginFiles, $qtyOriginFolders){
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$file = $this->getCore()->getModel("a9os.app.vf.file");

		$path = $this->_quote($path);
		$path = mb_substr($path, 1, -1);

		$checkFileCollection = $file->_setSelect("
			SELECT * from {$file->getTableName()}

			where path like '{$path}%'
			and {$user->getPrimaryIdx()} = {$user->getID()}
		");

		$pathSlashQty = mb_substr_count($path, "/");

		$qtyFiles = 0;
		$qtyFolders = 0;
		while ($currFileToCompare = $checkFileCollection->fetch()) {
			if ($currFileToCompare->getType() == "file" && $pathSlashQty == mb_substr_count($currFileToCompare->getPath(), "/")) {
				$qtyFiles++;
			}

			if ($currFileToCompare->getType() == "folder" && $pathSlashQty == mb_substr_count($currFileToCompare->getPath(), "/")-1) {
				$qtyFolders++;
			}
		}

		if ($qtyOriginFiles != $qtyFiles || $qtyOriginFolders != $qtyFolders) return true;
		return false;
	}

	public function purgeDbDeletedFiles($path){
		$file = $this->getCore()->getModel("a9os.app.vf.file");
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();


		if ($path[0] != "/") return;

		$arrFolderFiles = scandir(mb_substr($userFolder, 0, -1).$path);

		$arrFiles = [];
		$arrFolders = [];

		foreach ($arrFolderFiles as $kFolderFile => $currFile) {
			if ($currFile[0] == "."){
				continue;
			}
			if (is_dir($this->getUserFolder().$path.$currFile)) $arrFolders[] = $path.$currFile."/";
			else $arrFiles[] = $path.$currFile;
		}


		$path = $this->_quote($path);
		$path = mb_substr($path, 1, -1);

		$checkFileCollection = $file->_setSelect("
			SELECT * from {$file->getTableName()}

			where path like '{$path}%'
			and {$user->getPrimaryIdx()} = {$user->getID()}
		");

		$pathSlashQty = mb_substr_count($path, "/");

		$arrFoldersToDelete = [];
		$arrSubfiles = [];
		while ($currFileToCompare = $checkFileCollection->fetch()) {
			if ($currFileToCompare->getType() == "file" 
			&& mb_substr_count($currFileToCompare->getPath(), "/") == $pathSlashQty
			&& !in_array($currFileToCompare->getPath(), $arrFiles)) {
				$this->deleteAndRemoveThumb($currFileToCompare);
				continue;
			}

			if (mb_substr_count($currFileToCompare->getPath(), "/") >= $pathSlashQty+1) {
				$arrSubfiles[] = $currFileToCompare;
			}

			if ($currFileToCompare->getType() == "folder" 
			&& mb_substr_count($currFileToCompare->getPath(), "/") == $pathSlashQty+1
			&& !in_array($currFileToCompare->getPath(), $arrFolders)) {

				$arrFoldersToDelete[] = $currFileToCompare;

				$this->deleteAndRemoveThumb($currFileToCompare);
				continue;
			}
		}

		foreach ($arrFoldersToDelete as $k => $currFolderToDelete) {
			foreach ($arrSubfiles as $k2 => $currSubfile) {
				$pathFolderToDelete = $currFolderToDelete->getPath();
				$currSubfileStartPart = $currSubfile->getPath();
				$currSubfileStartPart = mb_substr($currSubfileStartPart, 0, mb_strlen($pathFolderToDelete));

				if ($currSubfileStartPart == $pathFolderToDelete) $this->deleteAndRemoveThumb($currSubfile);
			}
		}


		//delete duplicates
		$arrPaths = [];
		$checkFileCollection->resetFetch();
		while ($currFileToCompare = $checkFileCollection->fetch()) {
			if (in_array($currFileToCompare->getPath(), $arrPaths)) {
				$this->deleteAndRemoveThumb($currFileToCompare);
				continue;
			}
			$arrPaths[] = $currFileToCompare->getPath();
		}


		return;
	}

	public function deleteAndRemoveThumb($currFileObj){
		if ($currFileObj->getHash()
		&&  $this->ifPathNeedsPreview($currFileObj->getPath())) {
			$previewImgUrlComplete = $this->getPreviewUrl($currFileObj->getHash(), $currFileObj->getPath(), true);
			if (file_exists($previewImgUrlComplete)) unlink($previewImgUrlComplete);
		}
		$currFileObj->delete();
		return;
	}


	public function processFolderAddons($path, $arrFoldersAndFiles){
		$arrFolderAddonComponentModels = $this->getCore()->getModel("a9os.app.vf.window.folderaddons")->getAddonComponentModels();

		$arrOutput = [];
		foreach ($arrFolderAddonComponentModels as $currFolderAddonComponent) {
			$arrDataModel = explode("::", trim($currFolderAddonComponent->getDataModel()));
			$addonModel = $this->getCore()->getModel($arrDataModel[0]);
			if (!method_exists($addonModel, "receiveFiles")) throw new Exception("VF FOLDER ADDONS|".$arrDataModel[0]." must implement method 'receiveFiles(\$path, \$arrFiles)' ");
			
			$folderAddonBackOutput = $this->getCore()->getModel($arrDataModel[0])->receiveFiles($path, $arrFoldersAndFiles);
			$arrOutput[$currFolderAddonComponent->getComponentName()] = $folderAddonBackOutput;
		}

		return $arrOutput;
	}


	public function getDirectorySize($arrFiles, $parentDir = ""){
		$directorySize = 0;

		if (is_string($arrFiles)) $arrFiles = [$arrFiles];

		foreach ($arrFiles as $currFile) {
			if (is_array($currFile)) {
				$directorySize += (int)$currFile["size"];
				continue;
			}
			if ($currFile[0] == ".") continue;

			$currFile = $parentDir.$currFile;

			if (is_dir($currFile)) {
				$arrReadFiles = [];
				$arrScandir = scandir($currFile);
				foreach ($arrScandir as $k => $currScandir) {
					$arrReadFiles[] = $currScandir;
				}

				$directorySize += $this->getDirectorySize($arrReadFiles, $currFile."/");
			} else {
				$directorySize += filesize($currFile);
			}
		}
		return $directorySize;
	}


	public function checkOutOfSpace($arrFiles, $bytesToExclude = 0){
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		
		$realDiskFreeSpace = disk_free_space($userFolder);

		$userDiskSpaceData = $this->getUserDiskSpaceData();
		if ($userDiskSpaceData == -1) $diskFreeSpace = $realDiskFreeSpace;
		else {

			if ($realDiskFreeSpace < $userDiskSpaceData["totalSpace"] - $userDiskSpaceData["usedSpace"]) 
				$diskFreeSpace = $realDiskFreeSpace;
			else $diskFreeSpace = $userDiskSpaceData["totalSpace"] - $userDiskSpaceData["usedSpace"];
		}

		$allFilesSpace = $this->getDirectorySize($arrFiles, substr($userFolder, 0, -1));

		if ($diskFreeSpace + $bytesToExclude - $allFilesSpace <= 0) return true;
		return false;
	}


	public function getUserDiskSpaceData(){
		$userDiskSpaceBytes = $this->getCore()->getModel("a9os.app.vf.main")->_getJsonConfig("userDiskSpaceBytes");

		if (is_null($userDiskSpaceBytes)) return -1;

		$userDiskSpaceBytes = (int)$userDiskSpaceBytes;

		$userFolder = $this->getUserFolder();
		$userFolderUsedBytes = $this->getDirectorySize($userFolder);

		return [
			"totalSpace" => $userDiskSpaceBytes,
			"usedSpace" => (int)$userFolderUsedBytes
		];
	}
}