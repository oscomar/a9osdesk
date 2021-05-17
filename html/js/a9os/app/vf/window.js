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
a9os_app_vf_window.main = (data) => {
	
	self._selectWindow();

	self.addWindowListeners();

	var vfFilesContainer = self.component.querySelector(".vf-files-container");
	vfFilesContainer.setAttribute("data-path", self.arrHashData.folder||"/");

	if (self.arrHashData.mode != "saveas") a9os_app_vf_desktop.squareSelection.attach(vfFilesContainer);
	
	a9os_app_vf_desktop.attachDragFileUpload(vfFilesContainer);
	var arrWindowShortcuts = a9os_app_vf_desktop.keyboardShortcuts.get(vfFilesContainer);

	self.folder.get(vfFilesContainer.getAttribute("data-path"));

	if (self.arrHashData.mode == "saveas") {
		self.showSaveInput(self.file.sendToOpensaveCci);
		arrWindowShortcuts.push({
			shortcut : ["esc"],
			action : {
				fn : a9os_core_window.close,
				args : {}
			}
		});

		vfFilesContainer.setAttribute("data-saveas-window", true);
	}
	if (self.arrHashData.mode == "open") {
		vfFilesContainer.setAttribute("data-open-window", true);
	} 


	var arrWinListMenu = self.winListMenu.create(data.bookmarks, data.arrSources);

	if (data.window) a9os_core_window.processWindowData(data, arrWindowShortcuts, arrWinListMenu);
	self.changeWindowTitle();

	self.bookmark.appendSaved(data.bookmarks);

	self.bookmark.appendMoveEvent();
	self.addressBar.init();

	self.sourcesList.init(data.arrSources);
}

a9os_app_vf_window._selectWindow = () => {
	
	self.arrHashData = core.link.hash.get();
	self.mainBar = self.component.querySelector(".main-bar");
	self.leftPanel = self.component.querySelector(".left");
}

a9os_app_vf_window._closeWindow = () => {
	
	a9os_app_vf_main.folderObserver.remove(self.component);
	if (self.arrHashData.cancelCci) a9os_core_main.windowCrossCallback.execute(self.arrHashData.cancelCci);
	return true;
}

a9os_app_vf_window.addWindowListeners = () => {
	
	a9os_core_main.addEventListener(self.mainBar.querySelector(".main-menu"), "click", self.panel.show);
	a9os_core_main.addEventListener(self.component.querySelector(".right"), "click", self.panel.hide);
	a9os_core_main.addEventListener(self.component.querySelector(".right"), "touchstart", self.panel.hide);

	a9os_core_main.addEventListener(self.mainBar.querySelector(".back"), "click", self.folder.back);
	a9os_core_main.addEventListener(self.mainBar.querySelector(".address-bar"), "keyup", self.enterAddress);
	a9os_core_main.addEventListener(self.leftPanel.querySelector(".bottom .search-input"), "keyup", self.searchItems)

	a9os_core_main.addEventListener(self.component.querySelector(".vf-files-container"), "click", (event, elem) => {
		// event.stopPropagation();
		if (!elem.querySelector(".square-selection")) a9os_app_vf_desktop.unselectItems(elem);
		self.addressBar.switchToButtons(true); 
	});

	a9os_core_main.addEventListener(self.leftPanel.querySelector(".action-buttons .new-folder"), "click", (event, button) => {
		if (button.classList.contains("disabled")) return;
		self.folder.new(event, button);	
	});

	a9os_core_main.addEventListener(self.leftPanel.querySelector(".action-buttons .update"), "click", (event, button) => {
		if (button.classList.contains("disabled")) return;
		self.refresh(event, button);
	});
	a9os_core_main.addEventListener(
		self.leftPanel.querySelector(".left .item.alter-list"), 
		"click", 
		(event, button, vfFilesContainer) => {
			if (button.classList.contains("disabled")) return;
			self.changeListType(event, button, vfFilesContainer);
		},
		self.component.querySelector(".vf-files-container")
	);

	var wind0w = self.component.goToParentClass("window");

	a9os_core_main.addEventListener(wind0w, "wind0waltermobile", (event, wind0w) => {
		self.changeListType(event, wind0w.querySelector(".left .item.alter-list"), wind0w.querySelector(".vf-files-container"))
	});
}

a9os_app_vf_window.changeWindowTitle = () => {
	
	if (self.arrHashData.mode) {
		var dialogTitle = "";
		if (self.arrHashData.mode == "open") {
			dialogTitle = "Abrir";
		} else if (self.arrHashData.mode == "saveas") {
			dialogTitle = "Guardar como";
		} else {
			console.error("mode not exists: "+self.arrHashData.mode);
		}
		var windowData = a9os_core_window.getWindowData();
		var arrWindowTitle = windowData.title.split(" - ");
		var arrNewTitle = [
			arrWindowTitle[0],
			dialogTitle,
			arrWindowTitle[1]
		];

		a9os_core_window.updateWindowData({ title : arrNewTitle.join(" - ") });
	}

}

