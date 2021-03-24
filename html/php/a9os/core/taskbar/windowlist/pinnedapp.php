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

class a9os_core_taskbar_windowlist_pinnedapp extends a9os_core_taskbar_windowlist {
	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$arrItems = $data["data"]["items"];

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		//if ($user->getIsAnonUser()) return;

		$pinnedAppsCollection = $this->getPinnedAppCollection();
		if (!$pinnedAppsCollection) return;

		while ($currPinnedApp = $pinnedAppsCollection->fetch()){
			if (!isset($arrItems[$currPinnedApp->getApplicationApplicationId()])) {
				$currPinnedApp->delete();
			} else {
				$currItem = $arrItems[$currPinnedApp->getApplicationApplicationId()];
				$arrItems[$currPinnedApp->getApplicationApplicationId()]["used"] = true;

				if ($currPinnedApp->getPosition() != $currItem["position"]) {
					$currPinnedApp->setPosition($currItem["position"]);
					$currPinnedApp->save();
				}
			}
		}

		foreach ($arrItems as $currAppId => $currItem) {
			if (!isset($currItem["used"])) {
				$newPinnedApp = $this->getCore()->getModel("a9os.core.taskbar.windowlist.pinnedapp");
				$newPinnedApp->setApplicationApplicationId($currAppId);
				$newPinnedApp->setA9osUserId($user->getID());
				$newPinnedApp->setPosition($currItem["position"]);
				$newPinnedApp->save();
			}
		}
	}

	public function getPinnedAppData(){
		$pinnedAppsCollection = $this->getPinnedAppCollection();
		if (!$pinnedAppsCollection) return [];

		$arrOutput = [];
		while ($currPinnedApp = $pinnedAppsCollection->fetch()){
			$arrOutput[] = [
				"appId" => $currPinnedApp->getApplicationApplicationId(),
				"position" => $currPinnedApp->getPosition()
			];
		}

		return $arrOutput;
	}

	public function getPinnedAppCollection(){
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		//if ($user->getIsAnonUser()) return false;

		$pinnedAppsCollection = $this->getCore()->getModel($this);
		$pinnedAppsCollection->_setSelect(" SELECT * from {$pinnedAppsCollection->getTableName()}
			where {$user->getPrimaryIdx()} = {$user->getID()}
			order by position asc
		");

		return $pinnedAppsCollection;
	}



	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("application_application_id", "int", false, true, false, "NULL");
			$tableHandle->addField("position", "int", false, false, false, "'0'");
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}


		return true;
	}
}