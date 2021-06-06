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
a9os_app_texteditor_main.main = (data) => {
	
	if (data.window) a9os_core_window.processWindowData(data, [
		{
			shortcut : ["ctrl", "S"],
			action : {
				fn : self.file.save,
				args : { }
			}
		},
		{
			shortcut : ["ctrl", "shift", "S"],
			action : {
				fn : self.file.saveAs,
				args : { }
			}
		},
		{
			shortcut : ["ctrl", "shift", "F"],
			action : {
				fn : self.file.new,
				args : { }
			}
		},
		{
			shortcut : ["ctrl", "O"],
			action : {
				fn : self.file.open,
				args: {}
			}
		}
	]);

	a9os_core_window.setMenuBar({
		Archivo : [
			{
				name : "Nuevo",
				action : "file.new",
				shortcut : ["Ctrl", "Shift", "F"]
			},
			"separator",
			{
				name : "Abrir",
				action : "file.open",
				shortcut : ["Ctrl", "O"]
			},
			{
				name : "Guardar",
				action : "file.save",
				shortcut : ["Ctrl", "S"]
			},
			{
				name : "Guardar Como...",
				action : "file.saveAs",
				shortcut : ["Ctrl", "Shift", "S"]
			},
			"separator",
			{
				name : "Salir",
				action : "close",
			}
		],
		Ayuda : [
			{
				name : "Acerca de",
				action : "about.show"
			}
		]
	});


	if (data.fileExtensions) self.component.fileExtensions = data.fileExtensions;

	self.file.handle();

	a9os_core_main.addEventListener(self.component.querySelector("textarea"), "keydown", (event, textarea) => {
		if (event.which == 9) {
			textarea.value += "\t";
			event.preventDefault();
		}
	});
}

a9os_app_texteditor_main._closeWindow = (event) => {
	
	if (self.file.fileModified.get()) {
		a9os_app_vf_main.fileHandle.close(self.component, self.component.fileHandleId, {
			fn : (component, event) => {
				a9os_core_main.removeWindow(component);
			},
			args : {
				component : self.component,
				event : event
			}
		})
	} else {
		return true;
	}

	return false;
}


a9os_app_texteditor_main.file = {};
a9os_app_texteditor_main.file.handle = () => {
	
	self.component.fileHandleId = a9os_app_vf_main.fileHandle.attach(
		self.component,
		{
			fn : self.file.getConfigData,
			args : {
				component : self.component
			}
		},
		{
			fn : self.file.putFileData,
			args : {
				component : self.component
			}
		},
		{
			fn : self.file.getFileData,
			args : {
				component : self.component,
				handle : false
			}
		},
		{
			fn : self.file.fileModified.get,
			args : {}
		},
		{
			fn : self.file.requestFileReload,
			args : {
				component : self.component,
				handle : false,
				registry : false,
				confirmCallback : false
			}
		},
		{ //cancelFn
			fn : a9os_core_main.selectWindow,
			args : {
				component : self.component
			}
		}
	);

	self.component.querySelector(".main").setAttribute("data-vf-drop-area", self.component.fileHandleId);

	a9os_app_texteditor_main.file.fileModified.attach();
	a9os_app_texteditor_main.file.fileModifiedPopupAttach();
}

a9os_app_texteditor_main.file.getConfigData = (component) => {
	return { qty : "simple", type : "file", fileExtensions : component.fileExtensions, dropType : "single", openSaveasFromPath : component.handlePath }
}

a9os_app_texteditor_main.file.putFileData = (component) => {
		return self.component.querySelector("textarea").value;
}

a9os_app_texteditor_main.file.getFileData = (component, handle) => {
	
	self.file._updateWindowData(handle.path);
	component.handlePath = handle.path;

	if (!handle.data) {
		self.textarea.clear();
		return;
	}

	var reader = new FileReader();
	reader.readAsText(handle.data);
	reader.onload = function() {
		var fileText = reader.result;
		self.textarea.set(reader.result);
		self.file.fileModified.set(false);
	}
}

