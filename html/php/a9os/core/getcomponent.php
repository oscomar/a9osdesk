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
/*
class a9os_core_getcomponent extends a9os_core_main {
	public function main($postData){
		$arrComponentName = $postData["components_name"];
		$componentCollection = $this->getCore()->getModel("core.component");
		$componentCollection = $componentCollection->_setSelect("
			SELECT * from ".$componentCollection->getTableName()." 
			where component_name in('".implode("','", $arrComponentName)."') 
			order by field(component_name, '".implode("','", $arrComponentName)."')
		");
		
		$arrComponentIds = [];
		while ($currComponent = $componentCollection->fetch()){
			$arrComponentIds[] = $currComponent->getID();
		}


		return $this->getCore()->getModel("core.component")->loadComponents($arrComponentIds, $postData);
	}
}*/