a9os_app_vf_window.changeListType = (event, item, vfFilesContainer) => {
	
	if (item.classList.contains("active")) {
		item.classList.remove("active");
		vfFilesContainer.classList.remove("list-mode");
		item.querySelector("span").textContent = "Modo lista";
	} else {
		item.classList.add("active");
		vfFilesContainer.classList.add("list-mode");
		item.querySelector("span").textContent = "Modo cuadrícula";
	}
}


a9os_app_vf_window.refresh = (component) => {
	
	if (component instanceof Event) component = self.component;

	var component = component||self.component;

	self.folder.get(
		component.querySelector(".vf-files-container").getAttribute("data-path"),
		false,
		component
	);
}

a9os_app_vf_window.file = {};
a9os_app_vf_window.file.delete = a9os_app_vf_desktop.file.delete;
a9os_app_vf_window.file.upload = a9os_app_vf_desktop.file.upload;
a9os_app_vf_window.file.saveas = {};

a9os_app_vf_window.file.saveas.select = (event, element) => {
	
	self.component.querySelector(".saveas-input input").value = element.getAttribute("data-name");
	self.component.querySelector(".saveas-input .btn").setAttribute("data-filename", element.getAttribute("data-name"));
	self.file.select(event, element);
}

a9os_app_vf_window.file.saveas.checkOverwriteFile = (event, item) => {
	
	var okCallback = self.file.sendToOpensaveCci;
	var newPath = item.getAttribute("data-path");
	var ifFileExists = self.component.querySelector(".vf-files-container .item[data-path='"+a9os_app_vf_main.escapeFilenameForQS(newPath)+"']");
	if (!ifFileExists) {
		return okCallback(event, item, self.component);
	} else {
		var okCallbackCCI = a9os_core_main.windowCrossCallback.add({
			fn : okCallback,
			args : {
				event : event,
				item : item,
				component : self.component
			}
		}, self.component);

		var cancelCCI = a9os_core_main.windowCrossCallback.add({
			fn : (component, event, item) => {
				a9os_core_main.selectWindow(component.goToParentClass("window", "cmp"));
				component.querySelector(".saveas-input .btn").removeAttribute("data-path");
				component.querySelector(".saveas-input input").value = "";
			},
			args : {
				component : self.component,
				event : event,
				item : item
			}
		}, self.component);

		core.link.push("/vf/dialog", {
				path : newPath, 
				actions : {
					yes : {
						name : "Si",
						cci : okCallbackCCI
					}
				},
				mode : "confirmOverwrite",
				cancelAction : cancelCCI
			}
		);
	}
}

a9os_app_vf_window.file.select = (event, element) => {
	
	if (self.component.classList.contains("side-open")) return;
	event.stopPropagation();
	if (!element.classList.contains("expand")){
		a9os_app_vf_desktop.unselectItems(self.component.querySelector(".vf-files-container"));
		element.classList.add("expand");
	}
}

a9os_app_vf_window.file.open = a9os_app_vf_desktop.file.open;

a9os_app_vf_window.file.openWith = (event, item) => {
	
	a9os_app_vf_desktop.file.openWith(event, item);
}

a9os_app_vf_window.file.sendToOpensaveCci = (event, item, component) => {
	
	a9os_core_main.selectWindow(component);

	var crossCallbackId = self.arrHashData.cci;

	a9os_core_main.windowCrossCallback.execute(crossCallbackId, {
		path : item.getAttribute("data-path")
	});

	a9os_core_main.removeWindow(component); // prevents _closeWindow

}

a9os_app_vf_window.file.rename = (event, item) => {
	
	a9os_app_vf_desktop.file.rename(event, item, self.component);
}

a9os_app_vf_window.file.new = (event, item) => {
	
	a9os_app_vf_desktop.file.new(event, item, self.component, true);
}

a9os_app_vf_window.file.download = a9os_app_vf_desktop.file.download;

