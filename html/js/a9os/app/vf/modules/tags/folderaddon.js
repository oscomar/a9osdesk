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
var a9os_app_vf_modules_tags_folderaddon = {};
a9os_app_vf_modules_tags_folderaddon.main = (data) => {
	//nothing to do here
	return false;
}

a9os_app_vf_modules_tags_folderaddon.receiveVfFilesContainer = (vfFilesContainer, folderAddonData) => {
	self.tagSource.process(vfFilesContainer, folderAddonData);
	self.tagBookmarks.process(vfFilesContainer);

	if (vfFilesContainer.classList.contains("saveas-mode")) self.saveasMods.process(vfFilesContainer);

	var arrFileItems = vfFilesContainer.querySelectorAll(".item:not([data-type='folder'])");
	var expandTagsItem = self.component.querySelector(".expand-tags");


	core.addEventListener(vfFilesContainer, "click", (event, vfFilesContainer) => {
		var usedAddButton = vfFilesContainer.querySelector(".expand-tags .add-button.hide");
		var usedAddDialog = vfFilesContainer.querySelector(".expand-tags .add-dialog.show");

		if (usedAddButton) usedAddButton.classList.remove("hide");
		if (usedAddDialog) usedAddDialog.classList.remove("show");

		var tagItemEditing = vfFilesContainer.querySelector(".expand-tags .item-tag.editing");
		if (tagItemEditing) tagItemEditing.classList.remove("editing");
	});

	var arrAllTagsMenu = self.getAllTagsMenu(folderAddonData.allTags);

	for (var i = 0 ; i < arrFileItems.length ; i++){
		var currFileItem = arrFileItems[i];
		var currFileItemId = currFileItem.getAttribute("data-id");
		var fileTagData = folderAddonData.files[currFileItemId];
		if (!fileTagData) continue;

		var newExpandTagItem = expandTagsItem.cloneNode(true);
		newExpandTagItem.setAttribute("data-foreach", "arrItemTags:currItemTag");

		core.preProcess(newExpandTagItem, { arrItemTags : fileTagData });
		currFileItem.appendChild(newExpandTagItem);

		var addButton = newExpandTagItem.querySelector(".add-button");
		var addDialog = newExpandTagItem.querySelector(".add-dialog");
		var addDialogTagInput = addDialog.querySelector("input.input-name");
		var addDialogTagValue = addDialog.querySelector("input.input-value");
		var addDialogTagSubmitBtn = addDialog.querySelector(".btn.submit");

		core.addEventListener(addButton, "click", (event, addButton, addDialog, addDialogTagInput, addDialogTagValue) => {
			event.stopPropagation();

			addButton.classList.add("hide");
			addDialog.classList.add("show");

			addDialogTagInput.value = "";
			addDialogTagValue.value = "";

			addDialogTagInput.disabled = false;

		}, addDialog, addDialogTagInput, addDialogTagValue);

		core.addEventListener(addDialog.querySelectorAll("input"), ["click", "dblclick", "mousedown"], (event, addButton) => {
			event.stopPropagation();
		});

		core.addEventListener(addDialog.querySelectorAll("input"), "keyup", (event, addButton, addDialogTagInput, addDialogTagValue, currFileItemId, vfFilesContainer) => {
			if (event.which == 13 && addDialogTagInput.value.trim() != "" && addDialogTagValue.value.trim() != "") {
				self.addNew.submit(currFileItemId, addDialogTagInput.value.trim(), addDialogTagValue.value.trim(), vfFilesContainer);
			}
		}, addDialogTagInput, addDialogTagValue, currFileItemId, vfFilesContainer);

		core.addEventListener(addDialogTagSubmitBtn, "click", (event, addDialogTagSubmitBtn, addDialogTagInput, addDialogTagValue, currFileItemId, vfFilesContainer) => {
			if (addDialogTagInput.value.trim() == "" || addDialogTagValue.value.trim() == "") return;
			self.addNew.submit(currFileItemId, addDialogTagInput.value.trim(), addDialogTagValue.value.trim(), vfFilesContainer);
		}, addDialogTagInput, addDialogTagValue, currFileItemId, vfFilesContainer);


		addDialogTagInput.setAttribute("data-menu", JSON.stringify(arrAllTagsMenu));

		core.addEventListener(addDialogTagInput, "focus", (event, addDialogTagInput) => {
			a9os_core_main.removeMenu();
			a9os_core_main.showMenu(addDialogTagInput);
		});
		core.addEventListener(addDialogTagValue, "focus", (event, addDialogTagInput) => {
			a9os_core_main.removeMenu();
		});
	}
}

