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
a9os_app_browser1_main.main = (data) => {
	
	if (data.fileExtensions) self.component.fileExtensions = data.fileExtensions;
	if (data.window) a9os_core_window.processWindowData(data);

	if (self.instanceToTab()) return;
	self.component.qtyTabs = 0;
	self.component.homeUrl = "/browser1/home";

	var webUrl = core.link.hash.get()["url"]||false;
	var webpageType = "web";
	if (!webUrl) {
		webUrl = core.link.hash.get()["file"]||false;
		webpageType = "file";
	}

	self.interface.init();
	self.newTab.add();

	if (webUrl) self.pageActions.openUrl(webUrl, webpageType);

}
a9os_app_browser1_main._closeWindow = () => {
	
	self.newTab.unsetTitleUpdateInterval();
	return true;
}

a9os_app_browser1_main.interface = {};
a9os_app_browser1_main.interface.init = () => {
	
	var newtabButton = self.component.querySelector(".header .tabs .newtab-button");
	a9os_core_main.addEventListener(newtabButton, "click", self.newTab.add);

	/*var backButton = self.component.querySelector(".header .main-bar .back");
	a9os_core_main.addEventListener(backButton, "click", self.headerActions.back);

	var forwardButton = self.component.querySelector(".header .main-bar .forward");
	a9os_core_main.addEventListener(forwardButton, "click", self.headerActions.forward);*/

	var refreshButton = self.component.querySelector(".header .main-bar .refresh");
	a9os_core_main.addEventListener(refreshButton, "click", self.headerActions.refresh);

	var addressBar = self.component.querySelector(".header .address-bar");
	a9os_core_main.addEventListener(addressBar, "keypress", a9os_app_browser1_main.headerActions.urlInput.keyEvent);
	a9os_core_main.addEventListener(addressBar, "focus", self.newTab.unsetTitleUpdateInterval);
	a9os_core_main.addEventListener(addressBar, "blur", self.newTab.setTitleUpdateInterval);


	/*var favoritesMenu = self.component.querySelector(".header .favorites-menu");
	a9os_core_main.addEventListener(favoritesMenu, "click", self.headerActions.favorites);*/

	self.newTab.setTitleUpdateInterval();
}

a9os_app_browser1_main.newTab = {};
a9os_app_browser1_main.newTab.add = (event, newtabButton, component) => {
		var component = component||self.component;

	var newTabDiv = component.querySelector(".templates .tab").cloneNode(true);
	var newContentDiv = component.querySelector(".templates .content-tab").cloneNode(true);
	var newTabId = ++self.component.qtyTabs;

	core.preProcess(newTabDiv, { tabId : newTabId, title : "Nueva Pestaña" });
	core.preProcess(newContentDiv, { tabId : newTabId, url : self.component.homeUrl });

	component.querySelector(".header .tabs .list").appendChild(newTabDiv);
	component.querySelector(".main-content").appendChild(newContentDiv);
	newTabDiv.classList.remove("opening");

	a9os_core_main.addEventListener(newContentDiv.querySelector("iframe"), "load", (event, iframe, newTabDiv, newContentDiv, newTabId) => {
		newTabDiv.classList.remove("loading");
		self.headerActions.urlInput.update(newTabDiv.getAttribute("data-tabid"));

	}, newTabDiv, newContentDiv, newTabId);

	self.tabActions.appendActions(newTabDiv);

	self.tabActions.select(newTabId);

	self.headerActions.urlInput.update();

	var refreshButton = self.component.querySelector(".header .main-bar .refresh");
	refreshButton.disabled = true;

	core.link.hash.set({
		url : null,
		file : null
	});

}

a9os_app_browser1_main.newTab.setTitleUpdateInterval = (event, addressBar) => {
	
	self.component.titleInterval = setInterval(() => {
		var selectedContent = self.component.querySelector(".main-content .content-tab.selected");
		var selectedTabDiv = self.component.querySelector(".header .tabs .list .tab.selected");
		if (!selectedContent) return;

		var iframe = selectedContent.querySelector("iframe");

		if (iframe.contentDocument && iframe.contentDocument.querySelector("head link[rel='shortcut icon']")) {
			var faviconUrl = iframe.contentDocument.querySelector("head link[rel='shortcut icon']").getAttribute("href");
			core.preProcess(selectedTabDiv, { title : iframe.contentDocument.title, faviconUrl : faviconUrl });
		}

		if (iframe.src != "about:blank" && iframe.src.indexOf(self.component.homeUrl) == -1) {		
			selectedContent.addressBarValue = iframe.src;
			self.headerActions.urlInput.update();
		}
	}, 500);	

}
a9os_app_browser1_main.newTab.unsetTitleUpdateInterval = (event, addressBar) => {
	
	if (self.component.titleInterval) {
		clearInterval(self.component.titleInterval);	
		self.component.titleInterval = false;
	}
}

