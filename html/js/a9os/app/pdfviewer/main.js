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
a9os_app_pdfviewer_main.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);
	a9os_app_pdfviewer_main.handleFile(data);
}
a9os_app_pdfviewer_main.handleFile = (data) => {
	
	var fileExtensions = data.fileExtensions;
	self.component.fileHandleId = a9os_app_vf_main.fileHandle.attach(
		self.component,
		{
			fn : (c, fileExtensions) => {
				return { qty : "simple", type : "file", fileExtensions : fileExtensions };
			},
			args : {
				c : self.component,
				fileExtensions : fileExtensions
			}
		},
		false,
		{
			fn : (c, handle) => {
				if (!handle.data) return;
				
				c.querySelector("iframe").src = a9os_app_vf_main.fileHandle.getBlobUrl(handle.data);
				self._updateWindowData(handle.path);
			},
			args : {
				c : self.component,
				handle : false
			}
		},
		false,
		{
			fn : (component, handle, registry, confirmCallback) => {
				if (registry.action == "file_write") confirmCallback();
			},
			args : {
				component : self.component,
				handle : false,
				registry : false,
				confirmCallback : false
			}
		},
		{ //cancelFn
			fn : a9os_core_main.removeWindow,
			args : {
				component : self.component
			}
		}
	);

	if (!(core.link.hash.get()["file"]||false)) {
		a9os_app_vf_main.fileHandle.open(self.component, self.component.fileHandleId);
	}
}

a9os_app_pdfviewer_main._updateWindowData = (path) => {
	
	var arrPathName = a9os_core_main.splitFilePath(path);

	var originalTitle = a9os_core_window.getWindowData()["originalTitle"];
	var arrWindowTitle = [arrPathName[1], originalTitle];

	a9os_core_window.updateWindowData({ title : arrWindowTitle.join(" - ") });
}