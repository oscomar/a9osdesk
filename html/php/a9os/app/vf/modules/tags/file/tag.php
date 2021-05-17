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

class a9os_app_vf_modules_tags_file_tag extends core_db_model {

	public function save(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_modules_tags_folderaddon"]
		]);

		return parent::save();
	}

	public function delete(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_modules_tags_folderaddon", "a9os_app_vf_modules_tags_folder"]
		]);

		return parent::delete();
	}
	
	public function getFileTags($fileId){
		$arrTagsByFileId = $this->getArrTagsInFolderFiles();
	
		return $arrTagsByFileId[$fileId]??[];
	}

	public function loadTagsFromPath($path){
		$path = $this->_quote($path);
		$path = mb_substr($path, 1, -1); // escapar sin las comillas
		
		$this->setFileTagParentPath($path);
		$this->getArrTagsInFolderFiles();
	}

	public function getArrTagsInFolderFiles(){
		if (parent::getArrTagsInFolderFiles()) return parent::getArrTagsInFolderFiles();

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		/*if ($user->getIsAnonUser()) {
			$this->setTagsCollection(false);
			return false;
		}*/

		$slashQty = substr_count($this->getFileTagParentPath(), "/"); // solo archivos con la misma cantidad de barras

		$tagsCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
		$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$vfFile = $this->getCore()->getModel("a9os.app.vf.file");
		$tagsCollection->_setSelect("
			SELECT aavft.* , aavt.* from {$tagsCollection->getTableName()} aavft
			left join {$vfTag->getTableName()} aavt on aavt.{$vfTag->getPrimaryIdx()} = aavft.{$vfTag->getPrimaryIdx()}
			left join {$vfFile->getTableName()} aavf on aavf.{$vfFile->getPrimaryIdx()} = aavft.{$vfFile->getPrimaryIdx()}
			
			where aavt.{$user->getPrimaryIdx()} = {$user->getID()}
			and aavf.path like '{$this->getFileTagParentPath()}%' 
			and aavf.type = 'file' 
			and (LENGTH(aavf.path) - LENGTH(REPLACE(aavf.path, '/', ''))) = {$slashQty}
		"); // a9os_app_vf_file_tag_id, a9os_app_vf_file_id, a9os_app_vf_tag_id, value (tagvalue), a9os_app_vf_tag_id, a9os_user_id, name (tagname)


		$arrTagsByFileId = [];
		while ($currTagObj = $tagsCollection->fetch()) {
			if (!isset($arrTagsByFileId[ $currTagObj->getA9osAppVfFileId() ])) {
				$arrTagsByFileId[ $currTagObj->getA9osAppVfFileId() ] = [];
			}

			$arrTagsByFileId[ $currTagObj->getA9osAppVfFileId() ][] = [
				"tag_name" => $currTagObj->getName(),
				"tag_value" => $currTagObj->getValue()
			];
		}


		$this->setArrTagsInFolderFiles($arrTagsByFileId);
		return $arrTagsByFileId;
	}


	public function getArrAllTags(){
		if (parent::getArrAllTags()) return parent::getArrAllTags();

		$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$arrAllTags = $vfTag->getArrAllTags();

		$this->setArrAllTags($arrAllTags);
		return $arrAllTags;
	}




	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 3) return false;


		if (!$tableInfo) {
			if ($tableHandle->migrateOldTable("a9os_app_vf_file_tag")) return true;

			$tableHandle->addField("a9os_app_vf_file_id", "int", false, false, false);
			$tableHandle->addField("a9os_app_vf_tag_id", "int", false, false, false);
			$tableHandle->addField("value", "varchar(100)", false, true, false, "NULL");

			$tableInfo = ["version" => 1];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();

		}

		if ($tableInfo["version"] < 2) {
			$tableHandle->changeField("a9os_app_vf_tag_id", "a9os_app_vf_modules_tags_tag_id", "int", false, false, false);

			$tableInfo = ["version" => 2];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}
		if ($tableInfo["version"] < 3) {
			$tableHandle->createIndex("a9os_app_vf_file_id", ["a9os_app_vf_file_id"]);
			$tableHandle->createIndex("a9os_app_vf_modules_tags_tag_id", ["a9os_app_vf_modules_tags_tag_id"]);

			$tableInfo = ["version" => 3];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}
		return true;
	}
}