a9os_app_browser1_main.headerActions = {}
a9os_app_browser1_main.headerActions.back = (event, backButton) => {
	
}
a9os_app_browser1_main.headerActions.forward = (event, forwardButton) => {
	
}
a9os_app_browser1_main.headerActions.refresh = (event, refreshButton) => {
		var selectedContent = self.component.querySelector(".main-content .content-tab.selected");

	self.pageActions.openUrl(selectedContent.addressBarValue, selectedContent.webpageType);
}
a9os_app_browser1_main.headerActions.favorites = (event, favoritesMenu) => {
	
}
a9os_app_browser1_main.headerActions.urlInput = {}
a9os_app_browser1_main.headerActions.urlInput.keyEvent = (event, addressBar) => {
	
	var selectedContent = self.component.querySelector(".main-content .content-tab.selected");
	var selectedTabId = selectedContent.getAttribute("data-tabid");

	selectedContent.addressBarValue = addressBar.value;

	if (event.which != 13) return;

	var address = addressBar.value;

	if (
		address.indexOf("http://") == -1 
	&&	address.indexOf("file://") == -1 
	&&	address.indexOf("https://") == -1 
	&&	address.indexOf("http://") != 0 
	&&	address.indexOf("file://") != 0 
	&&	address.indexOf("https://") != 0 
	&&	address.indexOf("/") != 0
	) {
		address = "http://"+address;
	}
	if (address.indexOf("/") == 0) address = "file://"+address;

	if (address.indexOf("http") == 0) {
		self.pageActions.openUrl(address, "web");
	}
}

a9os_app_browser1_main.headerActions.urlInput.update = (tabId) => {
	
	if (tabId) {
		var selectedContent = self.component.querySelector(".main-content .content-tab[data-tabid='"+tabId+"']");
		if (!self.component.querySelector(".main-content .content-tab[data-tabid='"+tabId+"'].selected")) return;
	} else {
		var selectedContent = self.component.querySelector(".main-content .content-tab.selected");
	}

	if (!selectedContent) return;


	var addressBar = self.component.querySelector(".header .address-bar");
	addressBar.value = selectedContent.addressBarValue||"";

	if (!selectedContent.webpageType || selectedContent.webpageType == "web") {
		addressBar.disabled = false;
	} else {
		addressBar.disabled = true;
	}


	if (selectedContent.webpageType == "web") {
		core.link.hash.set({ url : selectedContent.addressBarValue, file : null });
	} else if (selectedContent.webpageType == "file") {
		core.link.hash.set({ url : null, file : selectedContent.addressBarValue });
	} else {	
		core.link.hash.set({
			url : null,
			file : null
		});
	}

}

a9os_app_browser1_main.tabActions = {};
a9os_app_browser1_main.tabActions.select = (tabId) => {
	
	var tabToSelect = self.component.querySelector(".header .tabs .tab[data-tabid='"+tabId+"']");
	if (!tabToSelect) return false;
	var contentToSelect = self.component.querySelector(".main-content .content-tab[data-tabid='"+tabId+"']");

	var tabToUnselect = self.component.querySelector(".header .tabs .tab.selected");
	var contentTabToUnselect = self.component.querySelector(".main-content .content-tab.selected");
	if (tabToUnselect) {	
		tabToUnselect.classList.remove("selected");
		contentTabToUnselect.classList.remove("selected");
	}

	tabToSelect.classList.add("selected");
	contentToSelect.classList.add("selected");

	self.headerActions.urlInput.update();

	var refreshButton = self.component.querySelector(".header .main-bar .refresh");
	if (contentToSelect.addressBarValue) refreshButton.disabled = false;
}

