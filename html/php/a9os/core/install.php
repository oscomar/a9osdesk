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

class a9os_core_install extends a9os_core_window{
	public function main($postData){
		if ($this->isInstalled()) return "__RELOAD__";

		return [
			"window" => [
				"title" => "Instalar Escritorio",
				"favicon-url" => "/resources/a9os/core/install/icon.svg",
				"resize" => "false",
				"width" => "500px",
				"height" => "300px",
				"position" => "center",
				"windowColor" => "#ffffff"
			]
		];
	}

	public function isInstalled(){
		$a9osUser = $this->getCore()->getModel("a9os.user")->load("__anon__", "name");
		if ((bool)$a9osUser) return true;
		return false;
	}

	public function submit($data){
		try {
			return $this->installSystem($data["data"]["systemKey"]);
		} catch (Exception $e) {
			error_log($e);
			return "bad_password";
		}

	}



	private function installSystem($systemKey){
		$protection = $this->_getProtection();
		$protection->putPassword($systemKey);

		error_log(" * Install base desktop");


		$a9osUserAnon = $this->getCore()->getModel("a9os.user");
		$a9osUserAnon->setName("__anon__");
		$a9osUserAnon->setEnabled(1);
		$a9osUserAnon->setIsAnonUser(1);
		$a9osUserAnon->save();

		$coreMain = $this->getCore()->getModel("a9os.core.main");
		$a9osUserAnon->putA9osVersion($coreMain::arrBaseVersion);


		$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

		error_log(" * Removing installer endpoints");

		$coreControllerRoot = $this->getCore()->getModel("core.controller")->load("/", "path");
		$coreComponentE404 = $this->getCore()->getModel("core.component")->load("error_404", "component_name");
		$coreControllerComponentRoot404 = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentRoot404 = $coreControllerComponentRoot404->_setSelect("
			SELECT *
			from {$coreControllerComponentRoot404->getTableName()}
			where {$coreControllerRoot->getPrimaryIdx()} = {$coreControllerRoot->getID()}
			and {$coreComponentE404->getPrimaryIdx()} = {$coreComponentE404->getID()}
		")->fetch();
		$coreControllerComponentRoot404->delete();



		$coreControllerInstalla9os = $this->getCore()->getModel("core.controller")->load("/install_a9os", "path");
		$coreControllerComponentInstalla9os = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentInstalla9os = $coreControllerComponentInstalla9os->_setSelect("
			SELECT *
			from {$coreControllerComponentInstalla9os->getTableName()}
			where {$coreControllerInstalla9os->getPrimaryIdx()} = {$coreControllerInstalla9os->getID()}
		");
		
		while ($currControllerComponent = $coreControllerComponentInstalla9os->fetch()){
			$currControllerComponent->delete();
		}
		$coreControllerComponentInstalla9os->delete();
		$coreControllerInstalla9os->delete();

		error_log(" * Installing desktop endpoints");

		$coreComponentA9osUser = $this->getCore()->getModel("core.component");
		$coreComponentA9osUser->setComponentName("a9os_user");
		$coreComponentA9osUser->setOnlyOne(1);
		$coreComponentA9osUser->setDataModel("a9os.user");
		$coreComponentA9osUser->save();

		$coreComponentDependA9osUser = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependA9osUser->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependA9osUser->setChildId($coreComponentA9osUser->getID());
		$coreComponentDependA9osUser->setOrder(1);
		$coreComponentDependA9osUser->save();

		$coreComponentA9osUserRegister = $this->getCore()->getModel("core.component");
		$coreComponentA9osUserRegister->setComponentName("a9os_user_register");
		$coreComponentA9osUserRegister->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentA9osUserRegister->setDataModel("a9os.user.register");
		$coreComponentA9osUserRegister->save();

		$coreControllerA9osUserRegister = $this->getCore()->getModel("core.controller");
		$coreControllerA9osUserRegister->setPath("/register");
		$coreControllerA9osUserRegister->save();

		$coreControllerComponentA9osUserRegister = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentA9osUserRegister->setCoreControllerId($coreControllerA9osUserRegister->getID());
		$coreControllerComponentA9osUserRegister->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentA9osUserRegister->setOrder(0);
		$coreControllerComponentA9osUserRegister->save();

		$coreControllerComponentA9osUserRegister = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentA9osUserRegister->setCoreControllerId($coreControllerA9osUserRegister->getID());
		$coreControllerComponentA9osUserRegister->setCoreComponentId($coreComponentA9osUserRegister->getID());
		$coreControllerComponentA9osUserRegister->setOrder(1);
		$coreControllerComponentA9osUserRegister->save();

		$coreComponentA9osUserRegisterSubmit = $this->getCore()->getModel("core.component");
		$coreComponentA9osUserRegisterSubmit->setDataModel("a9os.user.register::submit");
		$coreComponentA9osUserRegisterSubmit->save();

		$coreControllerA9osUserRegisterSubmit = $this->getCore()->getModel("core.controller");
		$coreControllerA9osUserRegisterSubmit->setPath("/register/submit");
		$coreControllerA9osUserRegisterSubmit->save();

		$coreControllerComponentA9osUserRegisterSubmit = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentA9osUserRegisterSubmit->setCoreControllerId($coreControllerA9osUserRegisterSubmit->getID());
		$coreControllerComponentA9osUserRegisterSubmit->setCoreComponentId($coreComponentA9osUserRegisterSubmit->getID());
		$coreControllerComponentA9osUserRegisterSubmit->setOrder(0);
		$coreControllerComponentA9osUserRegisterSubmit->save();

		$coreComponentA9osUserLogin = $this->getCore()->getModel("core.component");
		$coreComponentA9osUserLogin->setDataModel("a9os.user.login");
		$coreComponentA9osUserLogin->save();

		$coreControllerA9osUserLogin = $this->getCore()->getModel("core.controller");
		$coreControllerA9osUserLogin->setPath("/login");
		$coreControllerA9osUserLogin->save();

		$coreControllerComponentA9osUserLogin = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentA9osUserLogin->setCoreControllerId($coreControllerA9osUserLogin->getID());
		$coreControllerComponentA9osUserLogin->setCoreComponentId($coreComponentA9osUserLogin->getID());
		$coreControllerComponentA9osUserLogin->setOrder(0);
		$coreControllerComponentA9osUserLogin->save();



		$coreComponentA9osGetcomponent = $this->getCore()->getModel("core.component");
		$coreComponentA9osGetcomponent->setDataModel("a9os.core.getcomponent");
		$coreComponentA9osGetcomponent->save();

		$coreControllerA9osGetcomponent = $this->getCore()->getModel("core.controller");
		$coreControllerA9osGetcomponent->setPath("/get-component");
		$coreControllerA9osGetcomponent->save();

		$coreControllerComponentA9osGetcomponent = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentA9osGetcomponent->setCoreControllerId($coreControllerA9osGetcomponent->getID());
		$coreControllerComponentA9osGetcomponent->setCoreComponentId($coreComponentA9osGetcomponent->getID());
		$coreControllerComponentA9osGetcomponent->setOrder(0);
		$coreControllerComponentA9osGetcomponent->save();



		$coreComponentCompatsandbox = $this->getCore()->getModel("core.component");
		$coreComponentCompatsandbox->setComponentName("a9os_core_compatsandbox");
		$coreComponentCompatsandbox->setDesignPath("#main-content");
		$coreComponentCompatsandbox->setOnlyOne(1);
		$coreComponentCompatsandbox->setDataModel("a9os.core.compatsandbox");
		$coreComponentCompatsandbox->save();

		$coreComponentDependCompatsandbox = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependCompatsandbox->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependCompatsandbox->setChildId($coreComponentCompatsandbox->getID());
		$coreComponentDependCompatsandbox->setOrder(19);
		$coreComponentDependCompatsandbox->save();



		$coreComponentAsyncgearGetmessages = $this->getCore()->getModel("core.component");
		$coreComponentAsyncgearGetmessages->setDataModel("a9os.core.asyncgear::getMessages");
		$coreComponentAsyncgearGetmessages->save();

		$coreControllerAsyncgearGetmessages = $this->getCore()->getModel("core.controller");
		$coreControllerAsyncgearGetmessages->setPath("/asyncgear/getMessages");
		$coreControllerAsyncgearGetmessages->save();

		$coreControllerComponentAsyncgearGetmessages = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAsyncgearGetmessages->setCoreControllerId($coreControllerAsyncgearGetmessages->getID());
		$coreControllerComponentAsyncgearGetmessages->setCoreComponentId($coreComponentAsyncgearGetmessages->getID());
		$coreControllerComponentAsyncgearGetmessages->setOrder(0);
		$coreControllerComponentAsyncgearGetmessages->save();

		$coreComponentAsyncgearAddnew = $this->getCore()->getModel("core.component");
		$coreComponentAsyncgearAddnew->setDataModel("a9os.core.asyncgear.reappendid::addNew");
		$coreComponentAsyncgearAddnew->save();

		$coreControllerAsyncgearAddnew = $this->getCore()->getModel("core.controller");
		$coreControllerAsyncgearAddnew->setPath("/asyncgear/reappendId/addNew");
		$coreControllerAsyncgearAddnew->save();

		$coreControllerComponentAsyncgearAddnew = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAsyncgearAddnew->setCoreControllerId($coreControllerAsyncgearAddnew->getID());
		$coreControllerComponentAsyncgearAddnew->setCoreComponentId($coreComponentAsyncgearAddnew->getID());
		$coreControllerComponentAsyncgearAddnew->setOrder(0);
		$coreControllerComponentAsyncgearAddnew->save();

		$coreComponentAsyncgearGetbyid = $this->getCore()->getModel("core.component");
		$coreComponentAsyncgearGetbyid->setDataModel("a9os.core.asyncgear.reappendid::getById");
		$coreComponentAsyncgearGetbyid->save();

		$coreControllerAsyncgearGetbyid = $this->getCore()->getModel("core.controller");
		$coreControllerAsyncgearGetbyid->setPath("/asyncgear/reappendId/getById");
		$coreControllerAsyncgearGetbyid->save();

		$coreControllerComponentAsyncgearGetbyid = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAsyncgearGetbyid->setCoreControllerId($coreControllerAsyncgearGetbyid->getID());
		$coreControllerComponentAsyncgearGetbyid->setCoreComponentId($coreComponentAsyncgearGetbyid->getID());
		$coreControllerComponentAsyncgearGetbyid->serOrder(0);
		$coreControllerComponentAsyncgearGetbyid->save();



		$coreComponentA9osCoreSplash = $this->getCore()->getModel("core.component");
		$coreComponentA9osCoreSplash->setComponentName("a9os_core_splash");
		$coreComponentA9osCoreSplash->setDesignPath("#main-content .a9os-main");
		$coreComponentA9osCoreSplash->setOnlyOne(1);
		$coreComponentA9osCoreSplash->setDataModel("a9os.core.splash");
		$coreComponentA9osCoreSplash->save();

		$coreComponentDependA9osCoreSplash = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependA9osCoreSplash->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependA9osCoreSplash->setChildId($coreComponentA9osCoreSplash->getID());
		$coreComponentDependA9osCoreSplash->setOrder(6);
		$coreComponentDependA9osCoreSplash->save();



		$coreComponentAppInstaller = $this->getCore()->getModel("core.component");
		$coreComponentAppInstaller->setComponentName("a9os_core_app_installer");
		$coreComponentAppInstaller->setDesignPath(".a9os-main .window > .main-content");
		$coreComponentAppInstaller->setDataModel("a9os.core.app.installer");
		$coreComponentAppInstaller->save();

		$coreControllerAppInstaller = $this->getCore()->getModel("core.controller");
		$coreControllerAppInstaller->setPath("/app-installer");
		$coreControllerAppInstaller->save();

		$coreControllerComponentAppInstaller = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAppInstaller->setCoreControllerId($coreControllerAppInstaller->getID());
		$coreControllerComponentAppInstaller->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreControllerComponentAppInstaller->setOrder(0);
		$coreControllerComponentAppInstaller->save();

		$coreControllerComponentAppInstaller = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAppInstaller->setCoreControllerId($coreControllerAppInstaller->getID());
		$coreControllerComponentAppInstaller->setCoreComponentId($coreComponentAppInstaller->getID());
		$coreControllerComponentAppInstaller->setOrder(1);
		$coreControllerComponentAppInstaller->save();

		$coreComponentAppInstallerSubmit = $this->getCore()->getModel("core.component");
		$coreComponentAppInstallerSubmit->setDataModel("a9os.core.app.installer::submitCode");
		$coreComponentAppInstallerSubmit->save();

		$coreControllerAppInstallerSubmit = $this->getCore()->getModel("core.controller");
		$coreControllerAppInstallerSubmit->setPath("/app-installer/submit");
		$coreControllerAppInstallerSubmit->save();

		$coreControllerComponentAppInstallerSubmit = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAppInstallerSubmit->setCoreControllerId($coreControllerAppInstallerSubmit->getID());
		$coreControllerComponentAppInstallerSubmit->setCoreComponentId($coreComponentAppInstallerSubmit->getID());
		$coreControllerComponentAppInstallerSubmit->setOrder(0);
		$coreControllerComponentAppInstallerSubmit->save();

		$coreComponentAppInstallerConfirm = $this->getCore()->getModel("core.component");
		$coreComponentAppInstallerConfirm->setDataModel("a9os.core.app.installer::confirmCode");
		$coreComponentAppInstallerConfirm->save();

		$coreControllerAppInstallerConfirm = $this->getCore()->getModel("core.controller");
		$coreControllerAppInstallerConfirm->setPath("/app-installer/confirm");
		$coreControllerAppInstallerConfirm->save();

		$coreControllerComponentAppInstallerConfirm = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentAppInstallerConfirm->setCoreControllerId($coreControllerAppInstallerConfirm->getID());
		$coreControllerComponentAppInstallerConfirm->setCoreComponentId($coreComponentAppInstallerConfirm->getID());
		$coreControllerComponentAppInstallerConfirm->setOrder(0);
		$coreControllerComponentAppInstallerConfirm->save();



		$coreComponentTaskbar = $this->getCore()->getModel("core.component");
		$coreComponentTaskbar->setComponentName("a9os_core_taskbar");
		$coreComponentTaskbar->setDesignPath("#main-content .a9os-main");
		$coreComponentTaskbar->setOnlyOne(1);
		$coreComponentTaskbar->setDataModel("a9os.core.taskbar");
		$coreComponentTaskbar->save();

		$coreComponentDependTaskbar = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbar->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbar->setChildId($coreComponentTaskbar->getID());
		$coreComponentDependTaskbar->setOrder(4);
		$coreComponentDependTaskbar->save();

		$coreComponentTaskbarPinnedapp = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarPinnedapp->setDataModel("a9os.core.taskbar.windowlist.pinnedapp");
		$coreComponentTaskbarPinnedapp->save();

		$coreControllerTaskbarPinnedapp = $this->getCore()->getModel("core.controller");
		$coreControllerTaskbarPinnedapp->setPath("/userconfig/taskbar/updatepinnedapps");
		$coreControllerTaskbarPinnedapp->save();

		$coreControllerComponentTaskbarPinnedapp = $this->getCore()->getModel("core.controller.component");
		$coreControllerComponentTaskbarPinnedapp->setCoreControllerId($coreControllerTaskbarPinnedapp->getID());
		$coreControllerComponentTaskbarPinnedapp->setCoreComponentId($coreComponentTaskbarPinnedapp->getID());
		$coreControllerComponentTaskbarPinnedapp->setOrder(0);
		$coreControllerComponentTaskbarPinnedapp->save();

		$coreComponentTaskbarWindowpreview = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarWindowpreview->setComponentName("a9os_core_taskbar_windowpreview");
		$coreComponentTaskbarWindowpreview->setDesignPath(".a9os-main cmp.a9os_core_taskbar");
		$coreComponentTaskbarWindowpreview->setOnlyOne(1);
		$coreComponentTaskbarWindowpreview->setDataModel("a9os.core.taskbar.windowpreview");
		$coreComponentTaskbarWindowpreview->save();

		$coreComponentDependTaskbarWindowpreview = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarWindowpreview->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarWindowpreview->setChildId($coreComponentTaskbarWindowpreview->getID());
		$coreComponentDependTaskbarWindowpreview->setOrder(7);
		$coreComponentDependTaskbarWindowpreview->save();

		$coreComponentTaskbarApplist = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarApplist->setComponentName("a9os_core_taskbar_applist");
		$coreComponentTaskbarApplist->setDesignPath(".a9os-main cmp.a9os_core_taskbar");
		$coreComponentTaskbarApplist->setOnlyOne(1);
		$coreComponentTaskbarApplist->setDataModel("a9os.core.taskbar.applist");
		$coreComponentTaskbarApplist->save();

		$coreComponentDependTaskbarApplist = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarApplist->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarApplist->setChildId($coreComponentTaskbarApplist->getID());
		$coreComponentDependTaskbarApplist->setOrder(8);
		$coreComponentDependTaskbarApplist->save();

		$coreComponentTaskbarPopuparea = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarPopuparea->setComponentName("a9os_core_taskbar_popuparea");
		$coreComponentTaskbarPopuparea->setDesignPath(".a9os-main cmp.a9os_core_taskbar");
		$coreComponentTaskbarPopuparea->setOnlyOne(1);
		$coreComponentTaskbarPopuparea->setDataModel("a9os.core.taskbar.popuparea");
		$coreComponentTaskbarPopuparea->save();

		$coreComponentDependTaskbarPopuparea = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarPopuparea->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarPopuparea->setChildId($coreComponentTaskbarPopuparea->getID());
		$coreComponentDependTaskbarPopuparea->setOrder(9);
		$coreComponentDependTaskbarPopuparea->save();

		$coreComponentTaskbarNotifarea = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifarea->setComponentName("a9os_core_taskbar_notifarea");
		$coreComponentTaskbarNotifarea->setDesignPath(".a9os-main cmp.a9os_core_taskbar .taskbar");
		$coreComponentTaskbarNotifarea->setOnlyOne(1);
		$coreComponentTaskbarNotifarea->setDataModel("a9os.core.taskbar.notifarea");
		$coreComponentTaskbarNotifarea->save();

		$coreComponentDependTaskbarNotifarea = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifarea->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifarea->setChildId($coreComponentTaskbarNotifarea->getID());
		$coreComponentDependTaskbarNotifarea->setOrder(12);
		$coreComponentDependTaskbarNotifarea->save();

		$coreComponentTaskbarWindowlist = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarWindowlist->setComponentName("a9os_core_taskbar_windowlist");
		$coreComponentTaskbarWindowlist->setDesignPath(".a9os-main cmp.a9os_core_taskbar .taskbar");
		$coreComponentTaskbarWindowlist->setOnlyOne(1);
		$coreComponentTaskbarWindowlist->setDataModel("a9os.core.taskbar.windowlist");
		$coreComponentTaskbarWindowlist->save();

		$coreComponentDependTaskbarWindowlist = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarWindowlist->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarWindowlist->setChildId($coreComponentTaskbarWindowlist->getID());
		$coreComponentDependTaskbarWindowlist->setOrder(11);
		$coreComponentDependTaskbarWindowlist->save();

		$coreComponentTaskbarStatusbox = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarStatusbox->setComponentName("a9os_core_taskbar_statusbox");
		$coreComponentTaskbarStatusbox->setDesignPath(".a9os-main cmp.a9os_core_taskbar");
		$coreComponentTaskbarStatusbox->setOnlyOne(1);
		$coreComponentTaskbarStatusbox->setDataModel("a9os.core.taskbar.statusbox");
		$coreComponentTaskbarStatusbox->save();

		$coreComponentDependTaskbarStatusbox = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarStatusbox->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarStatusbox->setChildId($coreComponentTaskbarStatusbox->getID());
		$coreComponentDependTaskbarStatusbox->setOrder(10);
		$coreComponentDependTaskbarStatusbox->save();

		$coreComponentTaskbarNotifShowdesktop = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifShowdesktop->setComponentName("a9os_core_taskbar_notifarea_showdesktop");
		$coreComponentTaskbarNotifShowdesktop->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
		$coreComponentTaskbarNotifShowdesktop->setOnlyOne(1);
		$coreComponentTaskbarNotifShowdesktop->setDataModel("a9os.core.taskbar.notifarea.showdesktop");
		$coreComponentTaskbarNotifShowdesktop->save();

		$coreComponentDependTaskbarNotifShowdesktop = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifShowdesktop->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifShowdesktop->setChildId($coreComponentTaskbarNotifShowdesktop->getID());
		$coreComponentDependTaskbarNotifShowdesktop->setOrder(13);
		$coreComponentDependTaskbarNotifShowdesktop->save();

		$coreComponentTaskbarNotifClock = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifClock->setComponentName("a9os_core_taskbar_notifarea_clock");
		$coreComponentTaskbarNotifClock->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
		$coreComponentTaskbarNotifClock->setOnlyOne(1);
		$coreComponentTaskbarNotifClock->setDataModel("a9os.core.taskbar.notifarea.clock");
		$coreComponentTaskbarNotifClock->save();

		$coreComponentDependTaskbarNotifClock = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifClock->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifClock->setChildId($coreComponentTaskbarNotifClock->getID());
		$coreComponentDependTaskbarNotifClock->setOrder(14);
		$coreComponentDependTaskbarNotifClock->save();

		$coreComponentTaskbarNotifBattery = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifBattery->setComponentName("a9os_core_taskbar_notifarea_battery");
		$coreComponentTaskbarNotifBattery->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
		$coreComponentTaskbarNotifBattery->setOnlyOne(1);
		$coreComponentTaskbarNotifBattery->setDataModel("a9os.core.taskbar.notifarea.battery");
		$coreComponentTaskbarNotifBattery->save();

		$coreComponentDependTaskbarNotifBattery = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifBattery->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifBattery->setChildId($coreComponentTaskbarNotifBattery->getID());
		$coreComponentDependTaskbarNotifBattery->setOrder(15);
		$coreComponentDependTaskbarNotifBattery->save();

		$coreComponentTaskbarNotifFsbutton = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifFsbutton->setComponentName("a9os_core_taskbar_notifarea_fullscreenbutton");
		$coreComponentTaskbarNotifFsbutton->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
		$coreComponentTaskbarNotifFsbutton->setOnlyOne(1);
		$coreComponentTaskbarNotifFsbutton->setDataModel("a9os.core.taskbar.notifarea.fullscreenbutton");
		$coreComponentTaskbarNotifFsbutton->save();

		$coreComponentDependTaskbarNotifFsbutton = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifFsbutton->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifFsbutton->setChildId($coreComponentTaskbarNotifFsbutton->getID());
		$coreComponentDependTaskbarNotifFsbutton->setOrder(16);
		$coreComponentDependTaskbarNotifFsbutton->save();

		$coreComponentTaskbarNotifAlttabber = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifAlttabber->setComponentName("a9os_core_taskbar_alttabber");
		$coreComponentTaskbarNotifAlttabber->setDesignPath(".a9os-main cmp.a9os_core_taskbar");
		$coreComponentTaskbarNotifAlttabber->setOnlyOne(1);
		$coreComponentTaskbarNotifAlttabber->setDataModel("a9os.core.taskbar.alttabber");
		$coreComponentTaskbarNotifAlttabber->save();

		$coreComponentDependTaskbarNotifAlttabber = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifAlttabber->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifAlttabber->setChildId($coreComponentTaskbarNotifAlttabber->getID());
		$coreComponentDependTaskbarNotifAlttabber->setOrder(17);
		$coreComponentDependTaskbarNotifAlttabber->save();

		$coreComponentTaskbarNotifFileprogress = $this->getCore()->getModel("core.component");
		$coreComponentTaskbarNotifFileprogress->setComponentName("a9os_core_taskbar_notifarea_fileprogress");
		$coreComponentTaskbarNotifFileprogress->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
		$coreComponentTaskbarNotifFileprogress->setOnlyOne(1);
		$coreComponentTaskbarNotifFileprogress->setDataModel("a9os.core.taskbar.notifarea.fileprogress");
		$coreComponentTaskbarNotifFileprogress->save();

		$coreComponentDependTaskbarNotifFileprogress = $this->getCore()->getModel("core.component.depend");
		$coreComponentDependTaskbarNotifFileprogress->setCoreComponentId($coreComponentA9osCoreMain->getID());
		$coreComponentDependTaskbarNotifFileprogress->setChildId($coreComponentTaskbarNotifFileprogress->getID());
		$coreComponentDependTaskbarNotifFileprogress->setOrder(18);
		$coreComponentDependTaskbarNotifFileprogress->save();

		error_log(" * Endpoints installed. Running desktop update");

		$this->updateSystem();

		error_log(" * Installing base apps");

		$a9osAppInstaller = $this->getCore()->getModel("a9os.core.app.installer");
		$a9osAppInstaller->installBaseApps();


		$protection->removePassword();
		
		error_log(" * a9os Desktop installed!!");

		return "__RELOAD__";
	}


	public function updateSystem(){ //a9os_core_main arrVersion
		
		$a9osUserToInstalledVersion = $this->getCore()->getModel("a9os.user");
		$installedVersion = $a9osUserToInstalledVersion->_getA9osVersion();

		$a9osCoreMain = $this->getCore()->getModel("a9os.core.main");
		$codeVersion = $a9osCoreMain::arrVersion;

		if ($installedVersion == $codeVersion) return false;

		$installedVersion = $this->getCore()->arrVersionToInt($installedVersion);
		
		if ($installedVersion < 10001) {
			$coreComponentAppinstallerUpdUsr = $this->getCore()->getModel("core.component");
			$coreComponentAppinstallerUpdUsr->setDataModel("a9os.core.app.installer.updateuserappdata");
			$coreComponentAppinstallerUpdUsr->save();

			$coreControllerAppinstallerUpdUsr = $this->getCore()->getModel("core.controller");
			$coreControllerAppinstallerUpdUsr->setPath("/app-installer/updateuserappdata");
			$coreControllerAppinstallerUpdUsr->save();

			$coreControllerComponentAppinstallerUpdUsr = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponentAppinstallerUpdUsr->setCoreControllerId($coreControllerAppinstallerUpdUsr->getID());
			$coreControllerComponentAppinstallerUpdUsr->setCoreComponentId($coreComponentAppinstallerUpdUsr->getID());
			$coreControllerComponentAppinstallerUpdUsr->setOrder(0);
			$coreControllerComponentAppinstallerUpdUsr->save();
		}
		if ($installedVersion < 10002) {
			$coreComponentAppinstallerInstallActions = $this->getCore()->getModel("core.component");
			$coreComponentAppinstallerInstallActions->setDataModel("a9os.core.app.installer.installactions");
			$coreComponentAppinstallerInstallActions->save();

			$coreControllerAppinstallerInstallActions = $this->getCore()->getModel("core.controller");
			$coreControllerAppinstallerInstallActions->setPath("/app-installer/installactions");
			$coreControllerAppinstallerInstallActions->save();

			$coreControllerComponentAppinstallerUpdUsr = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponentAppinstallerUpdUsr->setCoreControllerId($coreControllerAppinstallerInstallActions->getID());
			$coreControllerComponentAppinstallerUpdUsr->setCoreComponentId($coreComponentAppinstallerInstallActions->getID());
			$coreControllerComponentAppinstallerUpdUsr->setOrder(0);
			$coreControllerComponentAppinstallerUpdUsr->save();
		}

		/* 0.1.3 controller setUserAvatar */
		if ($installedVersion < 10003) {
			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/applist/setUserAvatar");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os.core.taskbar.applist.avatar");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();
		}

		/* 0.1.4 controller user setConfig */
		if ($installedVersion < 10004) {
			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/user/setConfig");
			$coreController->save();

			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setDataModel("a9os_user::receiveUserConfigFromFrontend");
			$coreComponent->save();

			$coreControllerComponent = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponent->setCoreControllerId($coreController->getID());
			$coreControllerComponent->setCoreComponentId($coreComponent->getID());
			$coreControllerComponent->setOrder(0);
			$coreControllerComponent->save();
		}

		/* 0.1.5 controller user setConfig */
		if ($installedVersion < 10005) {
			$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");
			
			$coreComponent = $this->getCore()->getModel("core.component");
			$coreComponent->setComponentName("a9os_core_about_main");
			$coreComponent->setDesignPath(".a9os-main .window > .main-content");
			$coreComponent->setDataModel("a9os.core.about.main");
			$coreComponent->save();

			$coreController = $this->getCore()->getModel("core.controller");
			$coreController->setPath("/about");
			$coreController->save();

			$coreControllerComponentAppInstaller = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponentAppInstaller->setCoreControllerId($coreController->getID());
			$coreControllerComponentAppInstaller->setCoreComponentId($coreComponentA9osCoreMain->getID());
			$coreControllerComponentAppInstaller->setOrder(0);
			$coreControllerComponentAppInstaller->save();

			$coreControllerComponentAppInstaller = $this->getCore()->getModel("core.controller.component");
			$coreControllerComponentAppInstaller->setCoreControllerId($coreController->getID());
			$coreControllerComponentAppInstaller->setCoreComponentId($coreComponent->getID());
			$coreControllerComponentAppInstaller->setOrder(1);
			$coreControllerComponentAppInstaller->save();
		}

		/* 0.1.6 onlinechecker taskbar icon */
		if ($installedVersion < 10006) {
			$coreComponentA9osCoreMain = $this->getCore()->getModel("core.component")->load("a9os_core_main", "component_name");

			$coreComponentTaskbar = $this->getCore()->getModel("core.component");
			$coreComponentTaskbar->setComponentName("a9os_core_taskbar_notifarea_onlinechecker");
			$coreComponentTaskbar->setDesignPath("cmp.a9os_core_taskbar_notifarea .notif-area");
			$coreComponentTaskbar->setOnlyOne(1);
			$coreComponentTaskbar->setDataModel("a9os.core.taskbar.notifarea.onlinechecker");
			$coreComponentTaskbar->save();

			$coreComponentDependTaskbar = $this->getCore()->getModel("core.component.depend");
			$coreComponentDependTaskbar->setCoreComponentId($coreComponentA9osCoreMain->getID());
			$coreComponentDependTaskbar->setChildId($coreComponentTaskbar->getID());
			$coreComponentDependTaskbar->setOrder(19);
			$coreComponentDependTaskbar->save();
		}

		$a9osUserToInstalledVersion->putA9osVersion($codeVersion);
		return true;
	}
}