a9os_app_vf_modules_tags_folderaddon.addNew = {};
a9os_app_vf_modules_tags_folderaddon.addNew.selectFromMenu = (event, addDialogTagInput, selectedValue) => {
	addDialogTagInput.value = selectedValue;
}
a9os_app_vf_modules_tags_folderaddon.addNew.submit = (fileItemId, name, value, vfFilesContainer) => {

	var editMode = vfFilesContainer.querySelector(".item.expand .expand-tags .add-dialog").classList.contains("edit-mode");
	var editModeAndFromName = false;
	if (editMode) editModeAndFromName = vfFilesContainer.querySelector(".item.expand .item-tag.editing .tag-value").textContent;

	core.sendRequest(
		"/vf/modules/tags/addnew",
		{
			fileItemId : fileItemId,
			name : name,
			value : value,
			path : vfFilesContainer.getAttribute("data-path"),
			editModeAndFromName : editModeAndFromName
		},
		{
			fn : (response, fileItemId, vfFilesContainer) => {
				if (response == "FILE NOT EXIST") {
					a9os_core_taskbar_popuparea.new("Archivo no encontrado", false, "error");
					vfFilesContainer.click();
					return;
				}

				if (response == "TAG VALUE EXIST") {
					a9os_core_taskbar_popuparea.new("Este tag ya existe", false, "error");
					vfFilesContainer.click();
					return;
				}

				if (response == "EDIT TAG NOT FOUND") {
					a9os_core_taskbar_popuparea.new("El tag para editar no existe", false, "error");
					vfFilesContainer.click();
					return;
				}

				if (response == "EDIT TAG ALREADY EXISTS") {
					a9os_core_taskbar_popuparea.new("El nuevo nombre del tag para editar ya existe", false, "error");
					vfFilesContainer.click();
					return;
				}

				var expandTagsItem = vfFilesContainer.querySelector(".item[data-id='"+fileItemId+"'] .expand-tags");
				var fileTagData = response.files[fileItemId];
				core.preProcess(expandTagsItem, { arrItemTags : fileTagData });


				var addButton = expandTagsItem.querySelector(".add-button");
				var addDialog = expandTagsItem.querySelector(".add-dialog");

				addButton.classList.remove("hide");
				addDialog.classList.remove("show");
				addDialog.classList.remove("edit-mode");

				self.reloadAllTagsMenu(vfFilesContainer, response.allTags);
			},
			args : {
				response : false,
				fileItemId : fileItemId,
				vfFilesContainer : vfFilesContainer
			}
		}
	);
}

a9os_app_vf_modules_tags_folderaddon.getAllTagsMenu = (arrAllTags) => {
	var arrAllTagsMenu = [];
	for (var i = 0 ; i < arrAllTags.length ; i++){
		var currTag = arrAllTags[i];
		arrAllTagsMenu.push({
			name : currTag,
			action : "[a9os_app_vf_modules_tags_folderaddon].addNew.selectFromMenu",
			data : currTag
		});
	}

	return arrAllTagsMenu;
}

a9os_app_vf_modules_tags_folderaddon.reloadAllTagsMenu = (vfFilesContainer, arrAllTags) => {
	var arrAllTagsMenu = self.getAllTagsMenu(arrAllTags);

	var arrExpandTags = vfFilesContainer.querySelectorAll(".item .expand-tags");

	for (var i = 0 ; i < arrExpandTags.length ; i++) {
		var currExpandTag = arrExpandTags[i];
		var addDialog = currExpandTag.querySelector(".add-dialog");
		var addDialogTagInput = addDialog.querySelector("input.input-name");

		addDialogTagInput.setAttribute("data-menu", JSON.stringify(arrAllTagsMenu));
	}
}


