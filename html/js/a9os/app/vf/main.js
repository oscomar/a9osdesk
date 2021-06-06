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
a9os_app_vf_main.main = (data) => {
	
	a9os_app_vf_main.fileHandle.observe();

	a9os_app_vf_main.copyMove.reappendFinalMove();
}


a9os_app_vf_main.fileHandle = {};
a9os_app_vf_main.arrFileHandles = {};

a9os_app_vf_main.fileHandle.attach = (component, getConfigDataFn, putFileDataFn, getFileDataFn, getIsFileModifiedFn, requestFileReloadFn, cancelFn) => {
	
	//component, geCoDa, geFiDa, puFiDa, geIFaMod, reFiRel, cancel

	var fileHandleId = core.getRandomId(self.arrFileHandles, true);

	var path = "untitled";
	var fileToOpen = core.link.hash.get()["file"]||false;
	if (fileToOpen) path = fileToOpen;

	self.arrFileHandles[fileHandleId] = {
		path : path,
		data : false,
		lastRegistryDateByAction : {},

		component : component,
		getConfigDataFn : getConfigDataFn, // call to get config data (extension , selection type, etc)
		putFileDataFn : putFileDataFn, // app to file
		getFileDataFn : getFileDataFn, // file to app
		getIsFileModifiedFn : getIsFileModifiedFn, // call to get if not saved file changes in app
		requestFileReloadFn : requestFileReloadFn, // call if file modified by other app
		cancelFn : cancelFn, // cancel call to select window
	};

	if (path != "untitled") self.fileHandle.open(component, fileHandleId, true);
	else self.fileHandle.new(component, fileHandleId);

	return fileHandleId;
}

a9os_app_vf_main.fileHandle.getHandle = (component, fileHandleId) => {
	
	var arrFileHandles = self.arrFileHandles;
	if (!arrFileHandles[fileHandleId]) return false;
	if (arrFileHandles[fileHandleId] && !arrFileHandles[fileHandleId].component == component)
		return false;

	return arrFileHandles[fileHandleId];
}

a9os_app_vf_main.fileHandle.new = (component, fileHandleId, finalCallbackFn) => { // cierra y limpia
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	var postCloseFn = {
		fn : (component, fileHandleId, handle) => {
			handle.path = "untitled";
			handle.data = false;

			core.link.hash.set({
				file : null
			});

			a9os_core_main.selectWindow(handle.component);
			if (handle.getFileDataFn) core.callCallback(handle.getFileDataFn, {
				handle : handle
			});

			self.folderObserver.remove(component);
		},
		args : {
			component : component,
			fileHandleId : fileHandleId,
			handle : handle
		}
	}

	if (core.callCallback(handle.getIsFileModifiedFn)) {
		self.fileHandle.close(component, fileHandleId, postCloseFn);
	} else {
		core.callCallback(postCloseFn);
	}
}

a9os_app_vf_main.fileHandle.close = (component, fileHandleId, finalCallbackFn) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	var finalCloseFn = {
		fn : (handle, finalCallbackFn) => {
			handle.data = false;

			a9os_core_main.selectWindow(handle.component);
			if (handle.getFileDataFn) core.callCallback(handle.getFileDataFn, {
				handle : handle
			});

			if (finalCallbackFn) {
				core.callCallback(finalCallbackFn, {
					handle : handle
				});
			}

			self.folderObserver.remove(handle.component);
		},
		args : {
			handle : handle,
			finalCallbackFn : finalCallbackFn,
		}
	}

	if (core.callCallback(handle.getIsFileModifiedFn)) {
		/* dialog (Guardar, Guardar Como, Cerrar sin guardar, Cancelar) */

		var arrSaveActions = [];
		arrSaveActions.push({
			name : "Guardar",
			cci : a9os_core_main.windowCrossCallback.add({
				fn : self.fileHandle.save,
				args : {
					component : component,
					fileHandleId : fileHandleId,
					finalCallbackFn : finalCloseFn
				}
			}, component)
		});

		arrSaveActions.push({
			name : "Guardar Como",
			cci : a9os_core_main.windowCrossCallback.add({
				fn : self.fileHandle.saveAs,
				args : {
					component : component,
					fileHandleId : fileHandleId,
					finalCallbackFn : finalCloseFn
				}
			}, component)
		});

		arrSaveActions.push({
			name : "Descartar cambios",
			cci : a9os_core_main.windowCrossCallback.add(finalCloseFn, component)
		});

		var cancelActionCci = a9os_core_main.windowCrossCallback.add(handle.cancelFn, component);

		core.link.push("/vf/dialog", {
			path : handle.path, 
			actions : arrSaveActions, 
			cancelAction : cancelActionCci,
			mode : "saveBeforeClose",
		});

	} else {
		core.callCallback(finalCloseFn);
	}

}

