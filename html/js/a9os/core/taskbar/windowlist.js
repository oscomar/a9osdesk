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
a9os_core_taskbar_windowlist.main = (data) => {
	self.component.windowList = self.component.querySelector(".window-list");
	self.processWindowItemPromises();

	self.appendSavedPinnedApps(data.pinned_apps);
}



a9os_core_taskbar_windowlist.arrWindowItemPromises = [];
a9os_core_taskbar_windowlist.idIncrement = 0;

a9os_core_taskbar_windowlist.item = {};

a9os_core_taskbar_windowlist.item.new = (windowData, arrMenuCustomActions) => {

	var ifExistsUnusedPinnedItem = self.component.querySelector(".item.pinned[data-appid='"+windowData.appid+"']:not(.used)");
	if (ifExistsUnusedPinnedItem) {
		var newItem = ifExistsUnusedPinnedItem;
	} else {
		var newItem = document.createElement("div");
		newItem.classList.add("item");
	}
	
	newItem.setAttribute("data-title", windowData.title);
	newItem.setAttribute("data-appid", windowData.appid);

	var itemId = ++a9os_core_taskbar_windowlist.idIncrement;
	newItem.setAttribute("data-taskbar-item-id", itemId);
	newItem.style.backgroundImage = "url("+windowData["favicon-url"]+")";

	var applistItem = a9os_core_taskbar_applist.component.querySelector(".app-list a[data-appid='"+windowData.appid+"']");
	var openItemToPinnedAvailable = true;
	if (!applistItem) openItemToPinnedAvailable = false;

	var ifOnlyOne = false;
	if (arrMenuCustomActions && arrMenuCustomActions.length > 0) {	
		if (arrMenuCustomActions[arrMenuCustomActions.length-1] && arrMenuCustomActions[arrMenuCustomActions.length-1] == "__onlyOne") {
			ifOnlyOne = true;
			arrMenuCustomActions.pop();
		}

		if (arrMenuCustomActions.length > 0) arrMenuCustomActions.push("separator");
	} else {
		arrMenuCustomActions = [];
	}

	newItem.setAttribute("data-menu-r", JSON.stringify(arrMenuCustomActions.concat([
		{
			name : "Nueva instancia",
			action : "item.newInstance",
			active : !ifOnlyOne
		},
		"separator",
		{
			id : 1,
			name : "Maximizar",
			action : "window.maximize",
			active : !(windowData.resize && windowData.resize == "false")
		},
		{
			id : 2,
			name : "Minimizar",
			action : "window.minimize"
		},
		"separator",
		{
			id : 3,
			active : openItemToPinnedAvailable,
			name : "Agregar a la barra de tareas",
			action : "item.pinned.openItemToPinned"
		},
		"separator",
		{ 
			name : "Cerrar",
			action : "closeWindowByMenu",
			shortcut : ["Shift", "F4"]
		}
	])));

	if (!newItem.classList.contains("usedbefore")) {
		core.addEventListener(newItem, "click", (event, newItem) => {
			if (newItem.classList.contains("pinned") && !newItem.classList.contains("used"))  return;

			self.item.selectRestoreWindow(newItem);
		});
		core.addEventListener(newItem, "mousedown", (event, newItem) => {	
			if (newItem.classList.contains("pinned") && !newItem.classList.contains("used"))  return;

			if (event.button == "1") self.item.newInstance(event, newItem);
		});

		a9os_core_taskbar_windowpreview.appendItem(newItem);
	}


	if (ifExistsUnusedPinnedItem) {
		newItem.classList.add("used");
		newItem.classList.add("usedbefore");
	} else {
		self.item.addToList(newItem);
	}

	return itemId;
}


