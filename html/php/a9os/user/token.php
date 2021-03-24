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

class a9os_user_token extends a9os_user {
	public function addNew($userId, $userTokenStr){
		$newUserToken = $this->getCore()->getModel($this);

		$newUserToken->setA9osUserId($userId);
		$newUserToken->setToken($userTokenStr);
		$newUserToken->setLastAccessDate(date("Y-m-d H:i:s"));
		$newUserToken->save();

		return true;
	}

	public function clearOldTokens(){
		$tokenCollection = $this->getCore()->getModel("a9os.user.token");
		$tokenCollection->_setSelect("
			SELECT *
			from {$tokenCollection->getTableName()}
			where last_access_date < DATE_SUB(now(), interval 15 day)
		");

		while ($currToken = $tokenCollection->fetch()) {
			$currToken->delete();
		}
		return true;
	}


	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("token", "varchar(50)", false, true, false, "NULL");
			$tableHandle->addField("last_access_date", "DATETIME", false, true, false, "NULL");

			$tableHandle->createIndex("a9os_user_id", ["a9os_user_id"]);

			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}


		return true;
	}
}