a9os_app_vf_main.fileHandle.openByDropArea = (component, fileHandleId, itemMoveLayer) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	var arrConfigData = core.callCallback(handle.getConfigDataFn, handle.component);
	var dropType = arrConfigData.dropType; //single | multiple | folder | all
	var fileExtensions = arrConfigData.fileExtensions;


	var arrReceivedItems = itemMoveLayer.querySelectorAll(".item");
	handle.arrDroppedPaths = [];
	
	for (var i = 0 ; i < arrReceivedItems.length ; i++) {
		var fileExtension = arrReceivedItems[i].getAttribute("data-extension");

		if (dropType == "single") {
			if (arrReceivedItems[i].getAttribute("data-type") == "file" 
			&&  fileExtensions.indexOf(fileExtension) != -1) {
				handle.arrDroppedPaths.push(arrReceivedItems[i].getAttribute("data-path"));
				break;
			}
		} else if (dropType == "multiple") {
			if (arrReceivedItems[i].getAttribute("data-type") == "file" 
			&&  fileExtensions.indexOf(fileExtension) != -1) {
				handle.arrDroppedPaths.push(arrReceivedItems[i].getAttribute("data-path"));
			}
		} else if (dropType == "folder") {
			if (arrReceivedItems[i].getAttribute("data-type") == "folder") {
				handle.arrDroppedPaths.push(arrReceivedItems[i].getAttribute("data-path"));
			}
		} else if (dropType == "all") {
			handle.arrDroppedPaths.push(arrReceivedItems[i].getAttribute("data-path"));
		}
	}

	if (handle.arrDroppedPaths[0] 
	&& dropType != "folder" 
	&& dropType != "all") {
		handle.requestedFileToOpen = handle.arrDroppedPaths[0];
		a9os_app_vf_main.fileHandle.open(component, fileHandleId);
		//handle.requestedFileToOpen = false;
	}

}

