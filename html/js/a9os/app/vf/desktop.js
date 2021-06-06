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
a9os_app_vf_desktop.main = (data) => {
	
	var vfFilesContainer = self.component.querySelector(".vf-files-container");

	self.component.classList.add("selected");
	
	var arrWindowShortcuts = a9os_app_vf_desktop.keyboardShortcuts.get(vfFilesContainer);
	a9os_core_main.kbShortcut.add(vfFilesContainer, arrWindowShortcuts);

	if (data.window) a9os_core_window.processWindowData(data);


	a9os_core_main.addEventListener(vfFilesContainer, "click", (event, vfFilesContainer) => {
		self.selectDesktop();

		if (!vfFilesContainer.querySelector(".square-selection")) self.unselectItems(vfFilesContainer);
	});

	self.squareSelection.attach(vfFilesContainer);
	self.attachDragFileUpload(vfFilesContainer);
	self.userWallpaper.init(data.userWallpaperData);

	vfFilesContainer.setAttribute("data-path", data.desktopPath);
	self.refresh();

	a9os_app_vf_main.folderObserver.add(self.component, vfFilesContainer.getAttribute("data-path"), {
		fn : self.refresh,
		args : {
			component : self.component
		}
	});


	self.desktopScroll.init();

}


a9os_app_vf_desktop.refresh = (component) => {
	
	if (component instanceof Event) component = self.component;

	var component = component||self.component;

	var vfFilesContainer = component.querySelector(".vf-files-container");
	if (!vfFilesContainer.getAttribute("data-path")) return false;
	core.sendRequest(
		"/vf/folder",
		{
			path : vfFilesContainer.getAttribute("data-path")
		},
		{
			fn : (response, component, vfFilesContainer) => {
				if (response.length == 0) return;
				if (response.error) {
					a9os_app_vf_main.catchBackendError(response.error);
					return false;
				}

				self.folder.show(
					response.path,
					response.files, 
					component, 
					{
						folder : { 
							click : self.folder.open 
						},
						file : {
							click : self.file.open 
						}
					}
				);

				if(response.postUpdate){
					self.folder.updateDB( vfFilesContainer.getAttribute("data-path"), component);
				}
			},
			args : {
				response : false,
				component : component,
				vfFilesContainer : vfFilesContainer
			}
		}
	);
}

a9os_app_vf_desktop.selectDesktop = () => {
	
	if (!a9os_core_main.component.querySelector("cmp.a9os_core_window > .window.top-window")) {
		//desktop already selected
		core.link.push("/", {}, true);
		core.link.title("Web Desktop - os.com.ar");
		
		return;
	}
	core.link.push("/", {}, true);
	core.link.title("Web Desktop - os.com.ar");
	core.link.favicon("/resources/app-icon.png");

	var vfFilesContainer = self.component.querySelector(".vf-files-container");
	vfFilesContainer.classList.add("selected");
	self.component.classList.add("selected");
	
	var arrWindows = a9os_core_main.component.querySelectorAll("cmp.a9os_core_window > .window");
	for (var i = 0 ; i < arrWindows.length ; i++){
		arrWindows[i].classList.remove("top-window");
		if (window.a9os_core_taskbar && arrWindows[i].classList.contains("top-window")) 
			a9os_core_taskbar_windowlist.item.unselect(arrWindows[i].getAttribute("data-taskbar-item-id"));
	}

	a9os_core_taskbar.updateBackgroundColor();
}


a9os_app_vf_desktop.squareSelection = {};
a9os_app_vf_desktop.squareSelection.attach = (vfFilesContainer) => {
	
	var squareDiv = document.createElement("div");
	squareDiv.classList.add("square-selection");

	a9os_core_main.moveEvent.add(vfFilesContainer, (interface, vfFilesContainer, squareDiv) => {
		if (interface.buttons != 1) return;


		if (!vfFilesContainer.contains(squareDiv)){
			vfFilesContainer.appendChild(squareDiv);
			vfFilesContainer.arrItemCoords = self.squareSelection.calculateItemCoords(vfFilesContainer);
			vfFilesContainer.classList.add("square-selection-doing");
		}

		if (interface.element.x < vfFilesContainer.scrollWidth) {		
			if (interface.element.x - interface.element.start.x > 0) {
				squareDiv.style.left = interface.element.start.x;
				squareDiv.style.width = interface.element.x - interface.element.start.x;
			} else {
				squareDiv.style.left = interface.element.x;
				squareDiv.style.width = interface.element.start.x-interface.element.x;
			}
		}

		if (interface.element.y < vfFilesContainer.scrollHeight) {
			if (interface.element.y - interface.element.start.y > 0) {
				squareDiv.style.top = interface.element.start.y;
				squareDiv.style.height = interface.element.y - interface.element.start.y;
			} else {
				squareDiv.style.top = interface.element.y;
				squareDiv.style.height = interface.element.start.y-interface.element.y;
			}
		}

		selectionX1 = parseInt(squareDiv.style.left);
		selectionX2 = parseInt(squareDiv.style.left) + parseInt(squareDiv.style.width);
		selectionY1 = parseInt(squareDiv.style.top);
		selectionY2 = parseInt(squareDiv.style.top) + parseInt(squareDiv.style.height);
		

		for (var i = 0 ; i < vfFilesContainer.arrItemCoords.length ; i++) {
			var currItemCoord = vfFilesContainer.arrItemCoords[i];
			if (selectionX1 < currItemCoord.x2 && selectionX2 > currItemCoord.x1
			&&  selectionY1 < currItemCoord.y2 && selectionY2 > currItemCoord.y1) {
				if (!interface.originalEvent.ctrlKey) {
					a9os_app_vf_desktop.selectItem(currItemCoord.item);
				} else {				
					if (currItemCoord.item.classList.contains("selected") && !currItemCoord.item.classList.contains("temp-selected")) {
						a9os_app_vf_desktop.unselectItem(currItemCoord.item);
						currItemCoord.item.classList.add("temp-unselected");
					}
					if (!currItemCoord.item.classList.contains("selected") && !currItemCoord.item.classList.contains("temp-unselected")) {
						a9os_app_vf_desktop.selectItem(currItemCoord.item);
						currItemCoord.item.classList.add("temp-selected");
					}
				}
			} else {
				if (!interface.originalEvent.ctrlKey && currItemCoord.item.classList.contains("selected")) {
					a9os_app_vf_desktop.unselectItem(currItemCoord.item);
				}
			}
		}

		a9os_core_main.moveEvent.autoscroll.add(vfFilesContainer, interface);


	}, (event, vfFilesContainer, squareDiv) => {
		if (vfFilesContainer.contains(squareDiv)) {
			setTimeout((vfFilesContainer, squareDiv) => {
				vfFilesContainer.removeChild(squareDiv);
				vfFilesContainer.classList.remove("square-selection-doing");
			}, 1, vfFilesContainer, squareDiv);


			a9os_core_main.moveEvent.autoscroll.cancelAll(vfFilesContainer);

			vfFilesContainer.querySelectorAll(".temp-selected, .temp-unselected").forEach((item) => {
				item.classList.remove("temp-selected");
				item.classList.remove("temp-unselected");
			});
		}
	}, squareDiv);
}

