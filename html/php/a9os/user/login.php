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

class a9os_user_login extends a9os_user {
	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");
		
		$arrUserPass = $data["data"];

		if (empty($arrUserPass["name"]) || empty($arrUserPass["password"])) return "error0";

		$arrUserPass["password"] = str_replace("\n", "", $arrUserPass["password"]);
		
		$user = $this->getCore()->getModel("a9os.user")->load($arrUserPass["name"], "name");

		if (!$user) {
			return "error1";
		}

		$realUserPassHash = $user->getPassword();

		$protection = $this->_getProtection();
		$arrPassPrefixSuffix = $protection->getPasswordPrefixSuffix();

		$attemptUserPassHash = $arrPassPrefixSuffix["prefix"].$arrUserPass["password"].$arrPassPrefixSuffix["suffix"];


		if (!password_verify($attemptUserPassHash, $realUserPassHash)) {
			return "error2";
		} else {
			$userTokenStr = md5(
				$protection->getSystemKeyMd5().
				$attemptUserPassHash.
				date("Y-m-d H:i:s")
			);

			$newUserToken = $this->getCore()->getModel("a9os.user.token");
			$newUserToken->addNew($user->getID(), $userTokenStr);

			setcookie("a9os_user_token", $userTokenStr, time()+60*60*24*15);
			return "ok";
		}
	}
}