a9os_app_vf_modules_tags_folderaddon.itemMenu = {};
a9os_app_vf_modules_tags_folderaddon.itemMenu.open = (event, tagItem) => {
	a9os_app_vf_window.folder.get("TAGS/"+tagItem.querySelector(".tag-name").textContent);

}
a9os_app_vf_modules_tags_folderaddon.itemMenu.openInNewWindow = (event, tagItem) => {
	core.link.push("/vf", { folder : "TAGS/"+tagItem.querySelector(".tag-name").textContent });
	
}
a9os_app_vf_modules_tags_folderaddon.itemMenu.edit = (event, tagItem) => {
	var vfFilesContainer = tagItem.goToParentClass("vf-files-container");
	var tagItemEditing = vfFilesContainer.querySelector(".expand-tags .item-tag.editing");
	if (tagItemEditing) return false;

	var expandTagsItem = tagItem.goToParentClass("expand-tags");

	tagItem.classList.add("editing");

	var addButton = expandTagsItem.querySelector(".add-button");
	var addDialog = expandTagsItem.querySelector(".add-dialog");
	var addDialogTagInput = addDialog.querySelector("input.input-name");
	var addDialogTagValue = addDialog.querySelector("input.input-value");

	addButton.classList.add("hide");
	addDialog.classList.add("show");
	addDialogTagInput.value = tagItem.querySelector(".tag-name").textContent;
	addDialogTagValue.value = tagItem.querySelector(".tag-value").textContent;

	addDialogTagInput.disabled = true;

	addDialog.classList.add("edit-mode");

}

a9os_app_vf_modules_tags_folderaddon.itemMenu.delete = (event, tagItem) => {
	var vfFilesContainer = tagItem.goToParentClass("vf-files-container");
	var fileItemId = vfFilesContainer.querySelector(".item.expand").getAttribute("data-id");
	var name = tagItem.querySelector(".tag-name").textContent;
	var value = tagItem.querySelector(".tag-value").textContent;
	var path = vfFilesContainer.getAttribute("data-path");
	core.sendRequest(
		"/vf/modules/tags/delete",
		{
			fileItemId : fileItemId,
			name : name,
			value : value,
			path : vfFilesContainer.getAttribute("data-path"),
		},
		{
			fn : (response, fileItemId ,vfFilesContainer) => {
				if (response == "NOT FOUND") {
					a9os_core_taskbar_popuparea.new("Tag no encontrado", false, "error");
					vfFilesContainer.click();
					return;
				}

				var expandTagsItem = vfFilesContainer.querySelector(".item[data-id='"+fileItemId+"'] .expand-tags");
				var fileTagData = response.files[fileItemId];
				core.preProcess(expandTagsItem, { arrItemTags : fileTagData });


				var addButton = expandTagsItem.querySelector(".add-button");
				var addDialog = expandTagsItem.querySelector(".add-dialog");

				addButton.classList.remove("hide");
				addDialog.classList.remove("show");
				addDialog.classList.remove("edit-mode");

				self.reloadAllTagsMenu(vfFilesContainer, response.allTags);
			},
			args : {
				response : false,
				fileItemId : fileItemId,
				vfFilesContainer : vfFilesContainer
			}
		}
	);
}

a9os_app_vf_modules_tags_folderaddon.tagSource = {};
a9os_app_vf_modules_tags_folderaddon.tagSource.vfFilesContainerOriginalMenu = false;
a9os_app_vf_modules_tags_folderaddon.tagSource.process = (vfFilesContainer, folderAddonData) => {
	var currPath = vfFilesContainer.getAttribute("data-path");
	var arrPath = currPath.split("/");
	arrPath[0] = arrPath[0].toUpperCase();

	if (self.tagSource.vfFilesContainerOriginalMenu
	&&  self.tagSource.vfFilesContainerOriginalMenu != vfFilesContainer.getAttribute("data-menu-r")
	&&  arrPath[0] != "TAGS")
		vfFilesContainer.setAttribute("data-menu-r", self.tagSource.vfFilesContainerOriginalMenu);

	if (arrPath[0] != "TAGS") return;

	vfFilesContainer.removeAttribute("data-vf-drop-area");
	var vfWindowComponent = vfFilesContainer.goToParentClass("component", "cmp");


	var arrAddressBarButtons = vfWindowComponent.querySelectorAll(".address-bar-buttons .button");
	for (var i = 0 ; i < arrAddressBarButtons.length ; i++) {
		arrAddressBarButtons[i].removeAttribute("data-vf-drop-area");
	}

	var newFolderActionButton = vfWindowComponent.querySelector(".left .action-buttons .item.new-folder");
	newFolderActionButton.classList.add("disabled");


	if (currPath.toUpperCase() == "TAGS/") {
		self.tagSource.tagfolderChanges(vfFilesContainer);
	} else {
		self.tagSource.tagFilesChanges(vfFilesContainer, folderAddonData.realPaths);
	}
}