a9os_app_vf_main.fileHandle.openByPath = (component, fileHandleId, path) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	handle.path = path;
	a9os_app_vf_main.fileHandle.open(component, fileHandleId, true);
}
a9os_app_vf_main.fileHandle.open = (component, fileHandleId, force, finalCallbackFn) => {
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;


	var finalOpenFn = {
		fn : (handle, finalCallbackFn) => {
			a9os_core_main.selectWindow(handle.component);

			core.link.hash.set({
				file : handle.path
			});
			
			if (handle.getFileDataFn) core.callCallback(handle.getFileDataFn, {
				handle : handle
			});

			if (finalCallbackFn) {
				core.callCallback(finalCallbackFn, {
					handle : handle
				});
			}

			self.fileHandle.reloadDirectoryFileListing(handle);

			handle.requestedFileToOpen = false;

		},
		args : {
			handle : handle,
			finalCallbackFn : finalCallbackFn
		}
	}



	var requestOpenFn = {
		fn : (handle, force, finalOpenFn) => {
			var configData = core.callCallback(handle.getConfigDataFn, handle.component);

			if (handle.path != "untitled" && force) {
				/* request file () >  */
				if (handle.requestedFileToOpen) {
					handle.path = handle.requestedFileToOpen;
				}
				if (configData.onlySrcUrl) {
					self.fileHandle.getDirectFileUrl(handle, finalOpenFn, handle.path);
				} else {
					self.fileHandle.requestFile(handle, finalOpenFn, false, configData);
				}
			} else {
				if (handle.requestedFileToOpen) {
					handle.path = handle.requestedFileToOpen;
				}
				/* /vf window select file > request file () */
				if (configData.onlySrcUrl) {
					var requestFileCci = a9os_core_main.windowCrossCallback.add({
						fn : self.fileHandle.getDirectFileUrl,
						args : {
							handle : handle,
							callbackFn : finalOpenFn,
							path : false
						}
					}, handle.component);
				} else {
					var requestFileCci = a9os_core_main.windowCrossCallback.add({
						fn : self.fileHandle.requestFile,
						args : {
							handle : handle,
							callbackFn : finalOpenFn,
							path : false,
							configData : configData
						}
					}, handle.component);
				}

				if (handle.requestedFileToOpen) {
					handle.path = handle.requestedFileToOpen;
					a9os_core_main.windowCrossCallback.execute(requestFileCci, {
						path : handle.path
					});
				} else {

					var openFolder = "/";
					if (configData.openSaveasFromPath && configData.openSaveasFromPath != "" && configData.openSaveasFromPath != "untitled") {
						var openSaveasFromPath = configData.openSaveasFromPath;
						if (openSaveasFromPath[openSaveasFromPath.length - 1] == "/") openFolder = openSaveasFromPath;
						else openFolder = a9os_core_main.splitFilePath(openSaveasFromPath)[0]
					}

					core.link.push("/vf", {
						folder : openFolder, 
						mode : "open", 
						config : configData, 
						cci : requestFileCci,
						cancelCci : a9os_core_main.windowCrossCallback.add(handle.cancelFn, handle.component)
					}, false);
					
				}
			}
		},
		args : {
			handle : handle,
			force : force,
			finalOpenFn : finalOpenFn
		}
	}

	if (core.callCallback(handle.getIsFileModifiedFn) && !force) {
		self.fileHandle.close(component, fileHandleId, requestOpenFn);
	} else {
		core.callCallback(requestOpenFn);
	}
}

a9os_app_vf_main.fileHandle.getDirectFileUrl = (handle, callbackFn, path) => {
	var path = self.sanitizePath(path);

	handle.srcUrl = core.getDirectRequestUrl("/vf/fileGetContents", {
		path : path
	}); 

	core.callCallback(callbackFn, {
		handle : handle
	});
} 

a9os_app_vf_main.fileHandle.requestFile = (handle, callbackFn, path, configData) => {
	if (path) handle.path = path;

	if (configData && configData.doNotOpen) {
		core.callCallback(callbackFn, {
			handle : handle
		});
		return;
	}

	handle.path = self.sanitizePath(handle.path);

	core.sendRequest(
		"/vf/fileGetContents",
		{
			path : handle.path
		},
		{
			fn : (response, callbackFn, handle) => {
				handle.data = response;
				core.callCallback(callbackFn, {
					handle : handle
				});
			},
			args : {
				response : false,
				callbackFn : callbackFn,
				handle : handle
			}
		},
		true,
		false,
		{
			fn : (status, handle) => {
				a9os_core_taskbar_popuparea.new(handle.path + " no encontrado", "/resources/a9os/app/vf/icons/files/file-icon-error.svg", "error");
			},
			args : {
				status : false,
				handle : handle
			}
		}
	);
}



a9os_app_vf_main.fileHandle.save = (component, fileHandleId, finalCallbackFn) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;


	if (handle.path == "untitled") {
 		self.fileHandle.saveAs(component, fileHandleId, finalCallbackFn);
 		return;
	}

	if (!handle.putFileDataFn) return;
	handle.data = new Blob([core.callCallback(handle.putFileDataFn)]);
	self.fileHandle.sendFile(handle, finalCallbackFn);
}

