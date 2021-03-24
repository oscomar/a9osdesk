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

class a9os_user extends a9os_core_main {
	private static $cookieSent = false;

	public function main($data){
		$currUser = $this->getSessionUser();
		$arrUserConfig = $this->getUserData();

		return [
			"user" => [
				"name" => $currUser->getName()
			],
			"config" => $arrUserConfig
		];
	}

	public function getSessionUser(){
		if (parent::getSessionUser()) return parent::getSessionUser();

		$cookieToken = $_COOKIE["a9os_user_token"]??false;

		if (!$cookieToken) {
			return $this->getAnonUser();
		}

		$user = $this->getCore()->getModel($this);
		$userToken = $this->getCore()->getModel("a9os.user.token");
		$user = $user->_setSelect("
			SELECT *
			from {$user->getTableName()} au
			left join {$userToken->getTableName()} aut 
				on (au.{$user->getPrimaryIdx()} = aut.{$user->getPrimaryIdx()})

			where aut.token={$this->_quote($cookieToken)}
			limit 1
		")->fetch();

		if (!$user) {
			return $this->getAnonUser();			
		}

		if (strtotime($user->getLastAccessDate()) > (time()+15*86400)){ /*15 dias*/
			$user->delete();

			return $this->getAnonUser();
		}

		$userToken = $this->getCore()->getModel("a9os.user.token")->load($user->getA9osUserTokenId());
		$userToken->setLastAccessDate(date("Y-m-d H:i:s"));
		$userToken->save();

		if (!self::$cookieSent) {
			setcookie("a9os_user_token", $userToken->getToken(), time()+60*60*24*15);	
			self::$cookieSent = true;
		}

		$userToken->clearOldTokens();

		$this->setSessionUser($user);
		return $user;
	}

	public function getAnonUser(){
		$user = $this->getcore()->getModel($this);
		$user->_setSelect("
			SELECT *
			from {$user->getTableName()}
			where is_anon_user = 1
			limit 1
		");

		return $user->fetch();
	}

	public function registerUser($newUserData){
		$protection = $this->_getProtection();
		$protection->putPassword($newUserData["system-key"]);


		$newUser = $this->getCore()->getModel("a9os.user");
		$newUser->setName($newUserData["name"]);
		$newUser->setEmail($newUserData["email"]);
		$arrPassPrefixSuffix = $protection->getPasswordPrefixSuffix();
		$newPassword = $arrPassPrefixSuffix["prefix"].$newUserData["password1"].$arrPassPrefixSuffix["suffix"];
		$newUser->setPassword(password_hash($newPassword, PASSWORD_DEFAULT));
		$newUser->setEnabled(1);
		$newUser->setIsAnonUser(0);
		$newUser->save();

		$protection->removePassword();

		return $newUser->getID();
	}

	public function getUserData(){
		if (parent::getUserData()) return parent::getUserData();

		$currUser = $this->getSessionUser();

		$userDataCollection = $this->getCore()->getModel("a9os.user.config");
		$userDataCollection = $userDataCollection->_setSelect("
			SELECT * from {$userDataCollection->getTableName()}
			where {$currUser->getPrimaryIdx()} = {$currUser->getID()}
			and only_backend != 1
		");

		$arrOutput = [];

		while ($currUserConfig = $userDataCollection->fetch()) {
			$arrOutput[ $currUserConfig->getPath() ] = $currUserConfig->getValue();
		}

		return $arrOutput;
	}

	public function receiveUserConfigFromFrontend($data){
		$path = $data["data"]["path"];
		$value = $data["data"]["value"];
		$userConfig = $this->getCore()->getModel("a9os.user.config");
		$this->setConfig($path, $value, false);

		return true;
	}


	/* a9os core arrVersion to tablehandle */
	public function putA9osVersion($arrVersion){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_core_install"]
		]);

		$tableInfo = $this->_getTableInfo();

		$tableInfo["systemVersion"] = $arrVersion;
		$this->_updateTableInfo($tableInfo);
	}
	public function _getA9osVersion(){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_core_main", "a9os_core_install"]
		]);

		$tableInfo = $this->_getTableInfo();
		return $tableInfo["systemVersion"]??false;
	}
	/////////////////


	public function putUserAvatar($path){
		$protection = $this->_getProtection();
		$protection->callOnlyFrom([
			"whitelist" => ["a9os_core_taskbar_applist_avatar"]
		]);

		$systemFolderPath = $this->getUserSystemA9osUserFolder(true);

		$vfMain = $this->getCore()->getModel("a9os.app.vf.main");
		$avatarFilePathComplete = $vfMain->getUserFolder().$path;

		try {
			$tmb = new Imagick();

			$tmb->setBackgroundColor(new ImagickPixel('rgba(0%, 0%, 0%, 0.1)'));
			$tmb->readImage($avatarFilePathComplete);
			$tmb->setImageFormat("png");
			$tmb->thumbnailImage(200, 200, true);
			$tmb->setOption("png:compression-level", 8);
			$tmb->writeImage($systemFolderPath."avatar.png");

			return true;
		} catch (Exception $e) {
			error_log($e);
		}

		return true;
	}

	public function getUserAvatar($pathOrUrl = false){ // default url
		$systemFolderPath = $this->getUserSystemA9osUserFolder(true);
		$file = $systemFolderPath."avatar.png";

		if ($pathOrUrl) {
			return $file;
		} else {
			if (!is_file($file)) return false;
			else return "data:image/png;base64,".base64_encode(file_get_contents($file));
		}
	}

	private function getUserSystemA9osUserFolder($complete = false){
		$vfMain = $this->getCore()->getModel("a9os.app.vf.main");
		$a9osUserFolderPath = "a9os/user/";
		$completeUserSystemFolder = $vfMain->getUserSystemFolder(true);
		$completeUserAvatarFolder = $completeUserSystemFolder.$a9osUserFolderPath;

		if (!is_dir($completeUserAvatarFolder)) mkdir($completeUserAvatarFolder, 0775, true);

		return $vfMain->getUserSystemFolder($complete).$a9osUserFolderPath;
	}





	protected function _manageTable($tableInfo, $tableHandle) {
		$protectionModel = $this->_getProtection();
		if ($protectionModel->restrictToChildClasses(__CLASS__)) return false;

		if ($tableInfo && $tableInfo["version"] && $tableInfo["version"] == 1) return false;

		if (!$tableInfo) {
			$tableHandle->addField("name", "varchar(150)", false, false, false, "''");
			$tableHandle->addField("email", "varchar(150)", false, false, false, "''");
			$tableHandle->addField("password", "varchar(250)", false, false, false, "''");
			$tableHandle->addField("enabled", "int", false, false, false, "'0'");
			$tableHandle->addField("is_anon_user", "int", false, false, false, "'0'");
			$tableHandle->addField("can_request_syskey", "int", false, false, false, "'0'");
			$tableHandle->createIndex("name", ["name"], "unique");
			$tableHandle->createIndex("email", ["email"], "unique");
			$tableInfo = ["version" => 1];
			
			$tableHandle->setTableInfo($tableInfo);
			$tableHandle->save();
		}


		return true;
	}
}