a9os_app_vf_modules_tags_folderaddon.tagSource.tagfolderChanges = (vfFilesContainer) => {
	if (!self.tagSource.vfFilesContainerOriginalMenu) 
		self.tagSource.vfFilesContainerOriginalMenu = vfFilesContainer.getAttribute("data-menu-r");


	vfFilesContainer.setAttribute("data-menu-r", JSON.stringify([{
		"name" : "Actualizar",
		"action" : "refresh"
	}]));

	var arrFiles = vfFilesContainer.querySelectorAll("button.item");

	for (var i = 0 ; i < arrFiles.length ; i++) {
		var currFile = arrFiles[i];

		var currFileIcon = currFile.querySelector(".icon");
		currFileIcon.classList.remove("type-folder");
		currFileIcon.classList.add("type-tagfolder");

		var arrDataMenuFile = JSON.parse(currFile.getAttribute("data-menu-r"));
		for (var x = arrDataMenuFile.length - 1; x >= 0; x--) {
			if (["folder.rename", "folder.delete"].indexOf(arrDataMenuFile[x].action) != -1) {
				arrDataMenuFile.splice(x, 1);
			}

			if (arrDataMenuFile[x].action == "bookmark.addItem") arrDataMenuFile.splice(x+1, 1); //separator
		}


		currFile.setAttribute("data-menu-r", JSON.stringify(arrDataMenuFile));
		currFile.removeAttribute("data-vf-drop-area");
		a9os_core_main.moveEvent.remove(currFile);
	}
}

a9os_app_vf_modules_tags_folderaddon.tagSource.tagFilesChanges = (vfFilesContainer, arrRealPaths) => {
	var arrFiles = vfFilesContainer.querySelectorAll("button.item");
	for (var i = 0 ; i < arrFiles.length ; i++) {
		var currFile = arrFiles[i];
		currFile.setAttribute("data-path", arrRealPaths[currFile.getAttribute("data-id")]);

		var arrDataMenuFile = JSON.parse(currFile.getAttribute("data-menu-r"));
		for (var x = 0 ; x < arrDataMenuFile.length ; x++){
			var currDataMenuFile = arrDataMenuFile[x];
			if (currDataMenuFile.action == "file.openWith") {
				arrDataMenuFile.splice(x + 1, 0, {
					name : "Abrir carpeta de origen",
					action : "[a9os_app_vf_modules_tags_folderaddon].tagSource.openRealFolder",
					data : arrRealPaths[currFile.getAttribute("data-id")]
				});
			}
		}

		currFile.setAttribute("data-menu-r", JSON.stringify(arrDataMenuFile));
	}
}

a9os_app_vf_modules_tags_folderaddon.tagSource.openRealFolder = (event, currFile, itemData) => {
	var arrRealPath = itemData.split("/");
	arrRealPath.pop();
	var currRealPath = arrRealPath.join("/");
	core.link.push("/vf", { folder : currRealPath });
}

a9os_app_vf_modules_tags_folderaddon.saveasMods = {};
a9os_app_vf_modules_tags_folderaddon.saveasMods.process = (vfFilesContainer) => {

	if (vfFilesContainer.getAttribute("data-path").indexOf("TAGS/") === 0) {
		a9os_app_vf_main.catchBackendError("No se puede guardar archivos en carpetas de tags");
		a9os_app_vf_window.folder.get("/");
		return;
	}

	var vfWindowComponent = vfFilesContainer.goToParentClass("component", "cmp");
	var arrItemsReferTags = vfWindowComponent.querySelectorAll(".item[data-path^=\"TAGS/\"]");
	
	for (var i = 0 ; i < arrItemsReferTags.length ; i++) {
		var currItemReferTag = arrItemsReferTags[i];
		currItemReferTag.parentElement.removeChild(currItemReferTag);
	}
}

a9os_app_vf_modules_tags_folderaddon.tagBookmarks = {};
a9os_app_vf_modules_tags_folderaddon.tagBookmarks.process = (vfFilesContainer) => {
	var vfWindowComponent = vfFilesContainer.goToParentClass("component", "cmp");
	var bookmarkMenu = vfWindowComponent.querySelector(".left .bookmark-menu");
	//if (bookmarkMenu.hasAttribute("data-tags-folderaddon-processed")) return;

	var arrBookmarks = bookmarkMenu.querySelectorAll(".items .item");

	for (var i = 0 ; i < arrBookmarks.length ; i++) {
		var currBookmark = arrBookmarks[i];
		var currBookmarkPath = currBookmark.getAttribute("data-path");
		var arrBookmarkPath = currBookmarkPath.split("/");

		if (arrBookmarkPath[0] == "TAGS") {
			currBookmark.classList.add("type-bookmark");
			currBookmark.setAttribute("data-vf-drop-area", "false");
		}
	}


	//bookmarkMenu.setAttribute("data-tags-folderaddon-processed", true);
}