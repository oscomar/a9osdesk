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

class a9os_app_vf_sourcerouter_item_user extends a9os_app_vf_sourcerouter_item {
	public function deleteWhere($str){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_sourcerouter_edit_window::submit"]
		]);

		return parent::deleteWhere($str);
	}
	public function save(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_app_vf_sourcerouter_edit_window::submit"]
		]);

		return parent::save();
	}

	public function getEnabledSources(){
		$sourcesCollection = $this->getSourcesCollection();

		$arrOutput = [];
		while ($currSource = $sourcesCollection->fetch()) {
			if (!(bool)$currSource->getIsSelected()) continue;

			$arrOutput[] = [
				"item_id" => $currSource->getID(),
				"name" => $currSource->getName(),
				"icon_url" => $currSource->getIconUrl(),
				"path_prefix" => $currSource->getPathPrefix()
			];
		}

		return $arrOutput;
	}

	public function getSourcesCollection(){
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$sourcesCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item");
		$sourcesCollection->_setSelect("
			SELECT aavsi.*, if(aavsiu.a9os_user_id IS NULL , 0, 1) as 'is_selected' FROM a9os_app_vf_sourcerouter_item aavsi
			LEFT JOIN application_application aa ON (aavsi.application_application_id = aa.application_application_id)
			LEFT JOIN application_application_user aau ON (aau.application_application_id = aa.application_application_id)
			LEFT JOIN a9os_app_vf_sourcerouter_item_user aavsiu ON (aavsiu.a9os_app_vf_sourcerouter_item_id = aavsi.a9os_app_vf_sourcerouter_item_id)

			WHERE aa.app_scope = 'public' OR (
			 aa.app_scope = 'private' AND aau.a9os_user_id = {$a9osUser->getID()}
			)

			ORDER BY is_selected DESC, aavsiu.`order` asc
		");

		return $sourcesCollection;
	}

	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;
		
		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_app_vf_sourcerouter_item_id", "int", false, false, false);
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("order", "int", false, false, false, "'0'");

			$tableHandle->createIndex("a9os_app_vf_sourcerouter_item_id", ["a9os_app_vf_sourcerouter_item_id", "a9os_user_id"], "unique");
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}