a9os_app_browser1_main.tabActions.appendActions = (tabDiv) => {
		var tabId = tabDiv.getAttribute("data-tabid");

	a9os_core_main.addEventListener(tabDiv, "mousedown", (event, tabDiv) => {
		self.tabActions.select(tabId);
		if (event.button == "1") self.tabActions.close(tabId);
	});

	var closeBtn = tabDiv.querySelector(".close");
	a9os_core_main.addEventListener(closeBtn, "click", (event, closeBtn, tabId) => {
		self.tabActions.close(tabId);
	}, tabId);
}

a9os_app_browser1_main.tabActions.close = (tabId) => {
	
	var tabToClose = self.component.querySelector(".header .tabs .tab[data-tabid='"+tabId+"']");
	var contentToClose = self.component.querySelector(".main-content .content-tab[data-tabid='"+tabId+"']");
	if (!tabToClose) return false;

	var tabToSelect = tabToClose.nextSibling;
	if (!tabToSelect) tabToSelect = tabToClose.previousSibling;
	if (!tabToSelect) {
		a9os_core_window.close();
		return;
	}
	self.tabActions.select(tabToSelect.getAttribute("data-tabid"));
	tabToClose.classList.add("opening");
	setTimeout((tabToSelect, tabToClose, contentToClose) => {	

		tabToClose.parentElement.removeChild(tabToClose);
		contentToClose.parentElement.removeChild(contentToClose);

	}, 100, tabToSelect, tabToClose, contentToClose);

	return;
}

a9os_app_browser1_main.pageActions = {};
a9os_app_browser1_main.pageActions.openUrl = (url, webpageType) => {

	var tabSelected = self.component.querySelector(".header .tabs .tab.selected");
	var contentSelected = self.component.querySelector(".main-content .content-tab.selected");

	contentSelected.addressBarValue = url;
	contentSelected.webpageType = webpageType;

	self.headerActions.urlInput.update();

	tabSelected.classList.add("loading");

	var refreshButton = self.component.querySelector(".header .main-bar .refresh");
	if (contentSelected.addressBarValue) refreshButton.disabled = false;

	if (webpageType == "web") {
		core.preProcess(tabSelected, { title : url });
		core.preProcess(contentSelected, { url : url });
	} else {
		contentSelected.fileObserverId = a9os_app_vf_main.fileHandle.attach(
			self.component,
			{
				fn : (component) => {
					return { qty : "simple", type : "file", fileExtensions : component.fileExtensions };
				},
				args : {
					component : self.component
				}
			},
			false,
			{
				fn : (component, handle, tabSelected) => {
					core.preProcess(tabSelected, { title : a9os_core_main.splitFilePath(handle.path)[1] });

					var reader = new FileReader();
					reader.readAsText(handle.data);
					reader.onload = function() {
						var fileText = reader.result;
						
						var currIframe = component.querySelector(".content-tab.selected iframe");

						//currIframe.src = "about:blank";
						var currIframeContent = currIframe.contentWindow;
						currIframeContent.document.open();
						currIframeContent.document.write(fileText);
						currIframeContent.document.close();
					}
				},
				args : {
					component : self.component,
					handle : false,
					tabSelected : tabSelected
				}
			},
			false,
			{
				fn : self.pageActions.file.requestFileReload,
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
	}
}
a9os_app_browser1_main.pageActions.file = {};
a9os_app_browser1_main.pageActions.file.requestFileReload = (component, handle, registry, confirmCallback) => {
	
}

a9os_app_browser1_main.instanceToTab = () => {

	var webUrl = core.link.hash.get()["url"]||false;
	var webpageType = "web";
	if (!webUrl) {
		webUrl = core.link.hash.get()["file"]||false;
		webpageType = "file";
	}


	var browserInstances = a9os_core_main.component.querySelectorAll("cmp.component.a9os_app_browser1_main");

	if (browserInstances.length == 1) return false;

	a9os_core_main.removeWindow(self.component);

	setTimeout((browserInstances, webUrl, webpageType) => {
		a9os_core_main.selectWindow(browserInstances[ browserInstances.length-2 ]);

		self.newTab.add(false, false, browserInstances[ browserInstances.length-2 ]);
		if (webUrl) self.pageActions.openUrl(webUrl, webpageType);
	}, 100, browserInstances, webUrl, webpageType);

	return true;
}