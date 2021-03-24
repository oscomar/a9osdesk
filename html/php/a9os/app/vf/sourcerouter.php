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

class a9os_app_vf_sourcerouter extends core_db_model {
	const arrControllerPaths = [
		"/vf/copyMove/checkProblems",
		"/vf/copyMove/finalMove",
		"/vf/delete",
		"/vf/download",
		"/vf/fileGetContents",
		"/vf/filePutContents",
		"/vf/folder",
		"/vf/getRegistry",
		"/vf/rename",
		"/vf/newitem",
		"/vf/update"
	];

	const arrControllerCheckDataKeys = [
		["data", "dest"],
		["data", "dest"],
		["data", "path", 0],
		["data", 0],
		["data", "path"],
		["getData", "path"],
		["data", "path"],
		["data", "arrPaths"], //array con paths de posibles diferentes sources
		["data", "path", 0, "to"],
		["data", "newPath"],
		["data", "path"]
	];

	const arrMultipathControllers = ["/vf/getRegistry"];


	public function getControllerCollection(){
		$arrControllerPaths = $this::arrControllerPaths;

		foreach ($arrControllerPaths as $k => $currPath) {
			$arrControllerPaths[$k] = $this->_quote($currPath);
		}

		$strArrControllerPaths = implode(",", $arrControllerPaths);

		$coreControllerCollection = $this->getCore()->getModel("core.controller");
		$coreControllerCollection->_setSelect("
			SELECT * from {$coreControllerCollection->getTableName()}
			where path in ({$strArrControllerPaths})
		");

		return $coreControllerCollection;
	}


	public function main($data){
		$controllerId = (int)$data["core_controller_id"];
		$coreController = $this->getCore()->getModel("core.controller")->load($controllerId);

		if ($this->isMultisource($coreController)) {
			return $this->processMultisource($coreController, $data);
		}



		$pathPrefix = $this->getPrefixFromDataRequest($data, $coreController);


		$sourceRouterComponentCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter");
		$sourceRouterComponentCollection->_setSelect("
			SELECT * 
			from {$sourceRouterComponentCollection->getTableName()} aavs
			where aavs.path_prefix = {$this->_quote($pathPrefix)}
			and aavs.core_controller_id = {$controllerId}
			order by aavs.order asc
		");

		while ($currSourceRouter = $sourceRouterComponentCollection->fetch()) {//por el momento solo va a set 1
			$currDerivatedComponent = $this->getCore()->getModel("core.component")->load($currSourceRouter->getCoreComponentId());
			return $currDerivatedComponent->buildComponentOutput($data)["data"];
		}

	}

	public function getPrefixFromDataRequest($data, $coreController){
		if ($this->isMultisource($coreController)) return false;

		$controllerPathK = array_search($coreController->getPath(), self::arrControllerPaths);
		$arrPathKeySource = self::arrControllerCheckDataKeys[$controllerPathK];

		$path = $data;

		foreach ($arrPathKeySource as $k => $currPathKeySource) {
			$path = $path[$currPathKeySource];
		}

		if (!is_string($path)) {
			error_log(var_export($data, true));
			throw new Exception("getPrefixFromDataRequest: ".$coreController->getPath()." dataKey error");	
		}
		
		$arrPath = explode("/", $path);
		if ($arrPath[0] == "") return "/";
		return strtoupper($arrPath[0]);
	}


	public function isMultisource($coreController){
		return in_array($coreController->getPath(), self::arrMultipathControllers);
	}

	public function processMultisource($coreController, $data){
		$controllerPathK = array_search($coreController->getPath(), self::arrControllerPaths);
		$arrPathKeySource = self::arrControllerCheckDataKeys[$controllerPathK];

		$arrPaths = $data;
		foreach ($arrPathKeySource as $k => $currPathKeySource) {
			$arrPaths = $arrPaths[$currPathKeySource];
		}


		$arrPathsPerPrefix = [];
		//error_log(var_export($arrPaths, true));
		foreach ($arrPaths as $k => $currPath) {
			$arrPathSlashes = explode("/", $currPath);

			if ($arrPathSlashes[0] == "") $currPrefix = "/";
			else $currPrefix = $arrPathSlashes[0];

			if (!isset($arrPathsPerPrefix[$currPrefix])) $arrPathsPerPrefix[$currPrefix] = [];
			$arrPathsPerPrefix[$currPrefix][] = $currPath;
		}

		$mergedReturn = [];

		foreach ($arrPathsPerPrefix as $currPrefix => $arrPrefixPaths) {
			$clonedData = $data;

			//new arr paths to original data
			$currDataReference = &$clonedData;
			$currDataReference = &$currDataReference;
			foreach ($arrPathKeySource as $k => $currPathKeySource) {
				$currDataReference = &$currDataReference[$currPathKeySource];
			}
			$currDataReference = $arrPrefixPaths;


			$sourceRouterComponentCollection = $this->getCore()->getModel("a9os.app.vf.sourcerouter");
			$sourceRouterComponentCollection->_setSelect("
				SELECT * 
				from {$sourceRouterComponentCollection->getTableName()} aavs
				where aavs.path_prefix = {$this->_quote($currPrefix)}
				and aavs.core_controller_id = {$coreController->getID()}
				order by aavs.order asc
			");

			$currSourceRouter = $sourceRouterComponentCollection->fetch();

			if (!$currSourceRouter) continue;

			$currDerivatedComponent = $this->getCore()->getModel("core.component")->load($currSourceRouter->getCoreComponentId());
			if ($currDerivatedComponent) $mergedReturn = array_merge($mergedReturn, $currDerivatedComponent->buildComponentOutput($data)["data"]??[]);
		}


		return $mergedReturn;

	}


	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;
		
		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("path_prefix", "varchar(20)", false, false, false);
			$tableHandle->addField("core_controller_id", "int", false, true, false, "NULL");
			$tableHandle->addField("core_component_id", "int", false, true, false, "NULL");
			$tableHandle->addField("order", "int", false, false, false, "'0'");
			$tableHandle->createIndex("core_controller_id", ["core_controller_id"]);
			$tableHandle->createIndex("path_prefix", ["path_prefix"]);
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}

		return true;
	}
}