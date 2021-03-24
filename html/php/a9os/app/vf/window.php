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

class a9os_app_vf_window extends a9os_core_window {
	public function main($data){
		$arrBookmarks = $this->getCore()->getModel("a9os.app.vf.window.bookmark")->getBookmarks();
		$arrSources = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item.user")->getEnabledSources();
		return [
			"window" => $this->getWindowData($data, [
				"width" => "860px",
				"height" => "460px",
				"windowColor" => "#29546b",
				//"windowColor" => "#dddddd"
			]),
			"bookmarks" => $arrBookmarks,
			"arrSources" => $arrSources
		];
	}
}