a9os_app_vf_main.fileHandle.saveAs = (component, fileHandleId, finalCallbackFn) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	var arrConfigData = core.callCallback(handle.getConfigDataFn);


	var openFolder = "/";
	if (arrConfigData.openSaveasFromPath && arrConfigData.openSaveasFromPath != "" && arrConfigData.openSaveasFromPath != "untitled") {
		var openSaveasFromPath = arrConfigData.openSaveasFromPath;
		if (openSaveasFromPath[openSaveasFromPath.length - 1] == "/") openFolder = openSaveasFromPath;
		else openFolder = a9os_core_main.splitFilePath(openSaveasFromPath)[0]
	}

	core.link.push("/vf", {
		folder : openFolder, 
		mode : "saveas",
		config : arrConfigData,
		cci : a9os_core_main.windowCrossCallback.add({
			fn : (handle, callbackFn, path) => {
				handle.path = path;

				if (!handle.putFileDataFn) return;

				handle.data = new Blob([core.callCallback(handle.putFileDataFn)]);

				a9os_core_main.selectWindow(handle.component);

				core.link.hash.set({
					file : handle.path
				});

				if (handle.getFileDataFn) core.callCallback(handle.getFileDataFn, {
					handle : handle
				});

				var callbackWithFolderRefreshFn = {
					fn : (handle, callbackFn) => {
						self.folderObserver.refresh(handle.path);
						if (callbackFn) core.callCallback(callbackFn, {
							handle : handle
						});
					},
					args : {
						handle : handle,
						callbackFn : callbackFn
					}
				}

				self.fileHandle.sendFile(handle, callbackWithFolderRefreshFn);

				self.fileHandle.reloadDirectoryFileListing(handle);

			},
			args : {
				handle : handle,
				callbackFn : finalCallbackFn,
				path : false
			}
		}, handle.component),
		cancelCci : a9os_core_main.windowCrossCallback.add(handle.cancelFn, handle.component)
	});
}

a9os_app_vf_main.fileHandle.sendFile = (handle, callbackFn) => {
		
	var fakeGearId = core.getRandomId(a9os_core_taskbar_notifarea_fileprogress.component.arrGearIds, true);
	handle.path = self.sanitizePath(handle.path);

	core.sendRequest(
		"vf/filePutContents?path="+handle.path,
		handle.data,
		{
			fn : (response, handle, callbackFn) => {
				if (!handle.lastRegistryDateByAction) handle.lastRegistryDateByAction = {};

				if (response == "out of space") self.userDiskSpace.outOfSpace.show();

				handle.lastRegistryDateByAction["file_write"] = response;
				if (handle.component) a9os_core_main.selectWindow(handle.component);
				if (callbackFn) core.callCallback(callbackFn, {
					handle : handle
				});

				var gearObj = {};
				gearObj.gear_id = fakeGearId;
				gearObj.is_final_message = "1";

				a9os_core_taskbar_notifarea_fileprogress.receiveFromGear(gearObj);
			},
			args : {
				response : false,
				handle : handle,
				callbackFn : callbackFn
			}
		},
		false,
		false,
		false,
		{
			fn : (event, handle) => {
				var gearObj = {};
				gearObj.gear_id = fakeGearId;
				gearObj.message = {};
				gearObj.message.percent = 100*event.loaded/event.total;
				gearObj.message.type = "upload";
				gearObj.message.currFile = a9os_core_main.splitFilePath(handle.path)[1];
				gearObj.message.destFile = handle.path;
				gearObj.is_final_message = 0;

				a9os_core_taskbar_notifarea_fileprogress.receiveFromGear(gearObj);
			},
			args : {
				event : false,
				handle : handle
			}
		}
	);
}

a9os_app_vf_main.fileHandle.dettach = (fileHandleId) => {
		delete self.arrFileHandles[fileHandleId];
}

a9os_app_vf_main.fileHandle.addDirectoryFileListing = (component, fileHandleId, putDirectoryListFn) => {
	
	var handle = self.fileHandle.getHandle(component, fileHandleId);
	if (!handle) return false;

	handle.putDirectoryListFn = putDirectoryListFn;

	self.fileHandle.reloadDirectoryFileListing(handle);

}
a9os_app_vf_main.fileHandle.reloadDirectoryFileListing = (handle) => {
	
	var getListFn = {
		fn : self.fileHandle._getFileListFn,
		args : {
			handle : handle
		}
	};

	var configData = core.callCallback(handle.getConfigDataFn, handle.component);
	configData.doNotOpen = configData.doNotOpen||false;
	if (!configData.doNotOpen) {
		self.folderObserver.add(handle.component, handle.path, getListFn);
	}
	
	core.callCallback(getListFn);
}

