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
a9os_core_app_installer.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);
	self.switchInterface(data.can_syskey);

	self.component.arrApps = data.arrApps;

}

a9os_core_app_installer.switchInterface = (canSyskey) => {
	if (canSyskey) {
		self.component.querySelector(".can-syskey").classList.add("show");
		self.canSyskey.attachControls();
	} else {
		self.component.querySelector(".not-syskey").classList.add("show");
		self.attachControls();
	}
}

a9os_core_app_installer.canSyskey = {};
a9os_core_app_installer.canSyskey.attachControls = () => {
	self.canSyskey.baseDiv = self.component.querySelector(".can-syskey");


	var mobileAppButton = self.canSyskey.baseDiv.querySelector(".mobile-app-button");
	a9os_core_main.addEventListener(mobileAppButton, "click", (event, mobileAppButton) => {
		if (self.canSyskey.baseDiv.classList.contains("mobile-show-apps")) {
			self.canSyskey.baseDiv.classList.remove("mobile-show-apps");
		} else {
			self.canSyskey.baseDiv.classList.add("mobile-show-apps");
		}
	});

	var appArea = self.canSyskey.baseDiv.querySelector(".app-area");
	a9os_core_main.addEventListener(appArea, ["mousedown", "touchstart"], (event, appArea) => {
		self.canSyskey.baseDiv.classList.remove("mobile-show-apps");
	});

	var appCodeLine = self.canSyskey.baseDiv.querySelector(".app-area .app-code-line");
	var appCodeInput = appCodeLine.querySelector("input");
	a9os_core_main.addEventListener(appCodeLine.querySelector(".btn.alter-show"), "click", (event, alterShowBtn, appCodeInput) => {
		if (appCodeInput.type == "text") {
			appCodeInput.type = "password";
			alterShowBtn.textContent = "Mostrar";
		} else {
			appCodeInput.type = "text";
			alterShowBtn.textContent = "Ocultar";
		}
	}, appCodeInput);



	var arrAppListItems = self.canSyskey.baseDiv.querySelectorAll(".app-list .item");
	var appListSearchInput = self.canSyskey.baseDiv.querySelectorAll(".app-list input.search");

	a9os_core_main.addEventListener(appListSearchInput, "keyup", (event, appListSearchInput, arrAppListItems) => {
		var query = appListSearchInput.value.toLowerCase().replace(/[^0-9a-z-]/g,"");

		for (var i = 0 ; i < arrAppListItems.length ; i++) {
			var item = arrAppListItems[i];
			if (query == ""){
				item.classList.remove("filtered");
				continue;
			}
			if (item.querySelector(".name").textContent.toLowerCase().indexOf(query) == -1){
				item.classList.add("filtered");
			} else {
				item.classList.remove("filtered");
			}
		}
	}, arrAppListItems);


	a9os_core_main.addEventListener(arrAppListItems, "click", (event, currAppListItem) => {
		self.canSyskey.loadAppArea(currAppListItem);
	});

	var arrUserListItems = self.canSyskey.baseDiv.querySelectorAll(".app-data .enabled-users .users-list .user-item");
	a9os_core_main.addEventListener(arrUserListItems, "change", (event, currUserItem) => {
		self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.apply").disabled = false;
		self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.reset").disabled = false;
	});

	a9os_core_main.addEventListener(self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.reset"), "click", (event, userResetBtn) => {
		var appId = self.canSyskey.baseDiv.querySelector(".app-list .item.selected").getAttribute("data-app-id");
		var appData = self.component.arrApps[appId];
		self.canSyskey.fillUsersList(appData);

		self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.apply").disabled = true;
		self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.reset").disabled = true;
	});

	a9os_core_main.addEventListener(self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.apply"), "click", self.canSyskey.updateUserData);
	a9os_core_main.addEventListener(self.canSyskey.baseDiv.querySelectorAll(".app-data .buttons.app .btn"), "click", self.canSyskey.installActions);
	a9os_core_main.addEventListener(self.canSyskey.baseDiv.querySelectorAll(".app-data .changelog-area .title"), "click", self.canSyskey.switchChangelogArea);
}