a9os_app_vf_window.folder = {};
a9os_app_vf_window.folder.get = (path, callback, component) => {
	
	var component = component||self.component;

	if (component.folderBoolGet == true){
		return;
	}
	component.folderBoolGet = true;

	path = a9os_app_vf_main.sanitizePath(path);

	core.link.hash.set({folder : path});

	self.addressBar.switchToButtons(); 



	core.sendRequest(
		"/vf/folder",
		{
			path : path
		},
		{
			fn : (response, component, callback) => {
				component.folderBoolGet = false;
				
				if (response.error) {
					a9os_app_vf_main.catchBackendError(response.error);
					return false;
				}


				var arrConfig = { 
					file : {
						click : self.file.select, 
						dblclick : a9os_app_vf_desktop.file.open 
					},
					folder : {
						click : self.folder.change
					}
				};

				var arrModeConfig = {};
				if (self.arrHashData.config) {
					arrModeConfig = self.arrHashData.config;
					response.files = a9os_app_vf_main.fileHandle.filterByExtension(response.files, arrModeConfig.fileExtensions, true);
				}
				if (self.arrHashData.mode == "open") {
					if (arrModeConfig.qty == "simple") {
						if (arrModeConfig.type == "file") {


							var arrConfig = { 
								file : {
									click : self.file.select, 
									dblclick : self.file.sendToOpensaveCci 
								},
								folder : {
									click : self.folder.change
								}
							};

						} else if (arrModeConfig.type == "folder") {

							var arrConfig = { 
								file : {
									click : self.file.select
								},
								folder : {
									click : self.folder.change,
									dblclick : self.folder.sendToOpensaveCci
								}
							};

						}
					} else if (arrModeConfig.qty == "multiple") {
						//SELECCIÓN  de archivos o carpetas
					}
				} else if (self.arrHashData.mode == "saveas") { 
					var arrConfig = { 
						file : {
							click : self.file.saveas.select, 
							dblclick : self.file.saveas.checkOverwriteFile 
						},
						folder : {
							click : self.folder.change
						}
					};
				}

				a9os_app_vf_desktop.folder.show(response.path, response.files, component,
					arrConfig, 
					{
						fn : (component, response, callback) => {
							self.leftPanel.querySelector(".bottom .search-input").value = "";

							var arrActionButtons = self.leftPanel.querySelectorAll(".action-buttons .item");
							for (var i = 0 ; i < arrActionButtons.length ; i++) {
								arrActionButtons[i].classList.remove("disabled");
							}
							if (response.folderAddons) self.folderAddons.process(component, response.folderAddons);

							if (callback) {
								if (typeof callback == "function") callback();
								else core.callCallback(callback, {
									component : component
								});
							}

						},
						args : {
							component : component,
							response : response,
							callback : callback
						}
					}
				);

				self.addressBar.setValue(component, response.path);

				component.querySelector(".saveas-input .btn").setAttribute("data-parent-path", response.path);
				a9os_app_vf_main.folderObserver.add(component, path, {
					fn : self.refresh,
					args : {
						component : component
					}
				});

				if (response.folderNotExists) {
					self.folder.showNotExists(component);
				}

				if(response.postUpdate){
					a9os_app_vf_desktop.folder.updateDB(response.path, component);
				}

			},
			args : {
				response : false,
				component : component,
				callback : callback
			}
		}
	);
}
a9os_app_vf_window.folder.showNotExists = (component) => {
	var component = component||self.component;

	var notExistTemplate = component.querySelector(".templates .not-exist-folder").cloneNode(true);
	component.querySelector(".vf-files-container").innerHTML = "";
	component.querySelector(".vf-files-container").appendChild(notExistTemplate);

	var createFolderBtn = self.component.querySelector(".vf-files-container .not-exist-folder .btn");
	a9os_core_main.addEventListener(createFolderBtn, "click", self.folder.createFromNotExists, component);
}
a9os_app_vf_window.folder.createFromNotExists = (event, button, component) => {
	core.sendRequest(
		"/vf/newitem",
		{
			type : "folder",
			newPath : component.querySelector(".vf-files-container").getAttribute("data-path"),
			force : true,
		},
		{
			fn : (response, component) => {
				self.refresh(component);
			},
			args : {
				response : false,
				component : component
			}
		}
	);
}

a9os_app_vf_window.folder.change = (event, elem) => { //folder.get by item attr data-path
	if (self.component.classList.contains("side-open")) return;
	self.folder.get(elem.getAttribute("data-path"));
}

a9os_app_vf_window.folder.back = () => {
	
	var actualPath = self.component.querySelector(".vf-files-container").getAttribute("data-path");
	var arrPath = actualPath.split("/");
	if (arrPath.length > 2){	
		var finalPath = "";
		for (var i = 0 ; i < arrPath.length-2 ; i++){
			finalPath = finalPath + arrPath[i] + "/";
		}
		self.addressBar.setValue(self.component, finalPath);
		self.folder.get(finalPath, false);
	}
}

a9os_app_vf_window.folder.open = a9os_app_vf_desktop.folder.open;

a9os_app_vf_window.folder.delete = a9os_app_vf_desktop.file.delete;

a9os_app_vf_window.folder.rename = (event, item) => {
	a9os_app_vf_desktop.file.rename(event, item, self.component);
};

a9os_app_vf_window.folder.new = (event, item) => {
	a9os_app_vf_desktop.folder.new(event, item, self.component);
}

