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
a9os_app_vf_copymove_checkdialog.main = (data) => {
	
	if (data.window) a9os_core_window.processWindowData(data);

	self.component.arrCrossData = a9os_core_main.windowCrossData.get(core.link.hash.get()["cdi"]);
	self.component.arrPaths = [];

	self.loadInterface();
	self.initInterface();

}

a9os_app_vf_copymove_checkdialog.loadInterface = () => {
	
	var arrInterfaceData = [];

	for (currPath in self.component.arrCrossData.arrMoveFiles) {
		var currFileObj = self.component.arrCrossData.arrMoveFiles[currPath];

		if (currFileObj.internal) {
			for (currInternalPath in currFileObj.internal) {
				var currInternalFileObj = currFileObj.internal[currInternalPath];
				if (currInternalFileObj.status == "ok") continue;
				fileObjectToInterfaceData(currInternalFileObj, currPath, currInternalPath);
			}
		}
		
		fileObjectToInterfaceData(currFileObj, currPath);

		if (currFileObj.status == "ok") continue;

	}


	var filesToCheckContainer = self.component.querySelector(".files-to-check-container");
	core.preProcess(filesToCheckContainer, { arrFilesToCheck : arrInterfaceData });

	var fileDialogContainer = self.component.querySelector(".file-dialog-container");
	core.preProcess(fileDialogContainer, { arrFilesToCheck : arrInterfaceData });



	function fileObjectToInterfaceData(fileObject, currPath, currInternalPath) {
		var originPath = currInternalPath||currPath;

		if (fileObject.status != "exist") return;

		var fileName = "";
		var originalOriginPath = originPath;
		if (fileObject.type == "folder") {
			originPath = originPath.slice(0, -1);
		}
		fileName = originPath.split("/");
		fileName = fileName.pop();

		self.component.arrPaths.push([originalOriginPath, fileName]);

		var newInterfaceDataItem = {
			id : arrInterfaceData.length,
			currPath : currPath,
			currInternalPath : currInternalPath,
			origin : {
				icon : "/resources/a9os/app/vf/icons/files/folder-icon.svg",
				path : originPath,
				size : fileObject.size
			},
			dest : {
				icon : "/resources/a9os/app/vf/icons/files/folder-icon.svg",
				path : fileObject.destPath,
				size : fileObject.destSize
			},
			typeLabel : "La siguiente carpeta",
			overwriteNameByType : "Combinar",
			fileName : fileName
		};


		if (fileObject.type == "file") {
			newInterfaceDataItem.typeLabel = "El siguiente archivo";
			newInterfaceDataItem.overwriteNameByType = "Reemplazar";
			newInterfaceDataItem.origin.icon = "/resources/a9os/app/vf/icons/files/file-icon.svg";
			newInterfaceDataItem.dest.icon = "/resources/a9os/app/vf/icons/files/file-icon.svg";
		}

		arrInterfaceData.push(newInterfaceDataItem);
	}
}

