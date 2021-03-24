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

class a9os_app_vf_sourcerouter_item extends a9os_app_vf_sourcerouter {


	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;
		
		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 2) return false;

		if (!$tableInfo) {
			$tableHandle->addField("path_prefix", "varchar(20)", false, false, false);
			$tableHandle->addField("name", "varchar(100)", false, false, false);
			$tableHandle->addField("icon_url", "varchar(255)", false, true, false, "NULL");
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		if ($tableInfo["version"] < 2) {
			$tableHandle->addField("application_application_id", "int", false, true, false, "NULL");
			$tableHandle->createIndex("path_prefix", ["path_prefix"], "unique");

			$tableInfo = ["version" => 2];
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}