a9os_app_vf_main.fileHandle._getFileListFn = (handle) => {
	
	if (handle.path == "untitled" || !handle.putDirectoryListFn) return ;
	
	path = handle.path.split("/");
	if (path[path.length-1].indexOf(".") != -1) path.pop();
	path = path.join("/")+"/";


	core.sendRequest(
		"/vf/folder",
		{ path : path },
		{
			fn : (response, handle) => {
				if (response.error) {
					a9os_app_vf_main.catchBackendError(response.error);
					return false;
				}

				var arrFiles = response.files;
				if (arrFiles.length == 0) return;

				var arrConfigData = core.callCallback(handle.getConfigDataFn);
				arrFiles = self.fileHandle.filterByExtension(arrFiles, arrConfigData.fileExtensions);
				handle.arrFolderFiles = arrFiles;
				core.callCallback(handle.putDirectoryListFn, {
					handle : handle
				});
			},
			args : {
				response : false,
				handle : handle
			}
		}
	);
}

a9os_app_vf_main.fileHandle.filterByExtension = (arrFiles, arrFormats, withFolders) => { 
	arrFilesOutput = [];
	for (var i = 0 ; i < arrFiles.length ; i++){
		var currFile = arrFiles[i];
		if (withFolders && currFile.type == "folder") {
			arrFilesOutput.push(currFile);
			continue;
		}

		if (arrFormats.indexOf(currFile.extension) == -1){
			continue;
		}
		arrFilesOutput.push(currFile);
	}

	return arrFilesOutput;
}


a9os_app_vf_main.fileHandle.observe = () => {
	var checkLoop = () => {
		
		var arrFileHandles = self.arrFileHandles;

		if (Object.keys(arrFileHandles).length == 0) return;

		var arrPaths = {};
		for (var i in arrFileHandles) {
			var currHandle = arrFileHandles[i];
			
			if (typeof currHandle.component === "undefined") currHandle.component = false;

			if (!currHandle.component || !a9os_core_main.component.contains(currHandle.component)) {
				self.fileHandle.dettach(i);
			}

			if (currHandle.path == "untitled") continue;

			var arrConfigData = core.callCallback(currHandle.getConfigDataFn, currHandle.component);
			if (arrConfigData && arrConfigData.doNotOpen) continue;
			


			arrPaths[i] = currHandle.path;
		}

		var getRegistryFn = {
			fn : (response, arrFileHandles) => { // index (array) | date_add | action
				if (!response) return;
				for (var i = 0 ; i < response.length ; i++){
					for (var x = 0 ; x < response[i].index.length ; x++) {							
						var currHandle = arrFileHandles[response[i].index[x]];
						if (!currHandle) continue;
						if (currHandle.path != response[i].path) continue;

						if (!currHandle.lastRegistryDateByAction[response[i].action]) {
							currHandle.lastRegistryDateByAction[response[i].action] = response[i].date_add;
						}

						if (currHandle.lastRegistryDateByAction[response[i].action]
						&&  currHandle.lastRegistryDateByAction[response[i].action] != response[i].date_add) {
							
							currHandle.lastRegistryDateByAction[response[i].action] = response[i].date_add;

							var confirmCallbackFn = {
								fn : (component, fileHandleId) => {
									self.fileHandle.open(component, fileHandleId, true);
								},
								args : {
									component : currHandle.component,
									fileHandleId : response[i].index[x]
								}
							}

							core.callCallback(currHandle.requestFileReloadFn, {
								handle : currHandle,
								registry : response[i],
								confirmCallback : () => {
									core.callCallback(confirmCallbackFn);
								}
							});
						}
					}
				}
			},
			args : {
				response : false,
				arrFileHandles : arrFileHandles
			}
		}

		if (Object.entries(arrPaths).length != 0) {
			core.sendRequest(
				"/vf/getRegistry",
				{
					arrPaths : arrPaths
				},
				getRegistryFn,
				false,
				true
			);
		}
	}

	setInterval(checkLoop, 3000);
}