a9os_app_vf_desktop.squareSelection.calculateItemCoords = (vfFilesContainer) => {
	
	var arrItems = vfFilesContainer.querySelectorAll(".item");
	arrFinalItemCoords = [];
	for (var i = 0 ; i < arrItems.length ; i++){
		var currItem = arrItems[i];

		var currFinalItemCoords = {};
		currFinalItemCoords.item = currItem;

		currFinalItemCoords.x1 = currItem.offsetLeft;
		currFinalItemCoords.x2 = currItem.offsetLeft + currItem.offsetWidth;

		currFinalItemCoords.y1 = currItem.offsetTop;
		currFinalItemCoords.y2 = currItem.offsetTop + currItem.offsetHeight;

		arrFinalItemCoords.push(currFinalItemCoords);
	}

	return arrFinalItemCoords;
}


a9os_app_vf_desktop.attachDragFileUpload = (vfFilesContainer) => {
	a9os_core_main.addEventListener(vfFilesContainer, "drop", (event, vfFilesContainer) => {
		event.preventDefault();

		var componentName = vfFilesContainer.goToParentClass("component", "cmp").getAttribute("data-component-name");
		vfFilesContainer.classList.remove("dragover");

		if (!event.dataTransfer.items) return;

		for (var i = 0 ; i < event.dataTransfer.items.length ; i++){
			var currFile = event.dataTransfer.items[i];
			if (currFile.kind != "file") continue;

			currFile = currFile.getAsFile();
			a9os_app_vf_main.fileHandle.sendFile({
				path : vfFilesContainer.getAttribute("data-path")+currFile.name,
				data : currFile,
			}, {
				fn : (path, handle) => {
					a9os_app_vf_main.folderObserver.refresh(path);
				},
				args : {
					path : vfFilesContainer.getAttribute("data-path"),
					handle : false
				}
			});
		}
	});
	a9os_core_main.addEventListener(vfFilesContainer, "dragover", (event, vfFilesContainer) => {
		event.preventDefault();
		vfFilesContainer.classList.add("dragover");
	});
	a9os_core_main.addEventListener(vfFilesContainer, "dragleave", (event, vfFilesContainer) => {
		event.preventDefault();
		vfFilesContainer.classList.remove("dragover");
	});

}


a9os_app_vf_desktop.file = {};

a9os_app_vf_desktop.file.open = (event, item) => {
	if (item.hasAttribute("data-opening")) return false;

	// prevent double open on dblclick
	item.setAttribute("data-opening", "true");
	setTimeout((item) => {
		item.removeAttribute("data-opening");
	}, 500, item);


	self.unselectItem(item);
	core.link.push(
		item.getAttribute("data-open-with-path"),
		{
			file : item.getAttribute("data-path")
		}
	);
}

a9os_app_vf_desktop.file.openWith = (event, item) => {
	core.link.push("/vf/openWith", {
		file : item.getAttribute("data-path")
	});
}


a9os_app_vf_desktop.file.delete = (event, item) => {
		var arrCrossCallbacks = {};
	var parentComponent = item.goToParentClass("component", "cmp");
	var vfFilesContainer = item.goToParentClass("vf-files-container");

	var arrSelectedItems = vfFilesContainer.querySelectorAll(".item.selected");
	if (arrSelectedItems.length == 0) var arrSelectedItems = [item];
	var arrPaths = [];
	for (var i = 0 ; i < arrSelectedItems.length ; i++) {
		if (arrSelectedItems[i].getAttribute("data-path") == "/desktop/") continue;
		arrPaths.push(arrSelectedItems[i].getAttribute("data-path"));
	}

	if (arrPaths.length == 0) return;

	var currConfirmCci = a9os_core_main.windowCrossCallback.add({
		fn : (component, arrPaths) => {

			core.sendRequest(
				"/vf/delete",
				{
					path : arrPaths
				},
				{
					fn : (response) => {
						for (var i = 0 ; i < response.length ; i++){
							a9os_app_vf_main.folderObserver.refresh(response[i]);
						}
					},
					args : {
						response : false
					}
				}
			);
		}, 
		args : {
			component : parentComponent,
			arrPaths : arrPaths
		}
	}, parentComponent);

	arrCrossCallbacks.accept = {
		name : "Aceptar",
		cci : currConfirmCci,
		selected : true
	}

	var dialogMode = "confirmDeleteFile";
	if (item.getAttribute("data-type") == "folder") dialogMode = "confirmDeleteFolder";
	if (arrPaths.length > 1) dialogMode = "confirmDeleteMulti";

	core.link.push("/vf/dialog", {
		cdi : a9os_core_main.windowCrossData.add({
			path : arrPaths,
			actions : arrCrossCallbacks,
			mode : dialogMode
		})
	});
}