a9os_core_taskbar_windowlist.item.addToList = (item) => {
	if (!self.component.windowList){
		self.arrWindowItemPromises.push({item:item, action : self.item.addToList});
		return;
	}

	a9os_core_main.moveEvent.add(item, (interface, item) => {
		if (interface.buttons != 1) return;

		if (!item.parentElement.querySelector(".item-to-move")) {			
			//get pineed apps order
			self.component.arrPinnedAppsOrder = [];
			var arrPinnedApps = self.component.querySelectorAll(".item.pinned");
			for (var i = 0 ; i < arrPinnedApps.length ; i++) {
				self.component.arrPinnedAppsOrder.push(arrPinnedApps[i].getAttribute("data-appid"));
			}


			var itemToMove = item.cloneNode(true);
			itemToMove.classList.add("item-to-move");
			itemToMove.classList.add("active");
			item.parentElement.appendChild(itemToMove);

		} else {
			var itemToMove = item.parentElement.querySelector(".item-to-move");
		}

		itemToMove.removeAttribute("data-menu-r");

		if (interface.global.x - self.component.offsetLeft + 50 < self.component.offsetWidth + self.component.offsetLeft
		&& interface.global.x + interface.element.start.x > self.component.offsetLeft) {
			itemToMove.style.left = interface.global.x - self.component.offsetLeft - interface.element.start.x;
		}

		item.classList.add("move-hide");

		var arrOtherItems = self.component.querySelectorAll(".item:not(.move-hide):not(.item-to-move)");

		//window list padding 5 px
		//item margin 1px

		for (var i = 0 ; i < arrOtherItems.length ; i++) {
			var currOtherItem = arrOtherItems[i];
			var currOtherItemLeft = currOtherItem.offsetLeft + self.component.offsetLeft;

			var currNextItem = false;
			var currNextItemLeft = false;
			if (i+1 < arrOtherItems.length) {
				currNextItem = arrOtherItems[i+1];
				currNextItemLeft = currNextItem.offsetLeft + self.component.offsetLeft;
			}

			if (interface.global.x < currOtherItemLeft + currOtherItem.offsetWidth/2) {
				currOtherItem.classList.add("move-marginleft");
				if (currNextItem && interface.global.x < currNextItemLeft + currNextItem.offsetWidth/2) {
					currNextItem.classList.remove("move-marginleft");
				}
				break;
			} else {
				currOtherItem.classList.remove("move-marginleft");
			}
		}
	},
	(event, item) => {
		item.classList.remove("move-hide");

		var itemToMove = self.component.querySelector(".item-to-move");
		if (!itemToMove) return;

		itemToMove.parentElement.removeChild(itemToMove);

		var arrOtherItems = self.component.querySelectorAll(".item:not(.move-hide):not(.item-to-move)");
		var noMarginleftItem = true;
		for (var i = 0 ; i < arrOtherItems.length ; i++) {
			var currOtherItem = arrOtherItems[i];
			if (currOtherItem.classList.contains("move-marginleft")) {
				noMarginleftItem = false;
				item.parentElement.insertBefore(item, currOtherItem);

				currOtherItem.classList.remove("move-marginleft");

				currOtherItem.style.transition = "margin-left 0s";
				setTimeout((currOtherItem) => {
					currOtherItem.style.transition = null;
				}, 200, currOtherItem);
			}
		}
		if (noMarginleftItem) {
			item.parentElement.appendChild(item);
		}

		var tmpPinnedAppsOrder = [];
		var arrPinnedApps = self.component.querySelectorAll(".item.pinned");
		for (var i = 0 ; i < arrPinnedApps.length ; i++) {
			tmpPinnedAppsOrder.push(arrPinnedApps[i].getAttribute("data-appid"));
		}

		if (self.component.arrPinnedAppsOrder.join(",") != tmpPinnedAppsOrder.join(",")) {
			self.updateDataToBackend();
		}

	});
	self.component.windowList.appendChild(item);
}

a9os_core_taskbar_windowlist.processWindowItemPromises = () => {
	self.arrWindowItemPromises.forEach((newEntry) => {
		newEntry.action(newEntry.item);
	});
	self.arrWindowItemPromises = [];
}

a9os_core_taskbar_windowlist.item.selectRestoreWindow = (item) => {
	var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+item.getAttribute("data-taskbar-item-id")+"']");
	if (wind0w.classList.contains("minimized")){
		a9os_core_window.minimizeRestoreWindow(wind0w);
	} else if (!wind0w.classList.contains("minimized") && wind0w.classList.contains("top-window")) {
		a9os_core_window.minimizeWindow(wind0w);
	} else {
		a9os_core_main.selectWindow(wind0w);
	}
}
a9os_core_taskbar_windowlist.item.newInstance = (event, item) => {
	
	var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+item.getAttribute("data-taskbar-item-id")+"']");
	var windowUrl = wind0w.parentElement.getAttribute("data-url");
	windowUrl = windowUrl.split("?")[0];

	core.link.push(windowUrl);
}

a9os_core_taskbar_windowlist.item.unselect = (item) => {
	if (!self.component.windowList){
		self.arrWindowItemPromises.push({item : item, action : self.item.unselect});
		return;
	}
	if (!isNaN(item)){
		item = self.component.windowList.querySelector(".item[data-taskbar-item-id='"+item+"']");
	}
	if (item) {
		item.classList.remove("active");
	}
}

a9os_core_taskbar_windowlist.item.select = (item) => {
	if (!self.component.windowList){
		self.arrWindowItemPromises.push({item : item, action : self.item.select});
		return;
	}
	if (!isNaN(item)){
		item = self.component.windowList.querySelector(".item[data-taskbar-item-id='"+item+"']");
	}
	if (!item) return;
	item.classList.add("active");
}

a9os_core_taskbar_windowlist.item.remove = (itemId) => {
	if (!self.component) return;
	if (!self.component.windowList){
		self.arrWindowItemPromises.push({itemId:itemId, action : self.item.remove});
		return;
	}

	var item = self.component.windowList.querySelector(".item[data-taskbar-item-id='"+itemId+"']");
	if (!item) return;

	if (item.classList.contains("pinned")) {
		item.classList.remove("used");
		item.classList.remove("active");
		item.classList.remove("minimized");
		item.removeAttribute("data-taskbar-item-id");
		item.setAttribute("data-menu-r", JSON.stringify(self.item.pinned.menuR));
	} else {
		self.component.windowList.removeChild(item);
	}
}