a9os_core_app_installer.canSyskey.loadAppArea = (currAppListItem) => {
	self.canSyskey.baseDiv.classList.remove("mobile-show-apps");
	self.canSyskey.baseDiv.classList.remove("not-selected-app");

	if (self.canSyskey.baseDiv.querySelector(".app-list .item.selected")) {
		self.canSyskey.baseDiv.querySelector(".app-list .item.selected").classList.remove("selected");
	}

	currAppListItem.classList.add("selected");

	var appId = currAppListItem.getAttribute("data-app-id");

	var appData = self.component.arrApps[appId];

	self.canSyskey.baseDiv.querySelector(".app-info .icon").src = appData.icon_url;
	self.canSyskey.baseDiv.querySelector(".app-data .name").textContent = appData.name;
	self.canSyskey.baseDiv.querySelector(".app-data .app-scope").textContent = ((appData.app_scope == "private")?"App. Privada":"App Pública");

	self.canSyskey.baseDiv.querySelector(".app-data .app-code-line input").type = "password";
	self.canSyskey.baseDiv.querySelector(".app-data .app-code-line .btn.alter-show").textContent = "Mostrar";
	self.canSyskey.baseDiv.querySelector(".app-data .app-code-line input").value = appData.app_code;

	self.canSyskey.baseDiv.querySelector(".app-data .version-line.installed").classList.remove("hide");
	self.canSyskey.baseDiv.querySelector(".app-data .version-line.to-update").classList.remove("hide");

	self.canSyskey.baseDiv.querySelector(".app-data .version-line.to-update span").textContent = appData.version_to_update;
	self.canSyskey.baseDiv.querySelector(".app-data .version-line.installed span").textContent = appData.version_installed;

	if (appData.app_install_status == "not-installed") {
		self.canSyskey.baseDiv.querySelector(".app-data .version-line.installed").classList.add("hide");
	} else if (appData.app_install_status == "installed") {
		self.canSyskey.baseDiv.querySelector(".app-data .version-line.to-update").classList.add("hide");
	}

	self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.install").classList.remove("hide");
	self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.update").classList.remove("hide");
	self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.uninstall").classList.remove("hide");

	if (appData.app_install_status == "not-installed") {
		self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.update").classList.add("hide");
		self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.uninstall").classList.add("hide");
	} else if (appData.app_install_status == "to-update") {
		self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.install").classList.add("hide");
	} else {
		self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.install").classList.add("hide");
		self.canSyskey.baseDiv.querySelector(".app-data .buttons.app .btn.update").classList.add("hide");
	}

	self.canSyskey.baseDiv.querySelector(".app-data .enabled-users").classList.remove("hide");
	if (appData.app_install_status == "not-installed" || appData.app_scope == "public") {
		self.canSyskey.baseDiv.querySelector(".app-data .enabled-users").classList.add("hide");
	} else {
		self.canSyskey.fillUsersList(appData);
	}

	self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.apply").disabled = true;
	self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.reset").disabled = true;


	var changelogArea = self.canSyskey.baseDiv.querySelector(".app-data .changelog-area");
	changelogArea.classList.remove("hide");
	changelogArea.classList.remove("show");

	if (appData.arr_changelog && Object.keys(appData.arr_changelog).length > 0) {
		changelogText = "";
		for (var version in appData.arr_changelog) {
			changelogText += "<b>Ver. "+version+" : </b>";
			changelogText += "<span>"+appData.arr_changelog[version]+"</span>";
			changelogText += "<br><br>";
		}
		changelogArea.querySelector(".changelog-list").innerHTML = changelogText;

	} else {
		changelogArea.querySelector(".changelog-list").textContent = changelogArea.querySelector(".changelog-list").getAttribute("data-empty-msg");
	}

	self.canSyskey.baseDiv.querySelector(".app-area").scrollTo(0,0);
}

a9os_core_app_installer.canSyskey.fillUsersList = (appData) => {
	var arrEnabledUserIds = appData.user_id_list;
	var arrUserListItems = self.canSyskey.baseDiv.querySelectorAll(".app-data .enabled-users .users-list .user-item");

	for (var i = 0 ; i < arrUserListItems.length ; i++) {
		var currUserItem = arrUserListItems[i];

		if (arrEnabledUserIds.indexOf(currUserItem.getAttribute("data-user-id")) != -1) {
			currUserItem.querySelector("input").checked = true;
		} else {
			currUserItem.querySelector("input").checked = false;
		}
	}
}

a9os_core_app_installer.canSyskey.updateUserData = () => {
	var appId = self.canSyskey.baseDiv.querySelector(".app-list .item.selected").getAttribute("data-app-id");
	
	var arrUsers = [];
	var arrUserListItems = self.canSyskey.baseDiv.querySelectorAll(".app-data .enabled-users .users-list .user-item");

	for (var i = 0 ; i < arrUserListItems.length ; i++) {
		if (arrUserListItems[i].querySelector("input").checked) arrUsers.push(arrUserListItems[i].getAttribute("data-user-id"))
	}

	core.sendRequest(
		"/app-installer/updateuserappdata",
		{
			appId : appId,
			arrUsers : arrUsers
		},
		{
			fn : (response) => {
				self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.apply").disabled = true;
				self.canSyskey.baseDiv.querySelector(".app-data .enabled-users .buttons .btn.reset").disabled = true;
			},
			args : {
				response : false
			}
		}
	);
}