a9os_app_vf_desktop.file.rename = (event, item, component, newItem) => {
	if (item.getAttribute("data-path") == "/desktop/" && !newItem) return;

	var postEditFunction = confirmEdit;
	if (newItem) postEditFunction = confirmNewItem;


	var component = component||self.component;
	item.classList.add("edit");

	var itemName = item.querySelector(".name");
	itemName.setAttribute("data-name", itemName.textContent);
	itemName.contentEditable = "true";
	setTimeout((itemName) => { 
		itemName.focus();
		selectText(itemName);
	}, 20, itemName);
	a9os_core_main.addEventListener(itemName, "blur", (e,i) => { postEditFunction(e,i,component)});
	a9os_core_main.addEventListener(itemName, "keyup", (e, i) => {
		if (e.which == 32 || e.which == 13) e.preventDefault(); // space | enter
		if (e.which == 27) { // Esc
			cancelEdit(i);
			if (newItem) {
				component.querySelector(".vf-files-container").removeChild(item);
			}
		}
	});
	a9os_core_main.addEventListener(itemName, "keydown", (e, i) => {
		if ((e.shiftKey && e.which == 55) || e.which == 111) e.preventDefault(); // shift+7 || "/"
		if (e.which == 13) { // enter
			e.preventDefault();
			postEditFunction(e,i, component);
		}
	});

	a9os_core_main.addEventListener(itemName, "click", (e,i) => { e.stopPropagation(); return false; });
	a9os_core_main.addEventListener(itemName, "dblclick", (e,i) => { e.stopPropagation(); return false; });

	function confirmEdit(event, item, component, forceEdit) {
		var forceEdit = forceEdit||false;
		var itemName = item;
		var item = item.parentElement;


		if (itemName.contentEditable == "false" && !forceEdit) return;
		itemName.contentEditable = "false";

		itemName.textContent = itemName.textContent.split("/").join("");


		var basePath = item.getAttribute("data-path").split("/");
		if (item.getAttribute("data-type") == "folder") {
			basePath.pop();
			basePath.pop();
		} else {
			basePath.pop();
		}


		var fromPath = basePath.join("/")+"/"+item.getAttribute("data-name").trim();
		var toPath = basePath.join("/")+"/"+itemName.textContent.trim();

		if (fromPath == toPath) {
			cancelEdit(itemName);
			return;
		}

		if (itemName.textContent.trim() == "") {
			cancelEdit(itemName);
			return;
		}

		var finalMoveFn = {
			fn : (response, fromPath, toPath, basePath, component) => {
				if (response[toPath].result == "ok") {
					itemName.contentEditable = "false";

					if (response[toPath].type == "folder") {
						a9os_app_vf_main.folderObserver.refresh(toPath, true);
					} else {
						a9os_app_vf_main.folderObserver.refresh(toPath);
					}

				} else if (response[toPath].result == "confirm") {
					var confirmEditCCI = a9os_core_main.windowCrossCallback.add({
						fn : confirmEdit,
						args : {
							event : event,
							item : itemName,
							component : component,
							forceEdit : true
						}
					}, component);

					var cancelCCI = a9os_core_main.windowCrossCallback.add({
						fn : (component, event, item) => {
							if (component.getAttribute("data-component-name") == "a9os_app_vf_window") {
								a9os_core_main.selectWindow(component.goToParentClass("window", "cmp"));
							}
							itemName.contentEditable = "true";
							setTimeout((item) => { 
								item.focus();
								selectAll(item);
							}, 20, item);
						},
						args : {
							component : component,
							event : event,
							item : itemName
						}
					}, component);


					var dialogMode = "confirmOverwrite";
					if (item.getAttribute("data-type") == "folder") dialogMode = "confirmOverwriteFolder";

					core.link.push("/vf/dialog", {
							path : toPath, 
							actions : {
								yes : {
									name : "Si",
									cci : confirmEditCCI
								}
							},
							mode : dialogMode,
							cancelAction : cancelCCI
						}
					);
				}
			},
			args : {
				response : false,
				fromPath : fromPath,
				toPath : toPath,
				basePath : basePath,
				component : component
			}
		}
		
		core.sendRequest(
			"/vf/rename",
			{
				path : [
					{
						from : fromPath,
						to : toPath,
						type : item.getAttribute("data-type"),
						force : forceEdit
					}
				]
			},
			finalMoveFn,
			false, false,
			{
				fn : (response, itemName) => {
					cancelEdit(itemName);
				}, 
				args : {
					response : false,
					itemName : itemName
				}
			}
		);
	}


	function confirmNewItem(event, item, component, forceNew) { // nueva carpeta - nuevo archivo vacío
		var forceNew = forceNew||false;
		var itemName = item;
		var item = item.parentElement;


		if (itemName.contentEditable == "false" && !forceNew) return;
		itemName.contentEditable = "false";

		itemName.textContent = itemName.textContent.split("/").join("");

		if (itemName.textContent.trim() == "") {
			component.querySelector(".vf-files-container").removeChild(item);
			return;
		}

		var newPath = item.getAttribute("data-path")+itemName.textContent.trim();

		var newItemFn = {
			fn : (response) => {
				if (response.result == "ok") {
					itemName.contentEditable = "false";

					a9os_app_vf_main.folderObserver.refresh(response.path, true);

				} else if (response.result == "confirm") {
					var confirmNewItemCCI = a9os_core_main.windowCrossCallback.add({
						fn : confirmNewItem,
						args : {
							event : event,
							item : itemName,
							component : component,
							forceNew : true
						}
					}, component);

					var cancelCCI = a9os_core_main.windowCrossCallback.add({
						fn : (component, event, item) => {
							if (component.getAttribute("data-component-name") == "a9os_app_vf_window") {
								a9os_core_main.selectWindow(component.goToParentClass("window", "cmp"));
							}
							itemName.contentEditable = "true";
							setTimeout((item) => { 
								item.focus();
								selectAll(item);
							}, 20, item);
						},
						args : {
							component : component,
							event : event,
							item : itemName
						}
					}, component);

					var dialogMode = "confirmOverwrite";
					if (item.getAttribute("data-type") == "folder") dialogMode = "confirmOverwriteFolder";

					core.link.push("/vf/dialog", {
							path : newPath, 
							actions : {
								yes : {
									name : "Si",
									cci : confirmNewItemCCI
								}
							},
							mode : dialogMode,
							cancelAction : cancelCCI
						}
					);
				}
			},
			args : {
				response : false
			}
		}

		core.sendRequest(
			"/vf/newitem",
			{
				type : item.getAttribute("data-type"),
				newPath : newPath,
				force : forceNew
			},
			newItemFn,
			false,false,
			{
				fn : (response, itemName, component, newItem) => {
					cancelEdit(itemName);
					if (newItem) {
						component.querySelector(".vf-files-container").removeChild(item);
					}
				},
				args : {
					response : false,
					itemName : itemName,
					component : component,
					newItem : newItem
				}
			}
		);
	}

	function selectText(itemName) {
		var itemName = itemName.childNodes[0];
		var range = document.createRange();
		range.setStart(itemName, 0);
		var endIdx = itemName.textContent.indexOf(".");
		if (endIdx == -1) endIdx = itemName.textContent.length;
		range.setEnd(itemName, endIdx);
		var sel = window.getSelection();
		sel.removeAllRanges();
		sel.addRange(range);
	}

	function cancelEdit(item) {
		item.contentEditable = "false";
		item.textContent = item.getAttribute("data-name");
		item.parentElement.classList.remove("edit");
	}

}

a9os_app_vf_desktop.file.new = (event, item, component) => {
	a9os_app_vf_desktop.folder.new(event, item, component, true);
}

a9os_app_vf_desktop.file.download = (event, item) => {
	var baseComponent = item.goToParentClass("component", "cmp").querySelector(".vf-files-container");
	var arrFilesDivs = baseComponent.querySelectorAll(".item.selected");
	if (arrFilesDivs.length > 1) self.file.multiDownload(event, arrFilesDivs);
	else a9os_app_vf_main.fileHandle.download([item.getAttribute("data-path")]);
}

a9os_app_vf_desktop.file.multiDownload = (event, arrFilesDivs) => { //TODO!!

	var arrPaths = [];
	for (var i = 0 ; i < arrFilesDivs.length ; i++) {
		arrPaths.push(arrFilesDivs[i].getAttribute("data-path"));
	}

	a9os_app_vf_main.fileHandle.download(arrPaths);
}

a9os_app_vf_desktop.file.upload = (event, item) => {
	var vfFilesContainer = item;
	var componentName = vfFilesContainer.goToParentClass("component", "cmp").getAttribute("data-component-name");
	var parentPath = vfFilesContainer.getAttribute("data-path");

	var uploadInput = document.createElement("input");
	uploadInput.type = "file";
	uploadInput.multiple = true;

	uploadInput.click();

	a9os_core_main.addEventListener(uploadInput, "change", (event, uploadInput, vfFilesContainer) => {
		if (!uploadInput.files) return;
		for (var i = 0 ; i < uploadInput.files.length ; i++){
			var currFile = uploadInput.files[i];

			a9os_app_vf_main.fileHandle.sendFile({
				path : vfFilesContainer.getAttribute("data-path")+currFile.name,
				data : currFile,
			}, {
				fn : (path, handle) => {
					a9os_app_vf_main.folderObserver.refresh(path);
				},
				args : {
					path : vfFilesContainer.getAttribute("data-path"),
					handle : false
				}
			});
		}
	}, vfFilesContainer);
}


