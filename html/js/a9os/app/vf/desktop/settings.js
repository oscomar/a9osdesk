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
a9os_app_vf_desktop_settings.data = {};
a9os_app_vf_desktop_settings.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);
	self.data = data;


	var arrSourceItems = self.component.querySelectorAll(".sources-selector .source");
	for (var i = 0 ; i < arrSourceItems.length ; i++) {
		var currSourceItem = arrSourceItems[i];

		self.initSourceItem(currSourceItem, data);

		if (currSourceItem.classList.contains(data.arrUserWallpaperData.wallpaperType)) {
			currSourceItem.classList.add("selected");
			currSourceItem.querySelector(".item-radio").checked = true;
		}
	}
	a9os_core_main.addEventListener(arrSourceItems, "click", (event, currSourceItem) => {
		var sourceItemToUnselect = self.component.querySelector(".sources-selector .source.selected");
		sourceItemToUnselect.classList.remove("selected");
		sourceItemToUnselect.querySelector(".item-radio").checked = false;

		currSourceItem.classList.add("selected");
		currSourceItem.querySelector(".item-radio").checked = true;

		if (sourceItemToUnselect != currSourceItem) self.udpateDesktop();
	});



	var selectedWallpaperSizeType = data.arrUserWallpaperData.wallpaperSizeType;
	if (selectedWallpaperSizeType == "100% 100%") selectedWallpaperSizeType = "deform";

	var sizeSelectorToSelect = self.component.querySelector(".size-selector .size."+selectedWallpaperSizeType);
	sizeSelectorToSelect.classList.add("selected");

	var arrSizeSelectorItems = self.component.querySelectorAll(".size-selector .size");

	a9os_core_main.addEventListener(arrSizeSelectorItems, "click", (event, currSizeSelectorItem) => {
		var sizeSelectorToUnselect = self.component.querySelector(".size-selector .size.selected");
		sizeSelectorToUnselect.classList.remove("selected");

		currSizeSelectorItem.classList.add("selected");

		if (sizeSelectorToUnselect != currSizeSelectorItem) self.udpateDesktop();
	});


	var colorSelector = self.component.querySelector(".source.color input[type=color]");
	a9os_core_main.addEventListener(colorSelector, "change", (event, colorSelector) => {
		self.udpateDesktop();
	});
}

a9os_app_vf_desktop_settings._closeWindow = () => {
	if (self.component.closeSaving) return false;
	self.component.closeSaving = true;

	self.data.arrUserWallpaperData.userWallpaperMaxResW = self.component.querySelector(".max-resolution .maxres.w").value;
	self.data.arrUserWallpaperData.userWallpaperMaxResH = self.component.querySelector(".max-resolution .maxres.h").value;

	core.sendRequest(
		"/vf/desktopsettings/savedata",
		self.data.arrUserWallpaperData,
		{
			fn : (response, component) => {
				a9os_core_main.removeWindow(component);
			},
			args : {
				response : false,
				component : self.component
			}
		},
		false, false,
		{
			fn : (response, component) => { 
				a9os_core_main.removeWindow(component); 
			},
			args : {
				response : false,
				component : self.component
			}
		}
	);
}

a9os_app_vf_desktop_settings.initSourceItem = (currSourceItem, data) => {
	if (currSourceItem.classList.contains("system")) {
		var arrSystemWallpaperItems = currSourceItem.querySelectorAll(".system-wallpapers-selector .item");
		a9os_core_main.addEventListener(arrSystemWallpaperItems, "click", (event, currSystemWallpaperItems) => {
			for (var i = 0 ; i < arrSystemWallpaperItems.length ; i++) {
				arrSystemWallpaperItems[i].removeAttribute("data-selected");
			}
			currSystemWallpaperItems.setAttribute("data-selected", true);

			setTimeout(self.udpateDesktop, 1); //do AFTER bubbling para seleccionar el type
		});
	}
	if (currSourceItem.classList.contains("user")) {
		var userWpFileHandleId = a9os_app_vf_main.fileHandle.attach(
			self.component,
			{
				fn : (component) => { 
					var openFromPath = component.querySelector(".select-file .info .path").textContent;
					if (openFromPath == "") openFromPath = "/";

					return { qty : "simple", type : "file", fileExtensions : ["JPG", "PNG"], dropType : "single", doNotOpen : true, openFromPath : openFromPath };
				}, 
				args : {
					component : self.component
				}
			},
			false,
			{ fn : self.receiveUserWallpaperPath, args : { handle : false } },
			false,
			false,
			{ //cancelFn
				fn : a9os_core_main.selectWindow,
				args : {
					component : self.component
				}
			}
		);

		var selectFileBtn = currSourceItem.querySelector(".btn.select-file");

		selectFileBtn.setAttribute("data-vf-drop-area", userWpFileHandleId);
		a9os_core_main.addEventListener(selectFileBtn, "click", (event, selectFileBtn, component, userWpFileHandleId) => {
			a9os_app_vf_main.fileHandle.open(component, userWpFileHandleId);
		}, self.component, userWpFileHandleId);

	}
}

a9os_app_vf_desktop_settings.receiveUserWallpaperPath = (handle) => {
	if (handle.path == "untitled") return;

	self.data.windowData.userWallpaperFilePath = handle.path;

	self.component.querySelector(".select-file .info .path").textContent = handle.path;

	var maxResW = self.component.querySelector(".max-resolution .maxres.w").value;
	var maxResH = self.component.querySelector(".max-resolution .maxres.h").value;

	core.sendRequest(
		"/vf/desktopsettings/selectuserwallpaper",
		{
			path : handle.path,
			maxResW : maxResW,
			maxResH : maxResH
		},
		{
			fn : (response, component) => {
				component.querySelector(".select-file .thumb").src = response.thumb;
				self.udpateDesktop();
			},
			args : {
				response : false,
				component : self.component
			}
		}
	);

}

a9os_app_vf_desktop_settings.udpateDesktop = () => {
	var arrWallpaperTypes = ["system", "user", "color"];
	var selectedTypeSource = self.component.querySelector(".sources-selector .source.selected");
	var selectedType = "";
	for (var i = 0 ; i < arrWallpaperTypes.length ; i++) {
		if (selectedTypeSource.classList.contains(arrWallpaperTypes[i])) selectedType = arrWallpaperTypes[i];
	}

	self.data.arrUserWallpaperData.wallpaperType = selectedType;

	if (selectedType == "system") {
		var systemWallpaperItem = self.component.querySelector(".system-wallpapers-selector .item[data-selected=true]");

		self.data.arrUserWallpaperData.wallpaperValue = systemWallpaperItem.getAttribute("data-id");
	}

	self.data.arrUserWallpaperData.wallpaperBackgroundColor = self.component.querySelector(".source.color input[type=color]").value;


	var sizeTypeSelected = self.component.querySelector(".size-selector .size.selected");
	var arrSizeTypes = ["contain", "cover", "deform"];
	for (var i = 0 ; i < arrSizeTypes.length ; i++) {
		if (sizeTypeSelected.classList.contains(arrSizeTypes[i])) selectedSize = arrSizeTypes[i];
	}
	if (selectedSize == "deform") selectedSize = "100% 100%";

	self.data.arrUserWallpaperData.wallpaperSizeType = selectedSize;


	a9os_app_vf_desktop.userWallpaper.init(self.data.arrUserWallpaperData);
}