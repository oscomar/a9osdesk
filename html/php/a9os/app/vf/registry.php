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

class a9os_app_vf_registry extends a9os_app_vf_main {
	public function newRegistry($path, $action){
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$this->setA9osUserId($user->getID());
		$this->setFilePath($path);
		$this->setAction($action);
		$this->setDateAdd(date("Y-m-d H:i:s"));
		$this->save();

		if ($this->getID() % 10 == 0) { //cada 10 registros
			$this->clearOldRegisters();
		}

		return $this;
	}

	public function clearOldRegisters(){
		$aavr = $this->getCore()->getModel("a9os.app.vf.registry");
		$aavr->deleteWhere("date_add < ".$this->_quote(date("Y-m-d H:i:s", strtotime("-3 hour"))));
	}

	/*public function deleteWhere($v){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_registry"]
		])
		return parent::deleteWhere($v);
	}*/

	public function main($data){
		$arrPaths = $data["data"]["arrPaths"];

		if (count($arrPaths) == 0) return;

		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") return;

		$arrFilteredPaths = [];
		foreach ($arrPaths as $currI => $currPath) {
			$arrFilteredPaths[] = $this->_quote($currPath);
		}
		$arrFilteredPaths = array_unique($arrFilteredPaths);

		$aavr = $this->getCore()->getModel($this);
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$aavr = $aavr->_setSelect("
			SELECT * from {$aavr->getTableName()}

			where file_path in (".implode(", ", $arrFilteredPaths).")
			and {$user->getPrimaryIdx()} = {$user->getID()}
			and date_add in (select max(date_add) from {$aavr->getTableName()} 

			group by file_path, action)
		");

		$arrResp = [];
		while ($currRegistry = $aavr->fetch()) {
			$arrResp[] = [
				"id" => $currRegistry->getID(),
				"path" => $currRegistry->getFilePath(),
				"index" => $this->getArrIndexes($currRegistry->getFilePath(), $arrPaths),
				"date_add" => $currRegistry->getDateAdd(),
				"action" => $currRegistry->getAction()
			];
		}

		return $arrResp;
	}

	public function getArrIndexes($filePath, $arrPaths){
		$arrResp = [];
		foreach ($arrPaths as $currI => $currPath) {
			if ($currPath == $filePath) {
				$arrResp[] = $currI;
			}
		}

		return $arrResp;
	}



	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("file_path", "varchar(500)", false, true, false, "NULL");
			$tableHandle->addField("action", "varchar(50)", false, true, false, "NULL");
			$tableHandle->addField("date_add", "datetime", false, true, false, "NULL");

			$tableHandle->createIndex("a9os_user_id", ["a9os_user_id"]);
			$tableHandle->createIndex("file_path", ["file_path"]);
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}