a9os_app_vf_main.fileHandle.saveAllFiles = () => {
	
	var arrFileHandles = a9os_app_vf_main.arrFileHandles;

	for (var i in arrFileHandles) {
		var currHandle = arrFileHandles[i];

		self.fileHandle.save(currHandle.component, i);
	}
}

a9os_app_vf_main.fileHandle.getBlobUrl = (blob) => {
	return URL.createObjectURL(blob);
}

a9os_app_vf_main.fileHandle.download = (arrPaths) => {
	
	var fileName = "";
	if (arrPaths.length > 1) {
		var arrTime = a9os_core_taskbar_notifarea_clock.getTime();

		fileName = "files_"+arrTime[0]+"-"+arrTime[1]+".zip";
	} else {
		var path = arrPaths[0];
		var arrName = a9os_core_main.splitFilePath(path);
		if (path.substr(-1) == "/") {
			fileName = arrName[1]+".zip";
		} else {
			fileName = arrName[1];

			self.fileHandle.getDirectFileUrl({}, {
				fn : (handle, fileName) => {
					var aDiv = document.createElement("a");
					aDiv.href = handle.srcUrl;
					aDiv.download = fileName;
					aDiv.click();
				},
				args : {
					handle : false,
					fileName : fileName
				}
			}, path);
			
			return;
		}
	}


	core.sendRequest(
		"/vf/download",
		arrPaths,
		{
			fn : (response, fileName) => {
				var aDiv = document.createElement("a");
				aDiv.href = a9os_app_vf_main.fileHandle.getBlobUrl(response);
				aDiv.download = fileName;
				aDiv.click();
			},
			args : {
				response : false,
				fileName : fileName
			}
		},
		true
	);
}



a9os_app_vf_main.folderObserver = {};
a9os_app_vf_main.folderObserverList = {};

a9os_app_vf_main.folderObserver.add = (component, path, refreshFn) => {
	
	self.folderObserver.remove(component);

	var pathToRefresh = path;
	if (pathToRefresh) { //remove file name
		pathToRefresh = pathToRefresh.split("/");
		if (pathToRefresh[pathToRefresh.length-1].indexOf(".") != -1) pathToRefresh.pop();
		pathToRefresh = pathToRefresh.join("/");

		if (pathToRefresh.slice(-1) != "/") pathToRefresh = pathToRefresh+"/";
	}


	if (!self.folderObserverList[pathToRefresh]) self.folderObserverList[pathToRefresh] = [];
	self.folderObserverList[pathToRefresh].push({
		component : component,
		refreshFn, refreshFn
	});

}

a9os_app_vf_main.folderObserver.remove = (component) => {
	
	for (var currPath in a9os_app_vf_main.folderObserverList) {
		var currList = a9os_app_vf_main.folderObserverList[currPath];
		for (var i = currList.length - 1; i >= 0; i--) {
			if (currList[i].component.isSameNode(component)){
				currList.splice(i, 1);
				break;
			}
		}
		if (currList.length == 0) delete a9os_app_vf_main.folderObserverList[currPath];
	}
	return;
}

a9os_app_vf_main.folderObserver.refresh = (path, forceParent) => {
	
	var pathToRefresh = path;
	if (pathToRefresh) { //remove file name
		pathToRefresh = pathToRefresh.split("/");
		if (pathToRefresh[pathToRefresh.length-1].indexOf(".") != -1 || forceParent) pathToRefresh.pop();
		pathToRefresh = pathToRefresh.join("/");

		if (pathToRefresh.slice(-1) != "/") pathToRefresh = pathToRefresh+"/";
	}


	for (var currPath in self.folderObserverList) {
		var currList = self.folderObserverList[currPath];
		for (var i = 0 ; i < currList.length ; i++) {
			var currComponent = currList[i].component;
			if (!currComponent || !a9os_core_main.component.contains(currComponent)) {
				self.folderObserver.remove(currComponent);
				return;
			}

			var componentName = currComponent.getAttribute("data-component-name");
			if (!pathToRefresh || pathToRefresh == currPath) {
				core.callCallback(currList[i].refreshFn);
			}
		}
	}
}