a9os_app_vf_desktop.userWallpaper = {};
a9os_app_vf_desktop.userWallpaper.init = (data) => {
	var desktopVfFilesContainer = self.component.querySelector(".vf-files-container");
	desktopVfFilesContainer.style.backgroundSize = data.wallpaperSizeType;

	if (data.wallpaperType == "system") {
		desktopVfFilesContainer.style.backgroundImage = "url("+data.systemWallpaperResourceFolder+data.wallpaperValue+")";
		desktopVfFilesContainer.setAttribute("data-background-image", data.systemWallpaperResourceFolder+data.wallpaperValue);
	}
	if (data.wallpaperType == "user") {
		a9os_app_vf_main.fileHandle.requestFile(
			{ 
				path : data.userWallpaperFolder+"wallpaper.jpg"
			},
			{
				fn : (handle) => {
					var imgBlobUrl = a9os_app_vf_main.fileHandle.getBlobUrl(handle.data);
					desktopVfFilesContainer.style.backgroundImage = "url("+imgBlobUrl+")";
					desktopVfFilesContainer.setAttribute("data-background-image", imgBlobUrl);

					setTimeout(() => {
						if (window.a9os_core_taskbar_applist) a9os_core_taskbar_applist.setHeaderGradientByBackground();
					}, 50);
					
				},
				args : {
					handle : false
				}
			}
		);
	}
	desktopVfFilesContainer.style.backgroundColor = data.wallpaperBackgroundColor;

	if (data.wallpaperType == "color") {
		desktopVfFilesContainer.style.backgroundImage = "";
		desktopVfFilesContainer.setAttribute("data-background-image", "false");
	}

	setTimeout(() => {
		if (window.a9os_core_taskbar_applist) a9os_core_taskbar_applist.setHeaderGradientByBackground();
	}, 50);
}

a9os_app_vf_desktop.userWallpaper.openDesktopSettings = () => {
	core.link.push("/vf/desktopsettings");
}



a9os_app_vf_desktop.folder = {};

a9os_app_vf_desktop.folder.open = (event, item) => {
	if (item.hasAttribute("data-opening")) return false;

	// prevent double open on dblclick
	item.setAttribute("data-opening", "true");
	setTimeout((item) => {
		item.removeAttribute("data-opening");
	}, 500, item);

	core.link.push("/vf", { folder : item.getAttribute("data-path") });
}


a9os_app_vf_desktop.folder.show = (path, arrFiles, baseComponent, arrHandlers, fnCallback) => { 
	//arrHandlers {"file"|"folder" : {event : action, event : action}}
	//var baseComponent = baseComponent||a9os_app_vf_window.component;
	//resetFilterButton();

	path = a9os_app_vf_main.sanitizePath(path);

	var vfFilesContainer = baseComponent.querySelector(".vf-files-container");
	vfFilesContainer.setAttribute("data-path", path);
	vfFilesContainer.setAttribute("data-vf-drop-area", true);
	vfFilesContainer.innerHTML = "";

	if (arrFiles.length == 0){
		vfFilesContainer.appendChild(baseComponent.querySelector(".templates .empty-folder").cloneNode(true));
	}

	var selectionDetail = vfFilesContainer.parentElement.querySelector(".selection-detail");
	if (selectionDetail) {
		selectionDetail.classList.remove("show");
	}

	for (var i = 0 ; i < arrFiles.length ; i++){
		var currFile = arrFiles[i];

		var pathAndFile = a9os_core_main.splitFilePath(currFile.path);

		var newItem = baseComponent.querySelector(".templates .item").cloneNode(true);
		var itemType = currFile.type;

		newItem.setAttribute("data-i", i);

		newItem.querySelector(".icon").classList.add("type-"+itemType);
		newItem.querySelector(".name").textContent = pathAndFile[1];

		newItem.setAttribute("data-type", itemType);
		newItem.setAttribute("data-path", currFile.path);
		newItem.setAttribute("data-name", pathAndFile[1]);

		var arrMenuR = [];
		if (itemType == "file"){
			newItem.setAttribute("data-extension", currFile.extension);

			if (newItem.querySelector(".size")) {
				newItem.querySelector(".size").textContent = a9os_app_vf_main.convertSize(currFile.size);
				newItem.querySelector(".size").setAttribute("data-size", currFile.size);
			}
			
			newItem.setAttribute("data-id", currFile.id);
			newItem.setAttribute("data-path", currFile.path);
			newItem.setAttribute("data-hash", currFile.hash);
			newItem.setAttribute("data-size", currFile.size);
			newItem.setAttribute("data-open-with-path", currFile.open_with_path);
			newItem.setAttribute("data-open-with-name", currFile.open_with_name);
			newItem.setAttribute("data-open-with-icon-url", currFile.open_with_icon_url);

			if (currFile.preview_url){
				newItem.querySelector(".icon").style.backgroundImage = "url("+currFile.preview_url+")";
			}

			if (currFile.open_with_name == "open-with"){
				arrMenuR.push({
					name : "Abrir con...",
					action : itemType+".openWith"
				});
			} else {
				arrMenuR.push({
					name : "Abrir con "+currFile.open_with_name,
					action : itemType+".open"
				});
				arrMenuR.push({
					name : "Abrir con otra aplicación",
					action : itemType+".openWith"
				});
			}

		} else {  //type folder
			if (newItem.querySelector(".size")) 
				newItem.removeChild(newItem.querySelector(".size"));

			arrMenuR.push({
				name : "Abrir en nueva ventana",
				action : itemType+".open", 
			});
			
			if (!vfFilesContainer.classList.contains("is-desktop")) {
				arrMenuR.push({
					name : "Añadir a Marcadores",
					action : "bookmark.addItem", 
				});
			}

			newItem.setAttribute("data-vf-drop-area", true);
		}
		arrMenuR.push("separator");
		arrMenuR.push({
			name : "Copiar",
			shortcut : ["Ctrl", "C"],
			action : "[a9os_app_vf_desktop].fileClipboard.menuToClipboard",
			data : "copy",
			dynamicShowTrigger : "[a9os_app_vf_desktop].fileClipboard.menuDynamicTrigger"
		});
		arrMenuR.push({
			name : "Cortar",
			shortcut : ["Ctrl", "X"],
			action : "[a9os_app_vf_desktop].fileClipboard.menuToClipboard",
			data : "cut",
			dynamicShowTrigger : "[a9os_app_vf_desktop].fileClipboard.menuDynamicTrigger"
		});
		arrMenuR.push({
			name : "Pegar",
			shortcut : ["Ctrl", "V"],
			action : "[a9os_app_vf_desktop].fileClipboard.menuToClipboard",
			data : "paste",
			dynamicShowTrigger : "[a9os_app_vf_desktop].fileClipboard.menuDynamicTrigger"
		});

		arrMenuR.push("separator");
		arrMenuR.push({
			name : "Renombrar",
			shortcut : ["F2"],
			action : itemType+".rename",
			active : (newItem.getAttribute("data-path") != "/desktop/")
		});
		arrMenuR.push({
			name : "Borrar",
			action : itemType+".delete",
			shortcut : ["DEL"],
			active : (newItem.getAttribute("data-path") != "/desktop/")
		});
		arrMenuR.push("separator");
		arrMenuR.push({
			name : "Descargar",
			action : itemType+".download",
		});
		newItem.setAttribute("data-menu-r", JSON.stringify(arrMenuR));


		for (var type in arrHandlers){ 
			if (currFile.type == type){
				for (var handler in arrHandlers[type]) {
					a9os_core_main.addEventListener(newItem, handler, (event, item, callback, vfFilesContainer, component) => {
						if (event.ctrlKey) { // multiple select
							event.stopPropagation();
						} else {
							self.unselectItems(vfFilesContainer);
							self.selectItem(item);
							if (callback) callback(event, item, component);
						}
					}, arrHandlers[type][handler], vfFilesContainer, baseComponent);
				}
			}
		}

		a9os_core_main.addEventListener(newItem, "click", (event, item) => {
			if (!event.ctrlKey) return;
			event.stopPropagation();
			if (item.classList.contains("selected")) {
				self.unselectItem(item);
			} else {
				self.selectItem(item);
			}
		});

		var longTouchTimeout = false;
		a9os_core_main.addEventListener(newItem, "touchstart", (event, item) => {
			if (longTouchTimeout) clearTimeout(longTouchTimeout);
			longTouchTimeout = setTimeout((event, item) => {
				event.stopPropagation();
				a9os_core_main.removeMenu();
				if (item.classList.contains("selected")) {
					self.unselectItem(item);
				} else {
					self.selectItem(item);
				}
			}, 1500, event, item);
		});
		a9os_core_main.addEventListener(newItem, "touchend", (event, item) => {
			if (longTouchTimeout) clearTimeout(longTouchTimeout);
		});



		if (vfFilesContainer.getAttribute("data-prevent-selection")) {
			newItem.removeChild(newItem.querySelector(".select-button"));
		} else {
			a9os_core_main.addEventListener(newItem.querySelector(".select-button"), "click", (event, item) => {
				event.stopPropagation();
				var item = item.parentElement;

				if (item.classList.contains("selected")) {
					self.unselectItem(item);
				} else {
					self.selectItem(item);
				}
			});
		}

		vfFilesContainer.appendChild(newItem);

		self.folder.addItemDragAndDrop(vfFilesContainer, newItem);
	}

	self.desktopScroll.checkNeed(baseComponent);

	if (fnCallback) core.callCallback(fnCallback);
}

