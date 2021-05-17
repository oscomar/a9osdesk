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

class a9os_app_vf_window_bookmark extends a9os_app_vf_window {
	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");

		
		$arrItems = $data["data"]["items"];

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		if ($user->getIsAnonUser()) return;

		$bookmarkCollection = $this->getBookmarkCollection();
		if (!$bookmarkCollection) return;

		while ($currBookmark = $bookmarkCollection->fetch()){
			if (!isset($arrItems[$currBookmark->getPath()])) {
				$currBookmark->delete();
			} else {
				$currItem = $arrItems[$currBookmark->getPath()];
				$arrItems[$currBookmark->getPath()]["used"] = true;

				if ($currBookmark->getPosition() != $currItem["position"]) {
					$currBookmark->setPosition($currItem["position"]);
					$currBookmark->save();
				}
			}
		}

		foreach ($arrItems as $currPath => $currItem) {
			if (!isset($currItem["used"])) {
				$newBookmark = $this->getCore()->getModel($this);
				$newBookmark->setPath($currPath);
				$newBookmark->setA9osUserId($user->getID());
				$newBookmark->setPosition($currItem["position"]);
				$newBookmark->save();
			}
		}
	}

	public function getBookmarks(){
		$userFolder = $this->getCore()->getModel("a9os.app.vf.main")->getUserFolder();
		
		$bookmarkCollection = $this->getBookmarkCollection();
		if (!$bookmarkCollection) return [];

		$arrOutput = [];
		while ($currBookmark = $bookmarkCollection->fetch()){
			if (!file_exists(substr($userFolder, 0, -1).$currBookmark->getPath())) {
				$currBookmark->delete();
				continue;
			}

			$arrOutput[] = [
				"path" => $currBookmark->getPath(),
				"position" => $currBookmark->getPosition()
			];
		}

		return $arrOutput;
	}

	public function getBookmarkCollection(){
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		//if ($user->getIsAnonUser()) return false;

		$bookmarkCollection = $this->getCore()->getModel($this);
		$bookmarkCollection->_setSelect(" SELECT * from {$bookmarkCollection->getTableName()}
			where {$user->getPrimaryIdx()} = {$user->getID()}
			order by position asc
		");

		return $bookmarkCollection;
	}




	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("a9os_user_id", "int", false, false, false);
			$tableHandle->addField("path", "varchar(500)", false, false, false);
			$tableHandle->addField("position", "int", false, false, false, "'0'");

			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}