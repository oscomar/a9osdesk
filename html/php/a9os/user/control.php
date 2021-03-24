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

class a9os_user_control extends a9os_user {
	public function componentAllowed($component){
		if (!$this->allowedBySystemAnonMode($component)) {
			return false;
		}
		if (!$this->allowedByUserAppScope($component)) {
			return false;
		}

		return true;
	}

	public function allowedBySystemAnonMode($component){
		$arrAnonClosedModeComponents = [
			"a9os_core_main",
			"a9os_core_window",
			"a9os_core_splash",
			"a9os_user",
			"a9os_user_register"
		];
		$arrAnonClosedModeModels = [
			"a9os.user.register::submit",
			"a9os.user.login"
		];

		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$systemAnonMode = $this->getCore()->getModel("a9os.core.main")->getSystemAnonMode();
		if ($user->getIsAnonUser() && $systemAnonMode == "closed"){
			if (!in_array($component->getComponentName(), $arrAnonClosedModeComponents) 
			&&  !in_array($component->getDataModel(), $arrAnonClosedModeModels)){
				return false;
			}
		} else {
			if ($component->getComponentName() == "a9os_core_splash") {
				return false;
			}
		}
		return true;
	}

	public function allowedByUserAppScope($component){
		if ($this->ifComponentInPublicApp($component)) return true;
		if (!$this->ifcomponentInApp($component)) return true;
		if ($this->ifComponentInUserAllowedApp($component)) return true;
		return false;
	}

	public function ifComponentInPublicApp($component, $cmpInAppMode = false){
		$aa = $this->getCore()->getModel("application.application");
		$cca = $this->getCore()->getModel("core.controller.application");
		$ccc = $this->getCore()->getModel("core.controller.component");
		$cc = $this->getCore()->getModel("core.controller");
		$aa = $aa->_setSelect("
			SELECT * from {$aa->getTableName()} aa

			left join {$cca->getTableName()} cca 
				on (aa.{$aa->getPrimaryIdx()} = cca.{$aa->getPrimaryIdx()})

			left join {$ccc->getTableName()} ccc
				on (ccc.{$cc->getPrimaryIdx()} = cca.{$cc->getPrimaryIdx()})

			where ccc.{$component->getPrimaryIdx()} = {$component->getID()}".
			((!$cmpInAppMode)?" and aa.app_scope = 'public'":""));

		if ($aa->fetch()) return true;

		return false;
	}

	public function ifcomponentInApp($component){
		return $this->ifComponentInPublicApp($component, true);
	}

	public function ifComponentInUserAllowedApp($component){
		$aa = $this->getCore()->getModel("application.application");
		$cca = $this->getCore()->getModel("core.controller.application");
		$ccc = $this->getCore()->getModel("core.controller.component");
		$cc = $this->getCore()->getModel("core.controller");
		$aau = $this->getCore()->getModel("application.application.user");
		$user = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$aaRes = $aa->_setSelect("
			SELECT * from {$aa->getTableName()} aa

			left join {$cca->getTableName()} cca 
				on (aa.{$aa->getPrimaryIdx()} = cca.{$aa->getPrimaryIdx()})

			left join {$ccc->getTableName()} ccc
				on (ccc.{$cc->getPrimaryIdx()} = cca.{$cc->getPrimaryIdx()})

			left join {$aau->getTableName()} aau
				on (aau.{$aa->getPrimaryIdx()} = aa.{$aa->getPrimaryIdx()})

			where ccc.{$component->getPrimaryIdx()} = {$component->getID()}
			and aau.{$user->getPrimaryIdx()} = {$user->getID()}
		")->fetch();

		if ($aaRes && $aaRes->getAppScope() == "private") return true;
		
		return false;
	}

}