a9os_core_app_installer.canSyskey.installActions = (event, button) => {
	var currAction = button.getAttribute("data-action");

	var arrButtons = self.canSyskey.baseDiv.querySelectorAll(".app-data .buttons.app .btn");
	for (var i = 0 ; i < arrButtons.length ; i++) arrButtons[i].disabled = true;

	self.canSyskey.baseDiv.classList.add("installing-blocked");

	var appId = self.canSyskey.baseDiv.querySelector(".app-list .item.selected").getAttribute("data-app-id");

	core.sendRequest(
		"/app-installer/installactions",
		{
			appId : appId,
			action : currAction,
		},
		{
			fn : (response, action, appId) => {
				for (var i = 0 ; i < arrButtons.length ; i++) arrButtons[i].disabled = false;
				self.canSyskey.baseDiv.classList.remove("installing-blocked");

				self.component.arrApps[appId] = response;

				var appListItem = self.canSyskey.baseDiv.querySelector(".app-list .item[data-app-id='"+appId+"']");
				appListItem.querySelector(".status-icon").setAttribute("data-status", response.app_install_status);
				
				self.canSyskey.loadAppArea(appListItem);

			},
			args : {
				response : false,
				action : currAction,
				appId : appId
			}
		},
		false,
		false,
		{
			fn : () => {
				for (var i = 0 ; i < arrButtons.length ; i++) arrButtons[i].disabled = false;
				self.canSyskey.baseDiv.classList.remove("installing-blocked");
			},
			args : {}
		}
	);
}

a9os_core_app_installer.canSyskey.switchChangelogArea = (event, changelogAreaTitle) => {
	var changelogArea = changelogAreaTitle.parentElement;

	if (changelogArea.classList.contains("show")) {
		changelogArea.classList.remove("show");
	} else {
		changelogArea.classList.add("show");
	}
}




a9os_core_app_installer.attachControls = () => {
	var inputCode = self.component.querySelector("input.code");
	var submitButton = self.component.querySelector(".btn.submit");
	var cancelButton = self.component.querySelector(".btn.cancel");
	a9os_core_main.addEventListener(inputCode, "keyup", (event, inputCode) => {
		if (event.which == 13) self.submitCode();
		if (inputCode.value != "") {
			inputCode.classList.add("non-empty");
		} else {
			inputCode.classList.remove("non-empty");
		}
	});

	a9os_core_main.addEventListener(submitButton, "click", self.submitCode);
	a9os_core_main.addEventListener(cancelButton, "click", a9os_core_window.close);
}
a9os_core_app_installer.submitCode = () => {
	var previewContainer = self.component.querySelector(".preview");
	if (!previewContainer.classList.contains("show-app")) {
		self.checkCode();
	} else {
		self.confirmAndExit();
	}

}
a9os_core_app_installer.checkCode = () => {
	var code = self.component.querySelector("input.code").value;
	core.sendRequest(
		"/app-installer/submit",
		{
			code : code
		},
		{
			fn : (response) => {
				if (response == "error") {
					self.showErrorResult();
				} else {
					self.makeAppPreview(response);
				}
			},
			args : {
				response : false
			}
		}
	);
}
a9os_core_app_installer.confirmAndExit = () => {
	var code = self.component.querySelector("input.code").value;
	core.sendRequest(
		"/app-installer/confirm",
		{
			code : code
		},
		{
			fn : (response) => {
				if (response == "error") {
					self.showErrorResult();
				} else {
					a9os_core_taskbar_popuparea.new(response.name + " Agregado", response.icon_url, "info");
					a9os_core_taskbar_applist.addAppToList(response);
					a9os_core_window.close();
				}
			},
			args : {
				response : false
			}
		}
	);
}
a9os_core_app_installer.showErrorResult = () => {
	var previewContainer = self.component.querySelector(".preview");
	previewContainer.classList.remove("show-app");
	previewContainer.textContent = "Aplicación no encontrada";
	previewContainer.classList.add("error");
}
a9os_core_app_installer.makeAppPreview = (arrAppData) => {
	var previewContainer = self.component.querySelector(".preview");
	previewContainer.classList.remove("error");
	previewContainer.innerHTML = "";

	var faviconDiv = document.createElement("div");
	faviconDiv.classList.add("favicon");
	faviconDiv.style.backgroundImage = "url("+arrAppData.icon_url+")";

	var appName = document.createElement("div");
	appName.textContent = arrAppData.name;
	appName.classList.add("name");

	previewContainer.appendChild(faviconDiv);
	previewContainer.appendChild(appName);

	previewContainer.classList.add("show-app");
}