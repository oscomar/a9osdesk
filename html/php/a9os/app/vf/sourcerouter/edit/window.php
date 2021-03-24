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

class a9os_app_vf_sourcerouter_edit_window extends a9os_core_window {
	public function main($data){
		$arrSourcesData = $this->getSourcesData();
		return [
			"window" => [
				"title" => "Editar fuentes",
				"favicon-url" => "/resources/a9os/app/vf/icon.svg",
				"resize" => "false",
				"width" => "300px",
				"height" => "400px",
				"position" => "center",
				"windowColor" => "rgba(255,255,255,0.8)"
			],
			"sources_data" => $arrSourcesData
		];
	}

	public function getSourcesData(){
		$sourcesCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item.user")->getSourcesCollection();

		$arrOutput = [];
		while ($currSource = $sourcesCollection->fetch()) {
			$arrOutput[] = [
				"item_id" => $currSource->getID(),
				"name" => $currSource->getName(),
				"icon_url" => $currSource->getIconUrl(),
				"is_selected" => (bool)$currSource->getIsSelected(),
			];
		}

		return $arrOutput;
	}

	public function submit($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");


		
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$arrSelectedIds = $data["data"]["arrItems"];

		$sourcerouterItemUser = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item.user");
		$sourcerouterItemUser->deleteWhere("{$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}");

		foreach ($arrSelectedIds as $index => $currSelectedId) {
			$sourcerouterItemUser = $this->getCore()->getModel("a9os.app.vf.sourcerouter.item.user");
			$sourcerouterItemUser->setA9osAppVfSourcerouterItemId((int)$currSelectedId);
			$sourcerouterItemUser->setA9osUserId($a9osUser->getID());
			$sourcerouterItemUser->setOrder($index);
			$sourcerouterItemUser->save();
		}


		return $sourcerouterItemUser->getEnabledSources();
	}
}