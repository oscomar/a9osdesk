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

class a9os_core_app_installer_base extends core_db_model {
	public $arrChangelog = [];

	public function loadArrChangelog(){
		// HACK - corre update() sin hacer updates
		$fakeAppApp = $this->getCore()->getModel("a9os.core.app.installer.base"); // cualquier model
		$fakeAppApp->setAppVersion(json_encode([9999,9999,9999]));

		$this->update($fakeAppApp);
	}
}