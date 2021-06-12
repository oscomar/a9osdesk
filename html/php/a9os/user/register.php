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

class a9os_user_register extends a9os_user {
	public function main($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");


		return [
			"window" => [
				"title" => "Nuevo usuario",
				"favicon-url" => "/resources/a9os/app/vf/icons/register.svg",
				"resize" => "false",
				"width" => "300px",
				"height" => "auto",
				"position" => "center",
				"windowColor" => "rgba(220,220,220,0.8)"
			],
		];
	}

	public function submit($data){
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($systemAnonMode == "demo") throw new Exception("__DEMO__");
		
		$formData = $data["data"];
		$arrErrors = [
			"name" => [],
			"email" => [],
			"password2" => []
		];
		$error = false;

		if (strstr($formData["name"], " ")){
			$error = true;
			$arrErrors["name"][] = "El nombre no debe contener espacios";
		}
		if (!preg_match('/^[a-zA-Z]+[a-zA-Z0-9._\-]+$/', $formData["name"])){
			$error = true;
			$arrErrors["name"][] = "El nombre solo puede tener letras, números, '-', '_' y '.'";
		}
		if (!filter_var($formData["email"], FILTER_VALIDATE_EMAIL)){
			$error = true;
			$arrErrors["email"][] = "El email no es válido";
		}
		if ($formData["password1"] != $formData["password2"]) {
			$error = true;
			$arrErrors["password2"][] = "Las contraseñas no coinciden";
		}

		if ($this->userNameIsRegistered($formData["name"])){
			$error = true;
			$arrErrors["name"][] = "El nombre de usuario ya está siendo usado";
		}

		if ($this->userEmailIsRegistered($formData["email"])){
			$error = true;
			$arrErrors["email"][] = "Este email ya está siendo usado";
		}


		try {
			$newUserID = $this->registerUser($formData);
		} catch (Exception $e) {
			error_log($e);
			
			$error = true;
			$arrErrors["system-key"][] = "La System Key es incorrecta";
		}

		if ($error) return $arrErrors;

		if ($newUserID) return "ok";
	}

	public function userNameIsRegistered($name){
		return (bool)$this->getCore()->getModel("a9os.user")->load($name, "name");
	}

	public function userEmailIsRegistered($email){
		return (bool)$this->getCore()->getModel("a9os.user")->load($email, "email");
	}
}