a9os_app_vf_window.folder.download = (event, item) => {
	a9os_app_vf_desktop.folder.download(event, item);
}



a9os_app_vf_window.enterAddress = (event, elem) => {
	
	var address = elem.value;
	if (event.which == 13) {
		if (address.lastIndexOf("/") != address.length-1){
			address = address+"/";
			elem.value = address;
		}
		self.folder.get(address, false);
	}

	if (event.which == 27) {
		self.addressBar.switchToButtons(true);
	}
}


a9os_app_vf_window.searchItems = (event, element) => {
	
	var searchElement = self.leftPanel.querySelector(".bottom .search-input");
	var searchStr = searchElement.value;
	if (event && event.which == 8 && self.component.boolSearchUsed == false){
		self.folder.back();
	}

	searchStr = searchStr.trim();
	var arrFileItems = self.component.querySelectorAll(".vf-files-container .item");
	var firstResult = arrFileItems[0];

	for (var i = 0 ; i < arrFileItems.length ; i++){
		arrFileItems[i].classList.remove("hide");
	}

	if (searchStr != ""){
		 self.component.boolSearchUsed = true;
		for (var i = 0 ; i < arrFileItems.length ; i++){
			if (arrFileItems[i].querySelector(".name").textContent.toLowerCase().indexOf(searchStr.toLowerCase()) == -1){
				arrFileItems[i].classList.add("hide");
			} else {
				if (firstResult == arrFileItems[0]){
					firstResult = arrFileItems[i];
				}
			}
		}
	}
	if (event){
		if (event.which == 13){
			self.folder.change({}, firstResult);
		}
	}
}



a9os_app_vf_window.bookmark = {};

a9os_app_vf_window.bookmark.addItem = (event, item, preventSaveItems) => {
	
	var itemsContainer = self.leftPanel.querySelector(".bookmark-menu .items");
	itemsContainer.classList.remove("empty");
	
	var newPath = item.getAttribute("data-path");
	var newName = item.getAttribute("data-name");

	//if entry already exists
	var arrItems = itemsContainer.querySelectorAll(".item");
	for (var i = 0 ; i < arrItems.length ; i++){
		if (arrItems[i].getAttribute("data-path") == newPath) return false;
	}
	///


	var newItem = document.createElement("div");
	newItem.classList.add("item");
	newItem.setAttribute("data-path", newPath);
	newItem.setAttribute("data-type", "folder"); //add draganddrop support
	newItem.setAttribute("data-name", newName);
	newItem.setAttribute("title", newPath);
	newItem.textContent = newName;
	newItem.setAttribute("data-menu-r", JSON.stringify([
		{
			name : "Abrir en nueva ventana",
			action : "bookmark.openInNewWindow"
		},
		{
			name : "Quitar",
			action : "bookmark.removeItem"
		}
	]));
	newItem.setAttribute("data-vf-drop-area", true);

	a9os_core_main.addEventListener(newItem, "click", (event, newItem) => {
		self.component.classList.remove("side-open");
		self.folder.change(event, newItem);
	});
	
	itemsContainer.appendChild(newItem);

	if (!preventSaveItems) self.bookmark.saveItems();
}

a9os_app_vf_window.bookmark.removeItem = (event, item) => {
	var bookmarksContainer = item.parentElement;
	bookmarksContainer.removeChild(item);
	self.bookmark.saveItems();

	if (!bookmarksContainer.querySelector(".item")) bookmarksContainer.classList.add("empty");
}
a9os_app_vf_window.bookmark.openInNewWindow = (event, item) => {
	core.link.push("/vf", { folder : item.getAttribute("data-path") });
}
a9os_app_vf_window.bookmark.saveItems = () => {
	if (self.component.updateBackendTimeout) {
		clearTimeout(self.component.updateBackendTimeout);
		self.component.updateBackendTimeout = false;
	}

	self.component.updateBackendTimeout = setTimeout(() => {
		var arrBookmarks = self.component.querySelectorAll(".left .bookmark-menu .items .item");

		var arrItemsToBackend = {};

		for (var i = 0 ; i < arrBookmarks.length ; i++) {
			var currBookmark = arrBookmarks[i];
			arrItemsToBackend[currBookmark.getAttribute("data-path")] = {
				position : i
			};
		}

		core.sendRequest(
			"/vf/bookmarks/update",
			{
				items : arrItemsToBackend
			},
			false,
			false,
			true
		);
	}, 2000);
}

