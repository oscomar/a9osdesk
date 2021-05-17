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
a9os_app_vf_dialog.main = (data) => {
	
	if (data.window) a9os_core_window.processWindowData(data);

	var arrActionLabels = {
		confirmDeleteFile : {
			name : "¿Seguro que desea borrar el archivo?",
			icon : "/resources/a9os/app/vf/icons/files/file-icon-txt.svg"
		},
		confirmDeleteFolder : {
			name : "¿Seguro que desea borrar la carpeta?",
			icon : "/resources/a9os/app/vf/icons/files/folder-icon.svg"
		},
		confirmDeleteMulti : {
			name : "¿Seguro que desea borrar estos archivos?",
			icon : "/resources/a9os/app/vf/icons/files/multi-file-icon.svg"
		},
		confirmOverwrite : {
			name : "¿Sobreescribir?",
			icon : "/resources/a9os/app/vf/icons/files/file-icon-txt.svg"
		},
		confirmOverwriteFolder : {
			name : "¿Sobreescribir?",
			icon : "/resources/a9os/app/vf/icons/files/folder-icon.svg"
		},
		saveBeforeClose : {
			name : "¿Desea guardar los cambios?",
			icon : "/resources/a9os/app/vf/icons/files/file-icon-txt.svg"
		},
	};

	var arrHashData = core.link.hash.get();
	if (arrHashData["cdi"]) {
		arrHashData = a9os_core_main.windowCrossData.get(arrHashData["cdi"]);
	}
	if (arrHashData && Object.keys(arrHashData).length == 0)  {
		a9os_core_main.removeWindow(self.component);
		return;	
	}

	var arrActions = arrHashData["actions"];
	for (var i in arrActions) {
		var currAction = arrActions[i];

		self.addAction(i, currAction);
	}
	self.addCancelAction(arrHashData["cancelAction"]);
	
	var path = arrHashData["path"];

	if (Array.isArray(arrHashData["path"])) {
		path = arrHashData["path"].join("<br><br>");
	}
	
	core.preProcess(self.component, { 
		path : path,
		actionLabel : arrActionLabels[arrHashData["mode"]].name,
		icon : arrActionLabels[arrHashData["mode"]].icon
	});
}

a9os_app_vf_dialog._closeWindow = (event) => {
	
	return false;
}

a9os_app_vf_dialog.addCancelAction = (cci) => {
	
	self.addAction("__cancel", {
		name : "Cancelar",
		isCancel : true,
		cci : cci 
	});
}

a9os_app_vf_dialog.addAction = (actionName, arrAction) => {
	
	var newActionBtn = document.createElement("button");
	newActionBtn.classList.add("btn");
	if (arrAction.cci) {
		newActionBtn.setAttribute("data-cci", arrAction.cci);
	}
	if (arrAction.isCancel) {
		newActionBtn.setAttribute("data-is-cancel", "true");
	}
	newActionBtn.textContent = arrAction.name;
	a9os_core_main.addEventListener(newActionBtn, "click", (event, item) => {
		if (item.getAttribute("data-cci")) {
			self.excuteAction(item.getAttribute("data-cci"));
		}
		
		a9os_core_main.removeWindow(item.goToParentClass("window"), true);
	});

	self.component.querySelector(".actions").appendChild(newActionBtn);
	if (arrAction.selected) {
		setTimeout((newActionBtn) => {
			newActionBtn.focus();
		}, 200, newActionBtn);
	}
}

a9os_app_vf_dialog.excuteAction = (cci) => {
	
	a9os_core_main.windowCrossCallback.execute(cci);
}

a9os_app_vf_dialog.clearCrossCallbacks = () => {
	
	var arrActions = core.link.hash.get()["actions"];
	for (var i in arrActions) {
		a9os_core_main.windowCrossCallback.remove(arrActions[i].cci);
	}
	a9os_core_main.windowCrossCallback.remove(core.link.hash.get()["cancelAction"]);
}