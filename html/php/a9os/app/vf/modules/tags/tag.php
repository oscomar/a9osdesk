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

class a9os_app_vf_modules_tags_tag extends core_db_model {

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
			"whitelist" => ["a9os_app_vf_modules_tags_folderaddon"]
		]);

		return parent::delete();
	}

	public function getArrAllTags(){
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$vfTag->_setSelect("
			SELECT name from {$vfTag->getTableName()}
			where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
		");

		$arrAllTags = [];

		while ($currTagObj = $vfTag->fetch()) {
			$arrAllTags[] = $currTagObj->getName();
		}

		return $arrAllTags;
	}




	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			if ($tableHandle->migrateOldTable("a9os_app_vf_tag")) return true;


			$tableHandle->addField("a9os_user_id", "int", false, true, false, "NULL");
			$tableHandle->addField("name", "varchar(50)", false, true, false, "NULL");

			$tableInfo = ["version" => 1];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}