a9os_app_vf_window.bookmark.appendSaved = (arrBookmarks) => {
	for (var i = 0 ; i < arrBookmarks.length ; i++) {
		var currBookmark = arrBookmarks[i];

		var tmpItem = document.createElement("div");
		tmpItem.setAttribute("data-path", currBookmark.path);
		tmpItem.setAttribute("data-name", a9os_core_main.splitFilePath(currBookmark.path)[1]);

		self.bookmark.addItem(false, tmpItem, true);
	}
	
	var bookmarksContainer = self.component.querySelector(".left .bookmark-menu .items");
	if (!bookmarksContainer.querySelector(".item")) bookmarksContainer.classList.add("empty");
}
a9os_app_vf_window.bookmark.appendMoveEvent = () => {
	var bookmarksContainer = self.component.querySelector(".left .bookmark-menu .items");

	var selectedItem = false;
	a9os_core_main.moveEvent.add(bookmarksContainer, (interface, bookmarksContainer) => {

		var arrItems = bookmarksContainer.querySelectorAll(".item");
		if (arrItems.length == 0) return;
		if (arrItems[0].offsetTop > interface.element.start.y) return;

		if (!selectedItem) {
			for (var i = 0 ; i < arrItems.length ; i++) {
				var currItem = arrItems[i];
				if (interface.element.start.y > currItem.offsetTop && interface.element.start.y < currItem.offsetTop + currItem.offsetHeight) {
					selectedItem = currItem;
					break;
				}
			}

			var tmpItemDragged = selectedItem.cloneNode(true);
			tmpItemDragged.classList.add("tmp-dragger");
			bookmarksContainer.appendChild(tmpItemDragged)
		}

		var tmpItemDragged = bookmarksContainer.querySelector(".tmp-dragger");
		tmpItemDragged.style.top = interface.element.y - tmpItemDragged.offsetHeight/2;
		tmpItemDragged.style.left = interface.element.x - tmpItemDragged.offsetWidth/2;

		var moveDivisor = bookmarksContainer.querySelector(".move-divisor");
		if (!moveDivisor) {
			var moveDivisor = document.createElement("div");
			moveDivisor.classList.add("move-divisor");
			bookmarksContainer.appendChild(moveDivisor);
		}

		for (var i = 0 ; i < arrItems.length ; i++) { 
			var currItem = arrItems[i];
			var itemTopThreshold = currItem.offsetTop + currItem.offsetHeight/2;

			if (interface.element.y > itemTopThreshold) continue;
			else {
				bookmarksContainer.insertBefore(moveDivisor, currItem);
				break;
			}
		}
	}, (event, bookmarksContainer) => {
		if (!selectedItem) return;
		var moveDivisor = bookmarksContainer.querySelector(".move-divisor");
		if (moveDivisor) {
			bookmarksContainer.insertBefore(selectedItem, moveDivisor);
			bookmarksContainer.removeChild(moveDivisor);
		}

		var tmpItemDragged = bookmarksContainer.querySelector(".tmp-dragger");
		if (tmpItemDragged) bookmarksContainer.removeChild(tmpItemDragged);

		selectedItem = false;

		self.bookmark.saveItems();
	});

}



a9os_app_vf_window.updateWindowData = () => {
	
	var windowData = a9os_core_window.getWindowData();
	
	var newTitle = windowData.title;
	newTitle = newTitle.split(" - ");

	var currPath = self.component.querySelector(".vf-files-container").getAttribute("data-path").split("/");
	
	if (newTitle.length <= 1){
		newTitle = currPath[currPath.length-2]+"/ - "+newTitle[0];
	} else {
		newTitle = currPath[currPath.length-2]+"/ - "+newTitle.slice(1).join(" - ");
	}

	windowData.title = newTitle;

	a9os_core_window.updateWindowData(windowData);
}



a9os_app_vf_window.panel = {};
a9os_app_vf_window.panel.show = (event) => {
	event.stopPropagation();
	self.component.classList.add("side-open");
}

a9os_app_vf_window.panel.hide = (event) => {
	
	if (self.component.classList.contains("side-open")){
		event.stopPropagation();
		self.component.classList.remove("side-open");
	}
}