a9os_core_taskbar_windowlist.closeWindowByMenu = (event, item) => {
	var itemId = item.getAttribute("data-taskbar-item-id");

	var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+itemId+"']");
	if (event.ctrlKey) {
		a9os_core_main.removeWindow(wind0w);
	} else {
		a9os_core_main.selectWindow(wind0w);
		a9os_core_window.close(event);
	}
}

a9os_core_taskbar_windowlist.item.pinned = {};

a9os_core_taskbar_windowlist.item.pinned.add = (newPinnedApp, preventBackendUpdate) => {
	if (self.component.querySelector(".item.pinned[data-appid='"+newPinnedApp.id+"']")) return;

	var ifExistSameOpenAppItem = self.component.querySelector(".item[data-appid='"+newPinnedApp.id+"']");
	if (ifExistSameOpenAppItem) {
		var newItem = ifExistSameOpenAppItem;
		newItem.classList.add("usedbefore");

	} else {
		var newItem = document.createElement("div");
		newItem.classList.add("item");
	}
	newItem.classList.add("pinned");

	newItem.style.backgroundImage = "url("+newPinnedApp.icon+")";
	newItem.setAttribute("data-app-url", newPinnedApp.url);
	newItem.setAttribute("data-appid", newPinnedApp.id);
	newItem.title = newPinnedApp.title;

	core.addEventListener(newItem, "click", self.item.pinned.open);
	if (!ifExistSameOpenAppItem) {
		newItem.setAttribute("data-menu-r", JSON.stringify(self.item.pinned.menuR));
		self.item.addToList(newItem);

		if (!preventBackendUpdate) self.updateDataToBackend();
	}

}

a9os_core_taskbar_windowlist.item.pinned.open = (event, item) => {
	if (!item.classList.contains("used"))
		core.link.push(item.getAttribute("data-app-url"));
}

a9os_core_taskbar_windowlist.item.pinned.remove = (event, item) => {
	self.component.windowList.removeChild(item);
	self.updateDataToBackend();
}

a9os_core_taskbar_windowlist.item.pinned.openItemToPinned = (event, item) => {
	if (self.component.querySelector(".item.pinned[data-appid='"+item.getAttribute("data-appid")+"']")) return;
	item.classList.add("pinned");
	item.classList.add("used");
	item.classList.add("usedbefore");

	var applistItem = a9os_core_taskbar_applist.component.querySelector(".app-list a[data-appid='"+item.getAttribute("data-appid")+"']");
	if (!applistItem) {
		return false;
	}

	var itemUrl = applistItem.getAttribute("href");
	item.setAttribute("data-app-url", itemUrl);

	core.addEventListener(item, "click", self.item.pinned.open);
}

a9os_core_taskbar_windowlist.item.pinned.menuR = [
	{
		name : "Ejecutar",
		action : "item.pinned.open"
	},
	{
		name : "Quitar",
		action : "item.pinned.remove"
	}
];

a9os_core_taskbar_windowlist.updateDataToBackend = () => {
	if (self.updateBackendTimeout) {
		clearTimeout(self.updateBackendTimeout);
		self.updateBackendTimeout = false;
	}

	self.updateBackendTimeout = setTimeout(() => {
		var arrPinnedApps = self.component.querySelectorAll(".item.pinned");

		var arrItemsToBackend = {};

		for (var i = 0 ; i < arrPinnedApps.length ; i++) {
			var currPinnedApp = arrPinnedApps[i];
			arrItemsToBackend[currPinnedApp.getAttribute("data-appid")] = {
				position : i
			};
		}

		core.sendRequest(
			"/userconfig/taskbar/updatepinnedapps",
			{
				items : arrItemsToBackend
			},
			false,
			false,
			true
		);
	}, 5000);
}

a9os_core_taskbar_windowlist.appendSavedPinnedApps = (arrPinnedApps) => {
	for (var i = 0 ; i < arrPinnedApps.length ; i++) {
		var currPinnedApp = arrPinnedApps[i];
		var pinnedAppApplistItem = a9os_core_taskbar_applist.component.querySelector(".app-list a[data-appid='"+currPinnedApp.appId+"']");
		var pinnedApp = {
			id : currPinnedApp.appId,
			url : pinnedAppApplistItem.getAttribute("href"),
			icon : pinnedAppApplistItem.querySelector("img").getAttribute("src"),
			title : pinnedAppApplistItem.querySelector("span").textContent
		};
		self.item.pinned.add(pinnedApp, true);
	}
}

a9os_core_taskbar_windowlist.window = {};
a9os_core_taskbar_windowlist.window.maximize = (event, taskbarItem) => {
	var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItem.getAttribute("data-taskbar-item-id")+"']");
	a9os_core_window.maxmizeRestore(false, wind0w);
}
a9os_core_taskbar_windowlist.window.minimize = (event, taskbarItem) => {
	var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItem.getAttribute("data-taskbar-item-id")+"']");
	if (taskbarItem.classList.contains("minimized")) {
		a9os_core_window.minimizeRestoreWindow(wind0w);
	} else {
		a9os_core_window.minimizeWindow(wind0w);
	}
}