a9os_app_texteditor_main.file._updateWindowData = (path) => {
	
	var arrPathName = a9os_core_main.splitFilePath(path);

	var originalTitle = a9os_core_window.getWindowData()["originalTitle"];
	var arrWindowTitle = [arrPathName[1], originalTitle];

	a9os_core_window.updateWindowData({ title : arrWindowTitle.join(" - ") });
}


a9os_app_texteditor_main.file.fileModifiedPopupAttach = () => {
	
	var reloadBtn = self.component.querySelector(".filechange-popup .btn.reload");
	var cancelBtn = self.component.querySelector(".filechange-popup .btn.cancel");

	a9os_core_main.addEventListener(cancelBtn, "click", (event, cancelBtn) => {
		self.component.querySelector(".filechange-popup").classList.remove("show");
	});

	a9os_core_main.addEventListener(reloadBtn, "click", (event, reloadBtn) => {
		if (self.component.confirmCallback) self.component.confirmCallback();
		self.component.querySelector(".filechange-popup").classList.remove("show");
	});
}

a9os_app_texteditor_main.file.requestFileReload = (component, handle, registry, confirmCallback) => {
	if (registry.action != "file_write") return;

	
	component.confirmCallback = confirmCallback;

	if (component.querySelector(".filechange-popup input").checked) {
		confirmCallback();
		return;
	}

	component.querySelector(".filechange-popup").classList.add("show");
}


a9os_app_texteditor_main.file.new = () => {
	
	a9os_app_vf_main.fileHandle.new(self.component, self.component.fileHandleId);
}
a9os_app_texteditor_main.file.open = () => {
	
	a9os_app_vf_main.fileHandle.open(self.component, self.component.fileHandleId);
}

a9os_app_texteditor_main.file.save = () => {
	
	a9os_app_vf_main.fileHandle.save(self.component, self.component.fileHandleId, {
		fn : (handle) => {
			a9os_app_texteditor_main.file.fileModified.set(false)
		},
		args : {
			handle : false
		}
	});
}

a9os_app_texteditor_main.file.saveAs = () => {
	
	a9os_app_vf_main.fileHandle.saveAs(self.component, self.component.fileHandleId, {
		fn : (handle) => {
			a9os_app_texteditor_main.file.fileModified.set(false)
		},
		args : {
			handle : false
		}
	});
}

a9os_app_texteditor_main.file.fileModified = {};

a9os_app_texteditor_main.file.fileModified.get = () => {
		if (!self.component.isFileModified) self.component.isFileModified = false;

	return self.component.isFileModified;
}

a9os_app_texteditor_main.file.fileModified.set = (v) => {
	//console.error("PRUE");
	self.file.fileModified.editWinTitle(v);
	return self.component.isFileModified = v;
}

a9os_app_texteditor_main.file.fileModified.attach = () => {
	var component = a9os_app_texteditor_main.component;
	a9os_app_texteditor_main.file.fileModified.set(false);

	a9os_core_main.addEventListener(
		component.querySelector("textarea"),
		"keyup",
		(event, item) => {
			a9os_app_texteditor_main.file.fileModified.set(true);
		}
	);
}

a9os_app_texteditor_main.file.fileModified.editWinTitle = (val) => {
	a9os_core_main.selectWindow(self.component);
	var currWindowtitle = a9os_core_window.getWindowData()["title"];
	var currentFilepath = currWindowtitle.split(" - ")[0];
	currentFilepath = currentFilepath.split(" * ")[0];

	var originalTitle = a9os_core_window.getWindowData()["originalTitle"];
	var edited = "";
	if (val) edited = " * ";
	var arrWindowTitle = [currentFilepath+edited, originalTitle];

	a9os_core_window.updateWindowData({ title : arrWindowTitle.join(" - ") });
}


a9os_app_texteditor_main.textarea = {};
a9os_app_texteditor_main.textarea.clear = () => {
		self.component.querySelector("textarea").value = "";
}
a9os_app_texteditor_main.textarea.set = (text) => {
		self.component.querySelector("textarea").value = text;
}
a9os_app_texteditor_main.textarea.get = () => {
		return self.component.querySelector("textarea").value;
}

a9os_app_texteditor_main.close = () => {
	a9os_core_window.close();
}