a9os_app_vf_desktop.folder.addItemDragAndDrop = (vfFilesContainer, newItem) => {
		
		var a9os_main = a9os_core_main.component.querySelector(".a9os-main");
		var filesContainerPosition = false;
		var destinyMatchTimeout = false;

		a9os_core_main.moveEvent.add(newItem, (interface, newItem, vfFilesContainer) => {
			if (interface.buttons != 1) return ;
			if (newItem.classList.contains("edit")) return;
			

			var itemMoveLayer = a9os_main.querySelector(".item-move-layer");
			if (!itemMoveLayer) {
				if (!filesContainerPosition) filesContainerPosition = vfFilesContainer.getBoundingClientRect();
				newItem.classList.add("selected");
				var arrSelectedItems = vfFilesContainer.querySelectorAll(".item.selected");
				vfFilesContainer.removeAttribute("data-vf-drop-area");
				
				var arrItemCoords = [];

				var firstItemTop = Infinity;
				var firstItemLeft = Infinity;

				var lastItemTop = 0;
				var lastItemLeft = 0;

				for (var i = 0 ; i < arrSelectedItems.length ; i++){
					var currSelectedItem = arrSelectedItems[i];
					var currItemCoord = {};

					currItemCoord.x = currSelectedItem.offsetLeft;
					currItemCoord.y = currSelectedItem.offsetTop;

					if (currItemCoord.x < firstItemLeft) firstItemLeft = currItemCoord.x;
					if (currItemCoord.y < firstItemTop) firstItemTop = currItemCoord.y;

					if (currItemCoord.x + currSelectedItem.offsetWidth > lastItemLeft) lastItemLeft = currItemCoord.x + currSelectedItem.offsetWidth;
					if (currItemCoord.y + currSelectedItem.offsetHeight > lastItemTop) lastItemTop = currItemCoord.y + currSelectedItem.offsetHeight;

					arrItemCoords.push(currItemCoord);
				}


				var itemMoveLayer = document.createElement("div");
				itemMoveLayer.classList.add("item-move-layer");
				itemMoveLayer.classList.add("vf-files-container");
				itemMoveLayer.classList.add("closed");
				itemMoveLayer.setAttribute("data-path", vfFilesContainer.getAttribute("data-path"));
				setTimeout((itemMoveLayer) => {
					itemMoveLayer.classList.remove("closed");
				}, 10, itemMoveLayer);

				if (vfFilesContainer.classList.contains("list-mode")) itemMoveLayer.classList.add("list-mode");
				if (vfFilesContainer.classList.contains("is-desktop")) itemMoveLayer.classList.add("is-desktop");


				a9os_main.appendChild(itemMoveLayer);


				itemMoveLayer.style.top = firstItemTop + filesContainerPosition.top - vfFilesContainer.scrollTop;
				itemMoveLayer.style.left = firstItemLeft + filesContainerPosition.left - vfFilesContainer.scrollLeft;

				itemMoveLayer.style.width = lastItemLeft - firstItemLeft;
				itemMoveLayer.style.height = lastItemTop - firstItemTop;

				for (var i = 0 ; i < arrSelectedItems.length ; i++){
					var currSelectedItem = arrSelectedItems[i].cloneNode(true);
					self.unselectItem(currSelectedItem);

					var currItemCoord = arrItemCoords[i];

					currSelectedItem.removeAttribute("data-menu-r");

					itemMoveLayer.appendChild(currSelectedItem);
					currSelectedItem.style.left = currItemCoord.x - firstItemLeft;
					currSelectedItem.style.top = currItemCoord.y - firstItemTop;
					currSelectedItem.style.width = arrSelectedItems[i].offsetWidth;
					currSelectedItem.style.height = arrSelectedItems[i].offsetHeight;

					arrSelectedItems[i].classList.add("move-hide");
					if (arrSelectedItems[i].getAttribute("data-type") == "folder") 
						arrSelectedItems[i].setAttribute("data-vf-drop-area", false);
				}

				newItem.firstItemLeft = firstItemLeft;
				newItem.firstItemTop = firstItemTop;

				a9os_core_main.removeMenu();
			}
			

			//itemMoveLayer. MOVE LAYER
			var layerLeft = interface.global.x - interface.global.start.x + newItem.firstItemLeft + filesContainerPosition.left - vfFilesContainer.scrollLeft;
			var layerTop =  interface.global.y - interface.global.start.y + newItem.firstItemTop + filesContainerPosition.top - vfFilesContainer.scrollTop;
			itemMoveLayer.style.left = layerLeft;
			itemMoveLayer.style.top = layerTop;


			itemMoveLayer.interface = interface;
			if (destinyMatchTimeout) return;
			destinyMatchTimeout = setInterval((itemMoveLayer) => { //SET INTERVAL!!

				//destinyMatchTimeout = false;
				interface = itemMoveLayer.interface;

				//destiny detection
				itemMoveLayer.style.visibility = "hidden";
				var arrDropPath = document.elementsFromPoint(interface.global.x, interface.global.y);
				itemMoveLayer.style.visibility = "visible";

				clearDragovers();

				//drop search *[data-vf-drop-area!=false]
				var dropOver = false; 
				for (var i = 0 ; i < arrDropPath.length ; i++) {
					var currPath = arrDropPath[i];

					if (currPath.classList.contains("window")) break;

					if (currPath.hasAttribute("data-vf-drop-area") && currPath.getAttribute("data-vf-drop-area") != "false") {
						clearDragovers();
						currPath.classList.add("dragover");
						itemMoveLayer.classList.add("dropover");
						dropOver = true;
						break;
					}
				}

				if (!dropOver) {
					itemMoveLayer.classList.remove("dropover");
				}
				////////

				//deteccion cambio de ventana
				for (var i = 0 ; i < arrDropPath.length ; i++) {
					var currPath = arrDropPath[i];

					if (currPath.classList.contains("window")) break;
					
					if (currPath.hasAttribute("data-vf-drop-area") && currPath.getAttribute("data-vf-drop-area") != "false") {
						var wind0wToSelect = currPath.goToParentClass("window");
						if (wind0wToSelect) {
							if (!wind0wToSelect.classList.contains("top-window")) a9os_core_main.selectWindow(wind0wToSelect);
							break;
						}
					}
				}

				//via taskbar item
				for (var i = 0 ; i < arrDropPath.length ; i++) {
					var currPath = arrDropPath[i];
					if (currPath.matches(".item[data-taskbar-item-id]")) {
						var wind0wToSelect = a9os_core_main.component.querySelector(".window[data-taskbar-item-id='"+currPath.getAttribute("data-taskbar-item-id")+"']");
						if (wind0wToSelect) {
								a9os_core_main.selectWindow(wind0wToSelect);
							break;
						}
					}
				}
				/////////

			}, 100, itemMoveLayer);

		}, (event, item, vfFilesContainer) => {
			var itemMoveLayer = a9os_main.querySelector(".item-move-layer");
			var dragDest = a9os_core_main.component.querySelector(".dragover");
			var arrMoveHideItems = vfFilesContainer.querySelectorAll(".item.move-hide");

			if (dragDest && dragDest.hasAttribute("data-vf-drop-area") && dragDest.getAttribute("data-vf-drop-area") != "false") {
				var fileObserverId = dragDest.getAttribute("data-vf-drop-area");

				if (fileObserverId != "true") {
					var destComponent = dragDest.goToParentClass("component", "cmp");
					a9os_app_vf_main.fileHandle.openByDropArea(destComponent, fileObserverId, itemMoveLayer);

					self.unselectItems(vfFilesContainer);
				} else {
					itemMoveLayer.dragDest = dragDest;

					var arrDropMenu = [];

					if (dragDest.hasAttribute("data-saveas-window") || dragDest.hasAttribute("data-open-window")) {
						arrDropMenu.push({
							name : "Abrir ruta aquí",
							action : "[a9os_app_vf_main].saveasOpenPathInWindow",
							data : dragDest.goToParentClass("window").getAttribute("data-taskbar-item-id")
						});
						arrDropMenu.push("separator");
					}

					if (dragDest.getAttribute("data-path") != itemMoveLayer.getAttribute("data-path")) {
						arrDropMenu.push({
							name : "Copiar aquí",
							action : "[a9os_app_vf_main].copyMove.fromMoveLayer",
							data : "copy"
						});
						arrDropMenu.push({
							name : "Mover aquí",
							action : "[a9os_app_vf_main].copyMove.fromMoveLayer",
							data : "move"
						});
						arrDropMenu.push("separator");
						arrDropMenu.push({
							name : "Cancelar"
						});
					}

					if (arrDropMenu.length > 0) {					
						itemMoveLayer.setAttribute("data-menu-r", JSON.stringify(arrDropMenu));
						a9os_core_main.showMenuR(itemMoveLayer, event);
					}
				}
			}

			if (itemMoveLayer) {			
				itemMoveLayer.classList.add("closed");
				setTimeout((itemMoveLayer) => {
					a9os_main.removeChild(itemMoveLayer);
				}, 10, itemMoveLayer);
			}

			for (var i = 0 ; i < arrMoveHideItems.length ; i++){
				arrMoveHideItems[i].classList.remove("move-hide");
				if (arrMoveHideItems[i].getAttribute("data-type") == "folder") arrMoveHideItems[i].setAttribute("data-vf-drop-area", true);
			}


			filesContainerPosition = false;
			clearDragovers();
			
			if (destinyMatchTimeout) {
				clearInterval(destinyMatchTimeout);
				destinyMatchTimeout = false;
			}

			self.unselectItems(vfFilesContainer);
			vfFilesContainer.setAttribute("data-vf-drop-area", true);
		}, vfFilesContainer);
		//////////


		function clearDragovers() {
			
			var arrDragovers = a9os_core_main.component.querySelectorAll(".dragover");
			for (var i = 0 ; i < arrDragovers.length ; i++) {
				arrDragovers[i].classList.remove("dragover");
			}
		}
}

