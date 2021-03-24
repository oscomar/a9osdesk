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

class a9os_app_vf_window_folderaddons extends a9os_app_vf_window {

	public function installAddon($addonComponent){
		$coreComponentDepend = $this->getCore()->getModel("core.component.depend");
		$a9osVfDesktopComponent = $this->getCore()->getModel("core.component")->load("a9os_app_vf_desktop", "component_name");

		$coreComponentDepend->setCoreComponentId($a9osVfDesktopComponent->getID());
		$coreComponentDepend->setChildId($addonComponent->getID());
		$coreComponentDepend->setOrder($coreComponentDepend->getLastOrderByComponent($a9osVfDesktopComponent)+1);
		$coreComponentDepend->save();

		$newFolderaddon = $this->getCore()->getModel($this);
		$newFolderaddon->setCoreComponentId($addonComponent->getID());
		$newFolderaddon->save();
		
		return true;
	}

	public function getAddonComponentModels(){
		$folderAddons = $this->getCore()->getModel($this);
		$folderAddons->_setSelect("SELECT * from {$folderAddons->getTableName()}");

		$arrOutput = [];
		while ($currFolderAddon = $folderAddons->fetch()) {
			$arrOutput[] = $this->getCore()->getModel("core.component")->load($currFolderAddon->getCoreComponentId());
		}
		
		return $arrOutput;

	}

	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("core_component_id", "int", false, false, false);

			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}