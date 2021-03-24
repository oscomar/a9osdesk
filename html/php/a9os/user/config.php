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

class a9os_user_config extends a9os_user {
	public function getConfig($path, $onlyValue = true){ //for backend use
		$path = trim(mb_strtolower($path));

		$config = $this->getCore()->getModel($this);
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$return = $config->_setSelect("
			SELECT * 
			from {$config->getTableName()}
			where path={$this->_quote($path)}
			and {$user->getPrimaryIdx()}={$user->getID()}
		")->fetch();

		if ($return) {
			if ($onlyValue) return $return->getValue();
			else return $return;
		}
		return null;
	}

	public function setConfig($path, $value, $onlyBackend = true){
		$path = trim(mb_strtolower($path));
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$userConfig = $this->getCore()->getModel("a9os.user.config");
		$userConfig->_setSelect("
			SELECT * from {$userConfig->getTableName()}
			where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
			and path = {$this->_quote($path)}
		");
		$userConfig = $userConfig->fetch();
		if (!$userConfig) $userConfig = $this->getCore()->getModel("a9os.user.config");

		$userConfig->setPath($path);
		$userConfig->setValue($value);
		$userConfig->setA9osUserId($a9osUser->getID());
		$userConfig->setOnlyBackend((int)$onlyBackend);
		$userConfig->save();
		
	}


	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("path", "varchar(200)", false, true, false, "NULL");
			$tableHandle->addField("value", "text", false, true, false, "NULL");
			$tableHandle->addField("only_backend", "int", false, true, false, "'0'");

			$tableHandle->createIndex("path", ["path", "a9os_user_id"], "unique");
			$tableHandle->createIndex("a9os_user_id", ["a9os_user_id"]);
			
			$tableInfo = ["version" => 1];

			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}