a9os_app_vf_desktop.folder.updateDB = (path, baseComponent) => {
	path = a9os_app_vf_main.sanitizePath(path);
	
	core.sendRequest(
		"vf/update",
		{ path : path },
		{
			fn : (response, baseComponent) => {
				//console.log(response, baseComponent);
				a9os_app_vf_desktop.folder.update(response, baseComponent);

			},
			args : {
				response : false,
				baseComponent : baseComponent
			}
		},
		false,
		true
	)
}

a9os_app_vf_desktop.folder.update = (responseData, baseComponent) => {
	if (baseComponent.querySelector(".vf-files-container").getAttribute("data-path") != responseData.path) return;

	for (var i in responseData.files){
		var currFile = responseData.files[i];

		var currModifItem = baseComponent.querySelector(".vf-files-container .item[data-path='"+a9os_app_vf_main.escapeFilenameForQS(currFile.path)+"']");
		if (!currModifItem){
			continue;
		}
		currModifItem.setAttribute("data-id", currFile.id);

		if (currFile.type == "file"){
			currModifItem.setAttribute("data-hash", currFile.hash);
			if (currFile.preview_url){
				currModifItem.querySelector(".icon").style.backgroundImage = "url("+currFile.preview_url+")";
			}
		}
	}
}

a9os_app_vf_desktop.folder.delete = (event, item) => {
	a9os_app_vf_desktop.file.delete(event, item);
}

a9os_app_vf_desktop.folder.rename = (event, item) => {
	a9os_app_vf_desktop.file.rename(event, item, a9os_app_vf_desktop.component);
}