a9os_app_vf_window.showSaveInput = () => {
	var submitBtn = self.component.querySelector(".saveas-input .btn");
	var input = self.component.querySelector(".saveas-input input");

	if (input.value.trim() == "") {
		submitBtn.disabled = true;
	} else {
		submitBtn.disabled = false;
	}
	

	a9os_core_main.addEventListener(submitBtn, "click", (event, submitBtn) => {
			submitBtn.setAttribute("data-filename", input.value);

			submitBtn.setAttribute("data-path", submitBtn.getAttribute("data-parent-path")+submitBtn.getAttribute("data-filename"));
			self.file.saveas.checkOverwriteFile(event, submitBtn);
		}
	);

	a9os_core_main.addEventListener(input, "keyup", inputKeypress);

	a9os_core_main.addEventListener(input, "blur", inputExtensionAutocomplete);

	function inputKeypress(event, input) {
		submitBtn.setAttribute("data-filename",
			input.value
		);

		if (input.value.trim() == "") {
			submitBtn.disabled = true;
		} else {
			submitBtn.disabled = false;
		}

		if (event && event.which == 13) {
			event.preventDefault();
			
			inputExtensionAutocomplete(event, input);

			submitBtn.setAttribute("data-filename",
				input.value
			);

			submitBtn.setAttribute("data-path", 
				submitBtn.getAttribute("data-parent-path")+
				submitBtn.getAttribute("data-filename")
			);

			self.file.saveas.checkOverwriteFile(event, submitBtn);
		}

	}

	function inputExtensionAutocomplete(event, input) {
		var currText = input.value.trim();
		var currTypedExtension = a9os_core_main.getFileExtension(currText);
		
		var extensionSelector = self.component.querySelector(".saveas-input .extension");
		if (extensionSelector && extensionSelector.querySelector("option[value='"+currTypedExtension+"']")) {
			extensionSelector.value = currTypedExtension;
		} else {
			var tmpLength = input.value.length;
			if (tmpLength < 1) return;
			input.value = input.value + "." + extensionSelector.value.toLowerCase();
			input.setSelectionRange(tmpLength, input.value.length);
		}
	}


	//extension select
	if (self.arrHashData.config) {
		var arrModeConfig = self.arrHashData.config;
		var extensionSelector = self.component.querySelector(".saveas-input .extension");
		extensionSelector.innerHTML = "";

		if (arrModeConfig.fileExtensions) {
			for (var i = 0 ; i < arrModeConfig.fileExtensions.length ; i++){
				var currExtension = arrModeConfig.fileExtensions[i];
				extensionSelector.appendChild(new Option(currExtension, currExtension));
			}

			a9os_core_main.addEventListener(extensionSelector, "change", (event, item) => {
				var input = item.parentElement.querySelector("input");
				var inputValue = input.value;

				var currExtension = inputValue.substr(inputValue.indexOf(".")+1).trim();
				if (currExtension != "") {
					input.value = inputValue.substr(0, inputValue.indexOf("."))+"."+item.value.toLowerCase();
					input.focus();
					input.setSelectionRange(inputValue.indexOf("."), input.value.length);
				}
			});
		}
		if (arrModeConfig.fileName) {
			self.component.querySelector(".saveas-input input").value = arrModeConfig.fileName;
			inputKeypress(event, self.component.querySelector(".saveas-input input"));
		}

	}

	self.component.querySelector(".saveas-input").classList.add("show");
	self.component.querySelector(".vf-files-container").classList.add("saveas-mode");
}


a9os_app_vf_window.addressBar = {};
a9os_app_vf_window.addressBar.init = () => {
	var editButton = self.component.querySelector(".main-bar .address-bar-edit");
	a9os_core_main.addEventListener(editButton, "click", (event, editButton) => {
		if (editButton.classList.contains("to-confirm")) {
			self.addressBar.switchToButtons(); 
		} else {
			self.addressBar.switchToEdit(); 
		}
	});

	var addressBarButtons = self.component.querySelector(".address-bar-buttons");
	a9os_core_main.addEventListener(addressBarButtons, "dblclick", (event, addressBarButtons) => {
		self.addressBar.switchToEdit();
	});
}
a9os_app_vf_window.addressBar.switchToButtons = (ifCancel) => {
	var editButton = self.component.querySelector(".main-bar .address-bar-edit");
	var addressBarButtons = self.component.querySelector(".main-bar .address-bar-buttons");
	var addressBar = self.component.querySelector(".main-bar .address-bar");

	addressBar.classList.remove("show");
	addressBarButtons.classList.add("show");
	editButton.classList.remove("to-confirm");

	if (ifCancel) {
		addressBar.value = self.component.querySelector(".vf-files-container").getAttribute("data-path");
	} else {	
		var address = addressBar.value;
		if (address.lastIndexOf("/") != address.length-1){
			address = address+"/";
			addressBar.value = address;
		}
		if (address != self.component.querySelector(".vf-files-container").getAttribute("data-path")) self.folder.get(address, false);
	}

	addressBarButtons.scrollTo({
		top: 0,
		left: addressBarButtons.scrollWidth,
		behavior: 'smooth'
	});
	addressBar.disabled = true;
}
a9os_app_vf_window.addressBar.switchToEdit = () => {
	var editButton = self.component.querySelector(".main-bar .address-bar-edit");
	var addressBarButtons = self.component.querySelector(".main-bar .address-bar-buttons");
	var addressBar = self.component.querySelector(".main-bar .address-bar");

	addressBarButtons.classList.remove("show");
	addressBar.classList.add("show");
	editButton.classList.add("to-confirm");

	addressBar.scrollTo({
		top: 0,
		left: addressBar.scrollWidth,
		behavior: 'smooth'
	});
	addressBar.disabled = false;
	addressBar.focus();
}
a9os_app_vf_window.addressBar.setValue = (component, path) => {
	self.addressBar.clear(component);
	component.querySelector(".address-bar").value = path;

	var arrPath = path.split("/");

	var arrPathsAndNames = [];
	var tmpDataPathPart = "";
	for (var i = 0 ; i < arrPath.length ; i++){
		if (i == arrPath.length-1 && arrPath[i] == "") continue;
		tmpDataPathPart += arrPath[i]+"/";


		arrPathsAndNames.push({
			name : ((i==0 && arrPath[0] == "")?"/":arrPath[i]),
			path : tmpDataPathPart
		});
	}

	core.preProcess(component.querySelector(".right .main-bar .address-bar-buttons"), { arrPathsAndNames : arrPathsAndNames });

	component.querySelector(".right .main-bar .address-bar-buttons").scrollTo({
		top: 0,
		left: component.querySelector(".right .main-bar .address-bar-buttons").scrollWidth,
		behavior: 'smooth'
	});

	var arrButtons = component.querySelectorAll(".right .main-bar .address-bar-buttons .button");
	a9os_core_main.addEventListener(arrButtons, "click", self.folder.change);
}

