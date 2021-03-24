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

class a9os_core_taskbar_applist extends a9os_core_taskbar {
	public function main($data){
		$aa = $this->getCore()->getModel("application.application");
		$cca = $this->getCore()->getModel("core.controller.application");
		$cc = $this->getCore()->getModel("core.controller");
		$aa = $aa->_setSelect("
			SELECT * from {$aa->getTableName()} aa 
			left join {$cca->getTableName()} cca 
				on ( aa.{$aa->getPrimaryIdx()} = cca.{$aa->getPrimaryIdx()} )

			left join {$cc->getTableName()} cc 
				on (cc.{$cc->getPrimaryIdx()} = cca.{$cc->getPrimaryIdx()})
			
			where cca.is_main_window = 1
			order by aa.name asc
		");

		$appList = [];
		while($currAppList = $aa->fetch()) {
			if ($currAppList->validateUserScope()){
				$appList[] = $currAppList->getData();
			}
		}

		$a9osUser = $this->getCore()->getModel("a9os.user");
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();

		return [
			"appList" => $appList,
			"userAvatar" => $a9osUser->getUserAvatar(),
			"systemAnonMode" => $systemAnonMode
		];
	}
}