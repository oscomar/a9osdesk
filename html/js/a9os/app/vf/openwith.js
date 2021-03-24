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
a9os_app_vf_openwith.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);

	var file = core.link.hash.get()["file"];
	fileExtension = a9os_core_main.getFileExtension(file);

	self.component.filePath = data.filePath;

	//core.parseHrefHandlers();
	self.attachItemListeners(fileExtension);

	self.checkIfAnyApp(data.apps);

}
a9os_app_vf_openwith.attachItemListeners = (fileExtension) => {
	
	a9os_core_main.addEventListener(self.component.querySelectorAll(".app-list .app"), "click", (event, item) => {
		
		if (self.component.querySelector(".as-default input").checked) {
			self.updateDefaultApp(item.getAttribute("data-app-id"), fileExtension, () => {

				a9os_app_vf_main.folderObserver.refresh();

				a9os_core_main.selectWindow(self.component);
				a9os_core_window.close();

				core.link.push(item.getAttribute("data-path"), JSON.parse(item.getAttribute("data-path-data")));
			});
		} else {
			a9os_core_window.close();
			core.link.push(item.getAttribute("data-path"), JSON.parse(item.getAttribute("data-path-data")));
		}


	});

	a9os_core_main.addEventListener(self.component.querySelector(".no-apps .download"), "click", (event, downloadButton, filePath) => {
		a9os_app_vf_main.fileHandle.download([filePath]);
		a9os_core_window.close();
	}, self.component.filePath);
}

a9os_app_vf_openwith.updateDefaultApp = (appId, fileExtension, cb) => {
	core.sendRequest(
		"/vf/updateDefaultApp",
		{
			appId : appId,
			fileExtension : fileExtension
		},
		{
			fn : (response, cb) => { cb(response); },
			args : {
				response : false,
				cb : cb
			}
		}
	);
}

a9os_app_vf_openwith.checkIfAnyApp = (arrApps) => {
	if (arrApps.length == 0){
		self.component.querySelector(".no-apps").classList.add("show");
		self.component.querySelector(".as-default").classList.remove("show");
	}
}