a9os_app_vf_main.copyMove = {};
a9os_app_vf_main.copyMove.fromMoveLayer = (event, itemMoveLayer, type) => {
	
	var arrMoveHideItems = itemMoveLayer.querySelectorAll(".item");
	var dragDest = itemMoveLayer.dragDest;

	var arrMoveFiles = {};
	for (var i = 0 ; i < arrMoveHideItems.length ; i++) {
		arrMoveFiles[arrMoveHideItems[i].getAttribute("data-path")] = { 
			status : "ok",
			type : arrMoveHideItems[i].getAttribute("data-type"),
			size : 0,
			destSize : 0,
			destPath : ""
		};
	}

	var dest = dragDest.getAttribute("data-path");

	self.copyMove.checkProblems(arrMoveFiles, dest, type);


}
a9os_app_vf_main.copyMove.fromFileClipboard = (arrFileItems, type, pasteDestPath) => {

	var arrMoveFiles = {};
	for (var i = 0 ; i < arrFileItems.length ; i++) {
		arrMoveFiles[arrFileItems[i].getAttribute("data-path")] = { 
			status : "ok",
			type : arrFileItems[i].getAttribute("data-type"),
			size : 0,
			destSize : 0,
			destPath : ""
		};
	}

	self.copyMove.checkProblems(arrMoveFiles, pasteDestPath, type);

}

a9os_app_vf_main.copyMove.checkProblems = (arrMoveFiles, dest, type) => {
	//console.log(arrMoveFiles, dest, type);
	
	var fnCheckProblemsCallback = {
		fn : (response, dest, type) => {
			//console.log(response);
			var boolAllOk = true;

			if (response == "out of space"){
				self.userDiskSpace.outOfSpace.show();
				return;
			}
			if (response == "move in same dir"){
				self.copyMove.showMoveInSameDir();
				return;
			}

			for (var i in response) {
				var currResponseAnswer = response[i];

				if (!currResponseAnswer.internal) {
					if (currResponseAnswer.status != "exist") continue;
				} else {
					var boolInternalOk = true;
					for (var currInternalPath in currResponseAnswer.internal) {
						var currInternalResponseAnswer = currResponseAnswer.internal[currInternalPath];

						if (currInternalResponseAnswer.status != "exist") continue;
						boolInternalOk = false;
					}
					if (boolInternalOk) continue;
				}

				boolAllOk = false;
				break;
			}

			if (boolAllOk) {
				self.copyMove.finalMove(response, dest,type);
			} else {
				core.link.push(
					"/vf/copyMove/checkDialog", {
						cdi : a9os_core_main.windowCrossData.add({
							arrMoveFiles : response,
							dest : dest,
							type : type,
							returnFn : {
								fn : self.copyMove.checkProblems,
								args : {
									arrMoveFiles : [],
									dest : dest,
									type : type
								}
							}
						})
					}
				);
			}
		},
		args : {
			response : false,
			dest : dest,
			type : type
		}
	};

	
	core.sendRequest(
		"/vf/copyMove/checkProblems",
		{
			arrMoveFiles : arrMoveFiles, 
			dest : dest,
			type : type
		},
		fnCheckProblemsCallback
	);
}

a9os_app_vf_main.copyMove.showMoveInSameDir = () => {
	a9os_core_taskbar_popuparea.new("No se puede mover una carpeta adentro de sí misma", false, "error");
}