a9os_app_vf_copymove_checkdialog.initInterface = () => {
	
	var arrFileDialogs = self.component.querySelectorAll(".file-dialog-container .file-dialog");



	var arrFileToCheckItems = self.component.querySelectorAll(".files-to-check-container .item");
	a9os_core_main.addEventListener(arrFileToCheckItems, "click", (event, item) => {
		var itemId = item.getAttribute("data-id");

		for (var i = 0 ; i < arrFileDialogs.length ; i++){
			arrFileDialogs[i].classList.remove("show");
			if (i == itemId) arrFileDialogs[i].classList.add("show");
			arrFileToCheckItems[i].classList.remove("selected");
		}
		item.classList.add("selected");
	});
	arrFileToCheckItems[0].click();




	var cancelButton = self.component.querySelector(".bottom-buttons .cancel");
	a9os_core_main.addEventListener(cancelButton, "click", (event, button) => {
		a9os_core_window.close();
	});




	var arrDialogButtons = self.component.querySelectorAll(".file-dialog-container .file-dialog .buttons .btn");
	a9os_core_main.addEventListener(arrDialogButtons, "click", (event, button) => {
		var currFileDialog = button.goToParentClass("file-dialog");
		var arrDialogButtons = currFileDialog.querySelectorAll(".buttons .btn");

		for (var i = 0 ; i < arrDialogButtons.length ; i++) {
			arrDialogButtons[i].classList.remove("selected");
		}
		button.classList.add("selected");

		self.switchRenameInput(currFileDialog);
		self.checkFileDialogDecision(currFileDialog);

	});



	var arrRenameInputs = self.component.querySelectorAll(".file-dialog-container .file-dialog .rename-line input");
	a9os_core_main.addEventListener(arrRenameInputs, "keypress", (event, input) => {
		if (event.key == "/"){
			event.preventDefault();
			return false;
		}
	});
	a9os_core_main.addEventListener(arrRenameInputs, "keyup", (event, input) => {
		var currFileDialog = input.goToParentClass("file-dialog");
		self.checkFileDialogDecision(currFileDialog);
	});




	var okButton = self.component.querySelector(".bottom-buttons .btn.submit");
	a9os_core_main.addEventListener(okButton, "click", (event, okButton) => {

		var arrFileDialogs = self.component.querySelectorAll(".file-dialog-container .file-dialog");
		for (var i = 0 ; i < arrFileDialogs.length ; i++ ){
			checkMoveFile(i, arrFileDialogs[i].getAttribute("data-currpath"), arrFileDialogs[i].getAttribute("data-currinternalpath"));
		}

		function checkMoveFile(i, currPath, currInternalPath) {
			var currFileDialogButton = self.component.querySelector(".file-dialog-container .file-dialog[data-id='"+i+"'] .buttons .btn.selected");
			if (currFileDialogButton.classList.contains("overwrite")) {
				if (currInternalPath) {
					self.component.arrCrossData.arrMoveFiles[currPath].internal[currInternalPath].status = "overwrite";
				} else {
					self.component.arrCrossData.arrMoveFiles[currPath].status = "overwrite";
				}
			} else if (currFileDialogButton.classList.contains("rename")) {
				var currFileDialogInput = self.component.querySelector(".file-dialog-container .file-dialog[data-id='"+i+"'] .rename-line input");
				if (currInternalPath) {
					self.component.arrCrossData.arrMoveFiles[currPath].internal[currInternalPath].status = "rename";
					self.component.arrCrossData.arrMoveFiles[currPath].internal[currInternalPath].newName = currFileDialogInput.value;
				} else {
					self.component.arrCrossData.arrMoveFiles[currPath].status = "rename";
					self.component.arrCrossData.arrMoveFiles[currPath].newName = currFileDialogInput.value;
				}
			} else if (currFileDialogButton.classList.contains("skip")) {
				if (currInternalPath) {
					self.component.arrCrossData.arrMoveFiles[currPath].internal[currInternalPath].status = "skip";
				} else {
					self.component.arrCrossData.arrMoveFiles[currPath].status = "skip";
				}
			}
		}

 		core.callCallback(self.component.arrCrossData.returnFn, {
 			arrMoveFiles : self.component.arrCrossData.arrMoveFiles
 		});
 		a9os_core_window.close();
	});
}

a9os_app_vf_copymove_checkdialog.switchRenameInput = (currFileDialog) => {
	
	var arrDialogButtons = currFileDialog.querySelectorAll(".buttons .btn");

	if (arrDialogButtons[1].classList.contains("selected")) {
		currFileDialog.querySelector(".rename-line").classList.add("show");
	} else {
		currFileDialog.querySelector(".rename-line").classList.remove("show");
	}
}