a9os_app_vf_window.addressBar.clear = (component) => {
	component.querySelector(".right .main-bar .address-bar-buttons").innerHTML = "";
}

a9os_app_vf_window.addressBar.openInNewWindow = (event, item) => {
	core.link.push("/vf", { folder : item.getAttribute("data-path") });
}



a9os_app_vf_window.sourcesList = {};
a9os_app_vf_window.sourcesList.init = (dataArrSources) => {
	self.component.arrSources = dataArrSources;
	self.sourcesList.processItems(self.component);

	var editButton = self.component.querySelector(".left .top .sources-list .title .edit-btn");
	a9os_core_main.addEventListener(editButton, "click", self.sourcesList.openWindow, self.component);

	self.sourcesList.appendMoveEvent();
}
a9os_app_vf_window.sourcesList.openWindow = (event, editButton, component) => {
	editButton.disabled = true;

	core.link.push("/vf/sourceslist/edit", {
		cci : a9os_core_main.windowCrossCallback.add({
			fn : self.sourcesList.callbackCloseWindow,
			args : {
				component : component,
				arrSources : false
			}
		}, component)
	});
}

a9os_app_vf_window.sourcesList.callbackCloseWindow = (component, arrSources) => {
	var editButton = component.querySelector(".left .top .sources-list .title .edit-btn");
	editButton.disabled = false;

	if (!arrSources) return;

	component.arrSources = arrSources;
	self.sourcesList.processItems(component);

}
a9os_app_vf_window.sourcesList.processItems = (component) => {
	var sourcesListDiv = component.querySelector(".left .top .sources-list");

	for (var i = 0 ; i < component.arrSources.length ; i++) {
		var pathPrefixLastChar = component.arrSources[i].path_prefix.substr(component.arrSources[i].path_prefix.length - 1);
		if (pathPrefixLastChar != "/") component.arrSources[i].path_prefix += "/";
	}

	core.preProcess(sourcesListDiv, {
		arrSources : component.arrSources
	});

	var arrListItems = component.querySelectorAll(".left .top .sources-list .items .item");

	a9os_core_main.addEventListener(arrListItems, "click", (event, currListItem) => {
		self.component.classList.remove("side-open");
		self.folder.get(currListItem.getAttribute("data-path"));
	});
}
a9os_app_vf_window.sourcesList.removeItem = (event, item) => {
	item.parentElement.removeChild(item);
	self.sourcesList.saveItems();
}
a9os_app_vf_window.sourcesList.openInNewWindow = (event, item) => {
	var arrSources = self.component.arrSources;
	for (var i = 0 ; i < arrSources.length ; i++) {
		if (arrSources[i].item_id == item.getAttribute("data-id")) {
			if (arrSources[i].path_prefix != "/") arrSources[i].path_prefix += "/";

			core.link.push("/vf", { folder : arrSources[i].path_prefix });
		}
	}
	
}