a9os_app_vf_desktop.folder.new = (event, item, component, isFile) => {
	var component = component||a9os_app_vf_desktop.component;

	var vfFilesContainer = component.querySelector(".vf-files-container");
	var parentPath = vfFilesContainer.getAttribute("data-path");


	var newItem = component.querySelector(".templates .item").cloneNode(true);
	newItem.classList.add("new-item-rename");

	var fileType = (isFile)?"file":"folder";

	if (fileType == "folder") {			
		newItem.querySelector(".icon").classList.add("type-folder");
		newItem.querySelector(".name").textContent = "Nueva Carpeta";
		newItem.setAttribute("data-type", "folder");
	} else {
		newItem.querySelector(".icon").classList.add("type-file");
		newItem.querySelector(".name").textContent = "Nuevo archivo.txt";
		newItem.setAttribute("data-type", "file");
	}

	newItem.setAttribute("data-path", parentPath);

	if (newItem.querySelector(".size")) newItem.removeChild(newItem.querySelector(".size"));
	if (newItem.querySelector(".rate")) newItem.removeChild(newItem.querySelector(".rate"));


	vfFilesContainer.insertBefore(newItem, vfFilesContainer.firstChild);
	vfFilesContainer.scrollTop = 0;

	a9os_app_vf_desktop.file.rename(event, newItem, component, true);
}

a9os_app_vf_desktop.folder.download = (event, item) => {
	a9os_app_vf_desktop.file.download(event, item);
}



a9os_app_vf_desktop.selectItem = (item, preventCount) => {
	item.classList.add("selected");
	item.classList.remove("temp-unselected");


	//selection detail
	if (preventCount) return;
	var vfFilesContainer = item.goToParentClass("vf-files-container");
	var selectionDetail = vfFilesContainer.parentElement.querySelector(".selection-detail");
	if (selectionDetail) {
		selectionDetail.classList.add("show");

		var arrSelectedItems = vfFilesContainer.querySelectorAll(".item.selected");

		var qtyFiles = 0;
		var qtyFolders = 0;
		var filesTotalSize = 0;
		for (var i = 0 ; i < arrSelectedItems.length ; i++) {
			var currSelectedItem = arrSelectedItems[i];
			if (currSelectedItem.getAttribute("data-type") == "file") {
				qtyFiles++;
				filesTotalSize += parseInt(currSelectedItem.querySelector(".size").getAttribute("data-size"));
			} else {
				qtyFolders++;
			}
		}

		if (filesTotalSize == 0) {
			selectionDetail.querySelector(".size-lbl").classList.add("hide");
		} else {
			selectionDetail.querySelector(".size-lbl").classList.remove("hide");
		}

		if (qtyFolders + qtyFiles > 1) {
			selectionDetail.querySelector(".s").classList.remove("hide");
		} else {
			selectionDetail.querySelector(".s").classList.add("hide");
		}

		selectionDetail.querySelector(".qty").textContent = qtyFolders + qtyFiles;
		selectionDetail.querySelector(".size").textContent = a9os_app_vf_main.convertSize(filesTotalSize);
	}
	//////////////
}

a9os_app_vf_desktop.unselectItem = (item) => {
	item.classList.remove("selected");
	item.classList.remove("expand");
	item.classList.remove("temp-selected");
	item.classList.remove("temp-unselected");

	var vfFilesContainer = item.goToParentClass("vf-files-container");
	if (vfFilesContainer && vfFilesContainer.querySelectorAll(".item.selected").length == 0) {
		var vfFilesContainer = item.goToParentClass("vf-files-container");
		var selectionDetail = vfFilesContainer.parentElement.querySelector(".selection-detail");
		if (selectionDetail) {
			selectionDetail.classList.remove("show");
		}
	}

}

a9os_app_vf_desktop.unselectItems = (vfFilesContainer) => {
	vfFilesContainer.querySelectorAll(".item.selected, .item.expand, .item.temp-unselected").forEach((item) => {
		self.unselectItem(item);
	});
}

a9os_app_vf_desktop.selectAllItems = (vfFilesContainer) => {
	vfFilesContainer.querySelectorAll(".item").forEach((item) => {
		self.selectItem(item, true);
	});
	self.selectItem(vfFilesContainer.querySelector(".item"));
}

a9os_app_vf_desktop.keyboardShortcuts = {};
a9os_app_vf_desktop.keyboardShortcuts.get = (vfFilesContainer) => {
	
	var arrShortcuts = [];
	arrShortcuts.push({
		shortcut : ["f2"],
		action : {
			fn : self.keyboardShortcuts.rename,
			args : {
				vfFilesContainer : vfFilesContainer
			}
		}
	});

	arrShortcuts.push({
		shortcut : ["del"],
		action : {
			fn : self.keyboardShortcuts.delete,
			args : {
				vfFilesContainer : vfFilesContainer
			}
		}
	});

	arrShortcuts.push({
		shortcut : ["enter"],
		action : {
			fn : self.keyboardShortcuts.enter,
			args : {
				vfFilesContainer : vfFilesContainer
			}
		}
	});

	arrShortcuts.push({
		shortcut : ["ctrl", "c"],
		action : {
			fn : self.fileClipboard.shortcutToClipboard,
			args : {
				vfFilesContainer : vfFilesContainer,
				type : "copy"
			}
		}
	});
	arrShortcuts.push({
		shortcut : ["ctrl", "x"],
		action : {
			fn : self.fileClipboard.shortcutToClipboard,
			args : {
				vfFilesContainer : vfFilesContainer,
				type : "cut"
			}
		}
	});
	arrShortcuts.push({
		shortcut : ["ctrl", "v"],
		action : {
			fn : self.fileClipboard.shortcutToClipboard,
			args : {
				vfFilesContainer : vfFilesContainer,
				type : "paste"
			}
		}
	});

	arrShortcuts.push({
		shortcut : ["ctrl", "a"],
		action : {
			fn : self.selectAllItems,
			args : {
				vfFilesContainer : vfFilesContainer
			}
		}
	});

	return arrShortcuts;
}
a9os_app_vf_desktop.keyboardShortcuts.rename = (vfFilesContainer) => {
	var firstSelectedItem = vfFilesContainer.querySelector(".item.selected");

	if (!firstSelectedItem) return false;
	var itemType = firstSelectedItem.getAttribute("data-type");
	self[itemType].rename(false, firstSelectedItem);
}
a9os_app_vf_desktop.keyboardShortcuts.delete = (vfFilesContainer) => {
	var firstSelectedItem = vfFilesContainer.querySelector(".item.selected");

	if (!firstSelectedItem) return false;
	var itemType = firstSelectedItem.getAttribute("data-type");
	self[itemType].delete(false, firstSelectedItem);
}
a9os_app_vf_desktop.keyboardShortcuts.enter = (vfFilesContainer) => {
	var firstSelectedItem = vfFilesContainer.querySelector(".item.selected, .item:focus");

	if (!firstSelectedItem) return false;
	if (firstSelectedItem.classList.contains("edit")) return false;
	var itemType = firstSelectedItem.getAttribute("data-type");
	
	if (itemType == "folder") firstSelectedItem.click();
	else {
		var dblClickEvent = document.createEvent("MouseEvents")
		dblClickEvent.initEvent("dblclick", true, true);
		firstSelectedItem.dispatchEvent(dblClickEvent);
	}
}

