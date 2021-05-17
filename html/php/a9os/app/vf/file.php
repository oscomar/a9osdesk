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

class a9os_app_vf_file extends a9os_app_vf_main {
	public function _construct(){
		return false;
	}

	//bypass protection
	public function save(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_*"]
		]);

		return parent::save();
	}
	public function delete(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_*"]
		]);

		return parent::delete();
	}
	////


	public function updateDefaultApp($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$appId = $data["data"]["appId"];
		$fileExtension = $data["data"]["fileExtension"];
		$fileExtension = mb_strtoupper($fileExtension);

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$userId = (int)$user->getID();

		$aaed = $this->getCore()->getModel("application.application.extension.default");
		$aaed->_setSelect("
			SELECT * from {$aaed->getTableName()}
			where file_extension={$this->_quote($fileExtension)}
			and a9os_user_id={$userId}
		");

		$aaed = $aaed->fetch();
		if (!$aaed) {
			$aaed = $this->getCore()->getModel("application.application.extension.default");
		}

		$aaed->setApplicationApplicationId($appId);
		$aaed->setFileExtension($fileExtension);

		
		$aaed->setA9osUserId($userId);
		
		$aaed->save();
	}


	public function fileGetContents($data){ // entry point from js
		return $this->getContents($data["data"]["path"]);
	}

	public function getContents($path, $openFile = false){ // all file to backend RAM. for backend use
		$path = str_replace("../", "", $path);
		$registry = $this->getCore()->getModel("a9os.app.vf.registry");
		$registry->newRegistry($path, "file_read");

		if (!$openFile) {
			$this->returnFile($this->getUserFolder().$path);
		} else {
			return file_get_contents($this->getUserFolder().$path);
		}
	}



	public function filePutContents($data){ // entry point from js
		$fileName = $data["getData"]["path"];
		$fileName = str_replace("../", "", $fileName);

		$returnRegistry = $this->putContents($fileName, $_FILES["data"]["tmp_name"]);

		if (!$returnRegistry) error_log(json_encode($_FILES["data"]) . " no subido: " . $_FILES["data"]["error"]);
		return $returnRegistry;
	}



	public function putContents($path, $tmpFile){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");
		
		if (move_uploaded_file($tmpFile, $this->getUserFolder().$path)){
			$registry = $this->getCore()->getModel("a9os.app.vf.registry");
			$registry->newRegistry($path, "file_write");
			
			return $registry->getDateAdd();
		} else {
			return false;
		}
	}


	public function newItem($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");


		$type = $data["data"]["type"];
		$newPath = $data["data"]["newPath"];
		$force = $data["data"]["force"]??false;

		if (file_exists($this->getUserFolder().$newPath) && !$force) {
			return [
				"result" => "confirm",
				"type" => $type,
				"path" => $newPath
			];
		}
		if ($type == "folder") {
			if (mkdir($this->getUserFolder().$newPath, 0775, true)) {
				return [
					"result" => "ok",
					"type" => $type,
					"path" => $newPath
				];
			}
		} else {
			if (file_put_contents($this->getUserFolder().$newPath, "") !== false) {
				return [
					"result" => "ok",
					"type" => $type,
					"path" => $newPath
				];
			}
		}

		return [
			"result" => "error",
			"type" => $type,
			"path" => $newPath
		];
	}



	public function rename($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$arrMoves = $data["data"]["path"];

		$arrOutputFiles = [];
		foreach ($arrMoves as $currMove) {
			$pathFrom = $currMove["from"];
			$pathTo = $currMove["to"];
			$type = $currMove["type"];
			$force = $currMove["force"]??false;

			if (file_exists($this->getUserFolder().$pathTo) && !$force) {
				$arrOutputFiles[$pathTo] = [
					"result" => "confirm",
					"type" => $type
				];
				continue;
			}

			if (rename($this->getUserFolder().$pathFrom, $this->getUserFolder().$pathTo)) {

				$referenceFileFrom = $pathFrom;
				$referenceFileTo = $pathTo;
				if ($type == "folder") {
					$referenceFileFrom .= "/";
					$referenceFileTo .= "/";
				}
				$this->moveFilePathReference($referenceFileFrom, $referenceFileTo);

				
				$arrOutputFiles[$pathTo] = [
					"result" => "ok",
					"type" => $type
				];
			} else {
				$arrOutputFiles[$pathTo] = [
					"result" => "error",
					"type" => $type
				];
			}
		}

		return $arrOutputFiles;
	}

	public function moveFilePathReference($oldPath, $newPath){
		$fileType = mb_substr($oldPath, -1);
		if ($fileType == "/") $fileType = "folder";
		else $fileType = "file";

		if ($fileType == "file") {
			$vfFile = $this->getCore()->getModel("a9os.app.vf.file")->load($oldPath, "path");
			if (!$vfFile) return false;
			$vfFile->setPath($newPath);
			$vfFile->save();
		} else {
			$escapedOldPath = $this->_quote($oldPath);
			$escapedOldPath = mb_substr($escapedOldPath, 1, -1);


			$entriesInFolderCollection = $this->getCore()->getModel("a9os.app.vf.file");
			$entriesInFolderCollection->_setSelect("
				SELECT * from {$entriesInFolderCollection->getTableName()}
				where path like '{$escapedOldPath}%'
			");

			while ($currEntry = $entriesInFolderCollection->fetch()) {
				$newEntryPath = mb_substr($currEntry->getPath(), strlen($oldPath));
				$newEntryPath = $newPath.$newEntryPath;
				$currEntry->setPath($newEntryPath);
				$currEntry->save();
			}
		}
	}




	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 2) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("path", "varchar(500)", false, true, false, "NULL");
			$tableHandle->addField("extension", "varchar(10)", false, true, false, "NULL");
			$tableHandle->addField("hash", "varchar(80)", false, true, false, "NULL");
			$tableHandle->addField("type", "enum('file','folder')", false, true, false, "NULL");
			$tableHandle->addField("preview_made", "int", false, false, false, "'0'");
			$tableHandle->addField("date_modified", "datetime", false, true, false, "CURRENT_TIMESTAMP");

			$tableHandle->createIndex("a9os_user_id", ["a9os_user_id"]);
			$tableInfo = ["version" => 1];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		if ($tableInfo["version"] < 2) {
			$tableHandle->createIndex("path-uq", ["path", "a9os_user_id"], "unique");
			$tableHandle->createIndex("path", ["path"]);
			$tableHandle->createIndex("extension", ["extension"]);

			$tableInfo = ["version" => 2];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}
		return true;
	}
}