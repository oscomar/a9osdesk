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

class a9os_app_vf_modules_tags_folderaddon extends a9os_app_vf_window_folderaddons_main {
	public function main($data){
		return [];
	}

	public function receiveFiles($path, $arrFiles){
		$pathIsTag = $this->getIfPathIsTag($path);

		$fileTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
		if (!$pathIsTag) $fileTag->loadTagsFromPath($path);

		$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$arrAllTags = $vfTag->getArrAllTags();

		$arrOutput = [];
		$arrOutput["allTags"] = $arrAllTags;

		$arrOutput["files"] = [];

		if ($pathIsTag) $arrOutput["realPaths"] = [];

		foreach ($arrFiles as $currFile) {
			if ($currFile->getType() == "folder") continue;

			if ($pathIsTag) {
				if (!$currFile->getRealPath()) $currFile->setRealPath($currFile->getPath());
				$fileParentPath = $currFile->getRealPath();
				$fileParentPath = explode("/", $fileParentPath);
				array_pop($fileParentPath);
				$fileParentPath = implode("/", $fileParentPath)."/";

				$fileTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
				$fileTag->loadTagsFromPath($fileParentPath);

				$arrOutput["realPaths"][$currFile->getID()] = $currFile->getRealPath();
			}

			$arrFileTags = $fileTag->getFileTags($currFile->getID());
			$arrOutput["files"][$currFile->getID()] = $arrFileTags;
		}

		return $arrOutput;
	}

	public function getIfPathIsTag($path){
		$arrPath = explode("/", $path);
		return ($arrPath[0] && $arrPath[0] == "TAGS");
	}

	public function addNewTagToFile($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");


		$path = $data["data"]["path"];
		$fileId = $data["data"]["fileItemId"];
		$tagName = $data["data"]["name"];
		$tagValue = $data["data"]["value"];
		$editModeAndFromName = $data["data"]["editModeAndFromName"];

		$fileId = (int)$fileId;
		$tagName = mb_strtolower(trim($tagName));
		$tagValue = mb_strtolower(trim($tagValue));
		$path = trim($path);

		if ($editModeAndFromName !== false) $editModeAndFromName = mb_strtolower(trim($editModeAndFromName));

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$vfFile = $this->getCore()->getModel("a9os.app.vf.file")->load($fileId);
		if (!$vfFile) return "FILE NOT EXIST";

		$tagIfExists = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag")->load($tagName, "name");

		if (!$tagIfExists || ($tagIfExists && $tagIfExists->getA9osUserId() != $a9osUser->getID())) {
			$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
			$vfTag->setA9osUserId($a9osUser->getID());
			$vfTag->setName($tagName);
			$vfTag->save();
		} else {
			$vfTag = $tagIfExists;
		}

		$fileTagIfExists = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
		$fileTagIfExists->_setSelect("
			SELECT * from {$fileTagIfExists->getTableName()}
			where {$vfFile->getPrimaryIdx()} = {$vfFile->getID()}
			and {$vfTag->getPrimaryIdx()} = {$vfTag->getID()}
			and value = {$this->_quote($tagValue)}
		");
		$fileTagIfExists = $fileTagIfExists->fetch();

		if ($editModeAndFromName) {
			$fileTagToEdit = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
			$fileTagToEdit->_setSelect("
				SELECT * from {$fileTagToEdit->getTableName()}
				where {$vfFile->getPrimaryIdx()} = {$vfFile->getID()}
				and {$vfTag->getPrimaryIdx()} = {$vfTag->getID()}
				and value = {$this->_quote($editModeAndFromName)}
			");
			if (!$fileTagToEdit) return "EDIT TAG NOT FOUND";
			if ($fileTagIfExists) return "EDIT TAG ALREADY EXISTS";

			$fileTagToEdit = $fileTagToEdit->fetch();
			$fileTagToEdit->setValue($tagValue);
			$fileTagToEdit->save();

		} else {
			if ($fileTagIfExists) return "TAG VALUE EXIST";

			$vfFileTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
			$vfFileTag->setA9osAppVfFileId($vfFile->getID());
			$vfFileTag->setA9osAppVfModulesTagsTagId($vfTag->getID());
			$vfFileTag->setValue($tagValue);
			$vfFileTag->save();
		}



		return $this->receiveFiles($path, [$vfFile]);
	}


	public function deleteTag($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");


		
		$path = $data["data"]["path"];
		$fileId = $data["data"]["fileItemId"];
		$tagName = $data["data"]["name"];
		$tagValue = $data["data"]["value"];

		$fileId = (int)$fileId;
		$tagName = mb_strtolower(trim($tagName));
		$tagValue = mb_strtolower(trim($tagValue));
		$path = trim($path);

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$vfFile = $this->getCore()->getModel("a9os.app.vf.file")->load($fileId);
		if (!$vfFile) return "NOT FOUND";

		$tagIfExists = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag")->load($tagName, "name");

		if (!$tagIfExists || ($tagIfExists && $tagIfExists->getA9osUserId() != $a9osUser->getID())) {
			return "NOT FOUND";
		} else {
			$vfTag = $tagIfExists;
		}

		$fileTagIfExists = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
		$fileTagIfExists->_setSelect("
			SELECT * from {$fileTagIfExists->getTableName()}
			where {$vfFile->getPrimaryIdx()} = {$vfFile->getID()}
			and {$vfTag->getPrimaryIdx()} = {$vfTag->getID()}
			and value = {$this->_quote($tagValue)}
		");
		$fileTagIfExists = $fileTagIfExists->fetch();

		if (!$fileTagIfExists) return "NOT FOUND";

		$fileTagIfExists->delete();

		$this->checkAndDeleteEmptyTagNames();

		return $this->receiveFiles($path, [$vfFile]);
	}

	public function checkAndDeleteEmptyTagNames(){
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$tagNamesCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$tagNamesCollection->_setSelect("
			SELECT *
			from {$tagNamesCollection->getTableName()}
			where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
		");

		while ($currTagName = $tagNamesCollection->fetch()) {
			$tmpTagValuesCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
			$tmpTagValuesCollection->_setSelect("
				SELECT * 
				from {$tmpTagValuesCollection->getTableName()}
				where {$currTagName->getPrimaryIdx()} = {$currTagName->getID()}
			");
			if ($tmpTagValuesCollection->fetch()) continue;

			$currTagName->delete();
		}
	}
}