a9os_app_vf_window.sourcesList.appendMoveEvent = () => {
	var sourcesListContainer = self.component.querySelector(".left .sources-list .items");

	var selectedItem = false;
	a9os_core_main.moveEvent.add(sourcesListContainer, (interface, sourcesListContainer) => {

		var arrItems = sourcesListContainer.querySelectorAll(".item");
		if (arrItems.length == 0) return;
		if (arrItems[0].offsetTop > interface.element.start.y) return;

		if (!selectedItem) {
			for (var i = 0 ; i < arrItems.length ; i++) {
				var currItem = arrItems[i];
				if (interface.element.start.y > currItem.offsetTop && interface.element.start.y < currItem.offsetTop + currItem.offsetHeight) {
					selectedItem = currItem;
					break;
				}
			}

			var tmpItemDragged = selectedItem.cloneNode(true);
			tmpItemDragged.classList.add("tmp-dragger");
			sourcesListContainer.appendChild(tmpItemDragged)
		}

		var tmpItemDragged = sourcesListContainer.querySelector(".tmp-dragger");
		tmpItemDragged.style.top = interface.element.y - tmpItemDragged.offsetHeight/2;
		tmpItemDragged.style.left = interface.element.x - tmpItemDragged.offsetWidth/2;

		var moveDivisor = sourcesListContainer.querySelector(".move-divisor");
		if (!moveDivisor) {
			var moveDivisor = document.createElement("div");
			moveDivisor.classList.add("move-divisor");
			sourcesListContainer.appendChild(moveDivisor);
		}

		for (var i = 0 ; i < arrItems.length ; i++) { 
			var currItem = arrItems[i];
			var itemTopThreshold = currItem.offsetTop + currItem.offsetHeight/2;

			if (interface.element.y > itemTopThreshold) continue;
			else {
				sourcesListContainer.insertBefore(moveDivisor, currItem);
				break;
			}
		}
	}, (event, sourcesListContainer) => {
		if (!selectedItem) return;
		var moveDivisor = sourcesListContainer.querySelector(".move-divisor");
		if (moveDivisor) {
			sourcesListContainer.insertBefore(selectedItem, moveDivisor);
			sourcesListContainer.removeChild(moveDivisor);
		}

		var tmpItemDragged = sourcesListContainer.querySelector(".tmp-dragger");
		if (tmpItemDragged) sourcesListContainer.removeChild(tmpItemDragged);

		selectedItem = false;

		self.sourcesList.saveItems();
	});

}


a9os_app_vf_window.sourcesList.saveItems = () => {
	if (self.component.slUpdateBackendTimeout) {
		clearTimeout(self.component.slUpdateBackendTimeout);
		self.component.slUpdateBackendTimeout = false;
	}

	self.component.slUpdateBackendTimeout = setTimeout(() => {
		var arrBookmarks = self.component.querySelectorAll(".left .sources-list .items .item");

		var arrItemsToBackend = [];

		for (var i = 0 ; i < arrBookmarks.length ; i++) {
			var currBookmark = arrBookmarks[i];
			arrItemsToBackend.push(currBookmark.getAttribute("data-id"));
		}

		core.sendRequest(
			"/vf/sourceslist/edit/submit",
			{
				arrItems : arrItemsToBackend
			},
			false,
			false,
			true
		);
	}, 2000);
}


a9os_app_vf_window.folderAddons = {};
a9os_app_vf_window.folderAddons.process = (component, arrFolderAddonsData) => {
	for (var folderAddonName in arrFolderAddonsData) {
		if (!window[folderAddonName]) continue;
		if (!window[folderAddonName].receiveVfFilesContainer || typeof window[folderAddonName].receiveVfFilesContainer != "function") {
			console.error("VF FOLDERADDONS|"+folderAddonName+" must implement method receiveVfFilesContainer(vfFilesContainer, folderAddonData)");
			continue;
		}

		window[folderAddonName].receiveVfFilesContainer(component.querySelector(".vf-files-container"), arrFolderAddonsData[folderAddonName]);
	}
}

a9os_app_vf_window.winListMenu = {};
a9os_app_vf_window.winListMenu.create = (arrBookmarks, arrSources) => {
	var arrMenu = [];

	arrMenu.push({
		name : "Marcadores",
		active : false
	});

	for (var i = 0 ; i < arrBookmarks.length ; i++) {
		var currBookmark = arrBookmarks[i];

		var bookmarkName = currBookmark.path.split("/");
		bookmarkName = bookmarkName[bookmarkName.length-2];

		arrMenu.push({
			name : bookmarkName,
			action : "[a9os_app_vf_window].winListMenu.openBookmark",
			data : currBookmark.path
		});
	}

	arrMenu.push("separator");
	arrMenu.push({
		name : "Fuentes",
		active : false
	});

	for (var i = 0 ; i < arrSources.length ; i++) {
		var currSource = arrSources[i];
		arrMenu.push({
			name : currSource.name,
			action : "[a9os_app_vf_window].winListMenu.openSource",
			data : currSource.path_prefix+"/"
		});
	}

	return arrMenu;
}
a9os_app_vf_window.winListMenu.openBookmark = 
a9os_app_vf_window.winListMenu.openSource = 
a9os_app_vf_window.winListMenu.open = (event, winListItem, dataPath) => {
	core.link.push("/vf", { folder : dataPath });
}