a9os_app_vf_desktop.desktopScroll = {};
a9os_app_vf_desktop.desktopScroll.init = () => {
	var desktopScroll = self.component.querySelector(".desktop-scroll");
	var desktopScrollBar = desktopScroll.querySelector(".bar");
	var vfFilesContainer = self.component.querySelector(".vf-files-container");
	desktopScrollBar.transformXValue = 0;

	var localTransformXValue = 0;
	var movingFromBar = false;
	a9os_core_main.moveEvent.add(desktopScrollBar, (interface, desktopScrollBar) => {
		if (interface.buttons != 1) return ;

		localTransformXValue = interface.element.x-interface.element.start.x+desktopScrollBar.transformXValue;
		if (localTransformXValue < 0){
			localTransformXValue = 0;
		}
		if (localTransformXValue > (desktopScroll.offsetWidth - desktopScrollBar.offsetWidth)) {
			localTransformXValue = desktopScroll.offsetWidth - desktopScrollBar.offsetWidth;
		}

		desktopScrollBar.style.transform = "translateX("+localTransformXValue+"px)";



		var barMovePercent = 100*localTransformXValue/(desktopScroll.offsetWidth - desktopScrollBar.offsetWidth);
		vfFilesContainer.scrollTo((vfFilesContainer.scrollWidth-vfFilesContainer.offsetWidth)*barMovePercent/100, 0);


		movingFromBar = true;
	}, (event, desktopScrollBar) => {
		desktopScrollBar.transformXValue = localTransformXValue;
		localTransformXValue = 0;
		movingFromBar = false;
	});

	a9os_core_main.addEventListener(vfFilesContainer, "scroll", (event, vfFilesContainer) => {
		if (movingFromBar) return;


		var scrolledPercent = vfFilesContainer.scrollLeft*100/(vfFilesContainer.scrollWidth-vfFilesContainer.offsetWidth);

		var scrollBarTransformPx = (desktopScroll.offsetWidth - desktopScrollBar.offsetWidth)*scrolledPercent/100;
		desktopScrollBar.style.transform = "translateX("+scrollBarTransformPx+"px)";
		desktopScrollBar.transformXValue = scrollBarTransformPx;
	});



	var timeoutP = false;
	window.addEventListener("resize", (event) => {
		if (timeoutP) {
			clearTimeout(timeoutP);
		}
		timeoutP = setTimeout((event) => {

			var desktopScroll = self.component.querySelector(".desktop-scroll");
			var vfFilesContainer = self.component.querySelector(".vf-files-container");

			var vfScrollPercent = 100/vfFilesContainer.scrollWidth*vfFilesContainer.offsetWidth;
			if (vfScrollPercent >= 100) {
				desktopScroll.classList.remove("show");
			} else {
				desktopScroll.classList.add("show");
				var desktopScrollBar = desktopScroll.querySelector(".bar");
				desktopScrollBar.style.width = vfScrollPercent+"%";

			}

			timeoutP = false;
		}, 200, event);
	});
}

a9os_app_vf_desktop.desktopScroll.checkNeed = (component) => {
	if (component != self.component) return false; //if desktop

	var vfFilesContainer = self.component.querySelector(".vf-files-container");
	var desktopScroll = component.querySelector(".desktop-scroll");

	//var vfScrollPercent = 100*vfFilesContainer.offsetWidth/vfFilesContainer.scrollWidth;
	var vfScrollPercent = Math.ceil(100/vfFilesContainer.scrollWidth*vfFilesContainer.offsetWidth);
	if (vfScrollPercent >= 100) {
		desktopScroll.classList.remove("show");
	} else {
		desktopScroll.classList.add("show");
		var desktopScrollBar = desktopScroll.querySelector(".bar");
		desktopScrollBar.style.width = vfScrollPercent+"%";
		desktopScrollBar.withPercent = vfScrollPercent;
		desktopScrollBar.style.transform = "translateX(0)";
		desktopScrollBar.transformXValue = 0;
	}
}

a9os_app_vf_desktop.fileClipboard = {};
a9os_app_vf_desktop.fileClipboard.fileList = {};
a9os_app_vf_desktop.fileClipboard.fileList.type = ""; // copy, cut
a9os_app_vf_desktop.fileClipboard.fileList.arrFiles = [];
a9os_app_vf_desktop.fileClipboard.menuToClipboard = (event, fileItem, type) => {
	var arrFileItems = [];

	if (!fileItem.classList.contains("selected")) arrFileItems.push(fileItem);

	var vfFilesContainer = fileItem.goToParentClass("vf-files-container");
	var arrSelectedItems = vfFilesContainer.querySelectorAll(".item.selected");
	for (var i = 0 ; i < arrSelectedItems.length ; i++) {
		arrFileItems.push(arrSelectedItems[i]);
	}

	var pasteDestPath = fileItem.getAttribute("data-path");
	self.fileClipboard.action(arrFileItems, type, pasteDestPath);
}
a9os_app_vf_desktop.fileClipboard.vfContainerToClipboard = (event, vfFilesContainer, type) => {
	var pasteDestPath = vfFilesContainer.getAttribute("data-path");
	self.fileClipboard.action([], type, pasteDestPath);
}
a9os_app_vf_desktop.fileClipboard.clearFileList = () => {
	self.fileClipboard.fileList.type = "";
	for (var i = 0 ; i < self.fileClipboard.fileList.arrFiles.length ; i++) {
		var currItem = self.fileClipboard.fileList.arrFiles[i];
		currItem.classList.remove("cutted");
	}
	self.fileClipboard.fileList.arrFiles = [];
}
a9os_app_vf_desktop.fileClipboard.action = (arrFileItems, type, pasteDestPath) => {
	if (type == "copy" || type == "cut") {
		self.fileClipboard.clearFileList();

		self.fileClipboard.fileList.type = type;

		for (var i = 0 ; i < arrFileItems.length ; i++) {

			self.fileClipboard.fileList.arrFiles.push(arrFileItems[i]);
			if (type == "cut") arrFileItems[i].classList.add("cutted");
		}
	}
	if (type == "paste") {
		if (self.fileClipboard.fileList.arrFiles.length == 0) return;
		var copyModeDest = "";
		if (self.fileClipboard.fileList.type == "copy") copyModeDest = "copy";
		if (self.fileClipboard.fileList.type == "cut") copyModeDest = "move";

		a9os_app_vf_main.copyMove.fromFileClipboard(self.fileClipboard.fileList.arrFiles, copyModeDest, pasteDestPath);
		self.fileClipboard.clearFileList();
	}
}
a9os_app_vf_desktop.fileClipboard.menuDynamicTrigger = (itemData, actionElement) => {
	if (itemData.data == "copy") {
		if (actionElement.classList.contains("vf-files-container")) itemData.remove = true;
	}
	if (itemData.data == "cut") {
		if (actionElement.classList.contains("vf-files-container")) itemData.remove = true;
	}
	if (itemData.data == "paste") {
		if (self.fileClipboard.fileList.arrFiles.length == 0) itemData.remove = true;
		if (actionElement.getAttribute("data-type") == "file") itemData.remove = true;
	}
	
	return itemData;
}
a9os_app_vf_desktop.fileClipboard.shortcutToClipboard = (vfFilesContainer, type) => {
	var arrFileItems = [];
	if (type == "cut" || type == "copy") {	

		var arrSelectedItems = vfFilesContainer.querySelectorAll(".item.selected");
		for (var i = 0 ; i < arrSelectedItems.length ; i++) {
			arrFileItems.push(arrSelectedItems[i]);
		}
		if (arrFileItems.length == 0) return;
	}

	self.fileClipboard.action(arrFileItems, type, vfFilesContainer.getAttribute("data-path"));
}