a9os_app_vf_main.copyMove.finalMove = (arrMoveFiles, dest, type) => {
	
	var ifAllSkip = 0;
	var mfLength = 0;
	for (var i in arrMoveFiles) {
		var fileObj = arrMoveFiles[i];
		if (fileObj.status == "skip") ifAllSkip++;
		mfLength++;
	}
	if (mfLength == ifAllSkip) return;

	core.sendRequest(
		"/vf/copyMove/finalMove",
		{
			arrMoveFiles : arrMoveFiles,
			dest : dest,
			type : type
		},
		{
			fn : (response) => {
				var asyncGearId = response;
				
				core.asyncGear.append(asyncGearId, {
					fn : a9os_app_vf_main.copyMove.receiveFromGear,
					args : {
						message : false
					}
				}, "a9os_app_vf_main.copyMove.finalMove");
			},
			args : {
				response : false
			}
		},
	);
}

a9os_app_vf_main.copyMove.reappendFinalMove = () => {
	
	core.asyncGear.reappendId.getById("a9os_app_vf_main.copyMove.finalMove", {
		fn : (arrGearIds) => {
			for (var i = 0 ; i < arrGearIds.length ; i++) {
				var currGearId = arrGearIds[i];

				core.asyncGear.append(currGearId, {
					fn : a9os_app_vf_main.copyMove.receiveFromGear,
					args : {
						message : false
					}
				});
			}
		},
		args : {
			arrGearIds : false
		}
	});
}

a9os_app_vf_main.copyMove.receiveFromGear = (message) => {
		a9os_core_taskbar_notifarea_fileprogress.receiveFromGear(message);

	if (message.is_final_message == "1") {
		for (var i in message.message.arrPathsToRefresh) {
			var currPathToRefresh = message.message.arrPathsToRefresh[i];
			a9os_app_vf_main.folderObserver.refresh(currPathToRefresh);
		}
	}
}


a9os_app_vf_main.userDiskSpace = {};
a9os_app_vf_main.userDiskSpace.outOfSpace = {};
a9os_app_vf_main.userDiskSpace.outOfSpace.show = () => {
	a9os_core_taskbar_popuparea.new("Sin espacio de almacenamiento", "/resources/a9os/app/vf/icons/disk-out-of-space.svg", "error");
}



a9os_app_vf_main.saveasOpenPathInWindow = (event, itemMoveLayer, windowTaskbarItemId) => {
	var firstMoveLayerItem = itemMoveLayer.querySelector(".item");
	var itemPath = firstMoveLayerItem.getAttribute("data-path");

	var arrFolderAndFile = a9os_core_main.splitFilePath(itemPath);

	var destWind0w = a9os_core_main.component.querySelector(".window[data-taskbar-item-id='"+windowTaskbarItemId+"']");
	var componentVfWindow = destWind0w.querySelector("cmp.component");
	a9os_core_main.selectWindow(destWind0w);
	a9os_app_vf_window.folder.get(arrFolderAndFile[0], {
		fn : (componentVfWindow, itemPath) => {
			var itemToSelect = componentVfWindow.querySelector(".item[data-path='"+itemPath+"']");
			if (itemToSelect) itemToSelect.click();
		},
		args : {
			componentVfWindow : componentVfWindow,
			itemPath : itemPath
		}
	});
}


a9os_app_vf_main.escapeFilenameForQS = (filePath) => {
	return filePath.replace(/\'/g, "\\'");
}

a9os_app_vf_main.sanitizePath = (path) => {
	var path = path.replace(/\/\s*/g, "/");
	path = path.replace(/\n*/g, "");
	path = path.replace(/\t*/g, "");
	path = path.replace(/\/\/+/g, "/");

	return path;
}

a9os_app_vf_main.catchBackendError = (error) => {
	a9os_core_taskbar_popuparea.new(error, "/resources/a9os/app/vf/icons/files/file-icon-error.svg", "error");
	console.error("catchBackendError", error);
}


a9os_app_vf_main.convertSize = (bytes) => {
	if (bytes < 1024) return bytes + " B";
	else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + " kB";
	else if (bytes < 1073741824) return (bytes / 1048576).toFixed(2) + " MB";
	else if (bytes < 1099511627776) return (bytes / 1073741824).toFixed(2) + " GB";
	else return (bytes / 1099511627776).toFixed(2) + " TB";
}