a9os_app_vf_copymove_checkdialog.checkFileDialogDecision = (currFileDialog) => {
	
	var arrDialogButtons = currFileDialog.querySelectorAll(".buttons .btn");


	var currDialogButton = self.component.querySelector(".files-to-check-container .item[data-id='"+currFileDialog.getAttribute("data-id")+"']");

	for (var i = 0 ; i < arrDialogButtons.length ; i++) {
		if (arrDialogButtons[i].classList.contains("selected")) {
			if (i != 1) {
				currDialogButton.classList.remove("error");
				currDialogButton.classList.add("ok");
			} else {
				if (self.checkRenameInput(currFileDialog.querySelector(".rename-line input"))) {
					currDialogButton.classList.remove("error");
					currDialogButton.classList.add("ok");
				} else {
					currDialogButton.classList.remove("ok");
					currDialogButton.classList.add("error");
				}
			}
		}
	}

	self.checkFinalSubmit();
}

a9os_app_vf_copymove_checkdialog.checkRenameInput = (currInput) => {
	
	var inputText = currInput.value;
	inputText.trim();
	inputText = inputText.replace(/\/+/g, "");
	currInput.value = inputText;

	var arrPaths = self.component.arrPaths;
	var currFileDialog = currInput.goToParentClass("file-dialog");

	var tmpArrCurrPath = arrPaths[currFileDialog.getAttribute("data-id")][0];
	if (tmpArrCurrPath.slice(-1) == "/") {
		tmpArrCurrPath = tmpArrCurrPath.slice(0, -1);
		tmpArrCurrPath = tmpArrCurrPath.split("/");
		tmpArrCurrPath = tmpArrCurrPath.slice(0, -1);
		var pathToCompare = tmpArrCurrPath.join("/")+"/"+inputText+"/";
	} else {
		tmpArrCurrPath = tmpArrCurrPath.split("/");
		tmpArrCurrPath = tmpArrCurrPath.slice(0, -1);
		var pathToCompare = tmpArrCurrPath.join("/")+inputText;
	}


	var arrFinalRenamedPaths = [];
	for (var i = 0 ; i < arrPaths.length ; i++){
		var currFileDialog = self.component.querySelector(".file-dialog-container .file-dialog[data-id='"+i+"']");

		if (currFileDialog.querySelector(".btn.rename").classList.contains("selected") && i != currFileDialog.getAttribute("data-id")) {
			var fileNewName = currFileDialog.querySelector(".rename-line input").value;
		} else {
			var fileNewName = arrPaths[i][1];
		}

		var filteredPath = "";
		if (arrPaths[i][0].slice(-1) == "/") {
			var tmpName = arrPaths[i][0].slice(0, -1);
			tmpName = tmpName.split("/");
			tmpName = tmpName.slice(0, -1);
			filteredPath = tmpName.join("/")+"/"+fileNewName+"/";
		} else {
			var tmpName = arrPaths[i][0];
			tmpName = tmpName.split("/");
			tmpName = tmpName.slice(0, -1);
			filteredPath = tmpName.join("/")+fileNewName;
		}

		arrFinalRenamedPaths.push(filteredPath);
	}


	for (var i = 0 ; i < arrFinalRenamedPaths.length ; i++){
		if (arrFinalRenamedPaths[i] == pathToCompare) return false;
	}
	currInput.setAttribute("data-full-renamed", pathToCompare);
	return true;
}


a9os_app_vf_copymove_checkdialog.checkFinalSubmit = () => {
		var arrFileToCheckItems = self.component.querySelectorAll(".files-to-check-container .item");
	var okButton = self.component.querySelector(".bottom-buttons .btn.submit");

	for (var i = 0 ; i < arrFileToCheckItems.length ; i++){
		var currItem = arrFileToCheckItems[i];
		if (!currItem.classList.contains("ok")) break;
	}

	if (i == arrFileToCheckItems.length) {
		okButton.disabled = false;
	} else {
		okButton.disabled = true;
	}
}