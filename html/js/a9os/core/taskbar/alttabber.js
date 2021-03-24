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
a9os_core_taskbar_alttabber.main = () => {
	
	a9os_core_main.kbShortcut.add(a9os_core_taskbar_alttabber.component, [
		{
			shortcut : ["shift", "tab"], 
			action : {
				fn : self.showAndSwitch,
				args : { }
			}
		}
	]);

	a9os_core_main.addEventListener(document.body, "keyup", (event, component) => {
		if (event.which == 16 && self.component.altTabber.classList.contains("show")) {
			self.select();
		}
	});

	self.component.altTabber = self.component.querySelector(".alttabber");
}

a9os_core_taskbar_alttabber.showAndSwitch = () => {
		if (self.component.altTabber.classList.contains("show")){
		self.moveForward();
	} else {
		self.openAndLoad();
	}

}
a9os_core_taskbar_alttabber.openAndLoad = () => {
	
	var nodeListWindows = a9os_core_main.mainDiv.querySelectorAll(".window");
	if (nodeListWindows.length < 2) return;
	if (a9os_core_main.mainDiv.querySelector(".window.fullscreen")) return;

	var arrWindows = [];
	for (var i = 0 ; i < nodeListWindows.length ; i++) {
		arrWindows.push(nodeListWindows[i]);
	}

	arrWindows.sort((a, b) => {
		return parseInt(b.style.zIndex) - parseInt(a.style.zIndex);
	});
	
	var itemsContainer = self.component.querySelector(".items");
	itemsContainer.innerHTML = "";
	for (var i = 0 ; i < arrWindows.length ; i++) {
		var currWindow = arrWindows[i];
		var currWindowTaskbarItemId = currWindow.getAttribute("data-taskbar-item-id");
		var currWindowIcon = currWindow.querySelector(".nav-icon img").src;
		var currWindowTitle = currWindow.querySelector(".window-bar .title").textContent;
		var currWindowColor = currWindow.querySelector(".window-bar").getAttribute("data-window-color");

		var newItem = document.createElement("div");
		newItem.classList.add("item");
		newItem.setAttribute("data-title", currWindowTitle);
		newItem.setAttribute("data-taskbar-item-id", currWindowTaskbarItemId);
		newItem.setAttribute("data-window-color", currWindowColor);
		newItem.style.backgroundImage = "url("+currWindowIcon+")";

		itemsContainer.appendChild(newItem);
		if (i == 0) {
 			newItem.classList.add("selected");
 			self.udpateIndicator(newItem);
		}

		a9os_core_main.addEventListener(newItem, "click", self.selectByClick);
	}
	
	self.component.altTabber.style.left = "calc(50% - "+(self.component.altTabber.offsetWidth/2)+"px)";
	self.component.altTabber.style.width = self.component.altTabber.offsetWidth;

	self.component.altTabber.classList.add("show");
	self.moveForward();

}

a9os_core_taskbar_alttabber.moveForward = () => {
	
	var arrItems = self.component.querySelectorAll(".items .item");
	if (arrItems.length == 1) {
		self.udpateIndicator(arrItems[0]);
		return;
	}

	for (var i = 0 ; i < arrItems.length ; i++) {
		var currItem = arrItems[i];

		if (currItem.classList.contains("selected")) {
			currItem.classList.remove("selected");
			if (arrItems[i+1]) {
				arrItems[i+1].classList.add("selected");
				self.udpateIndicator(arrItems[i+1]);
			} else {
				arrItems[0].classList.add("selected");
				self.udpateIndicator(arrItems[0]);
			}
			break;
		}
	}

}

a9os_core_taskbar_alttabber.udpateIndicator = (item) => {
	
	var indicator = self.component.querySelector(".indicator");
	var titleContainer = self.component.querySelector(".name");
	indicator.style.left = item.offsetLeft;
	indicator.style.top = item.offsetTop + item.parentElement.offsetTop;
	titleContainer.textContent = item.getAttribute("data-title");

	var itemColor = item.getAttribute("data-window-color");
	if (itemColor == "null") itemColor = "#999";
	self.component.altTabber.style.backgroundColor = itemColor;

	if (a9os_core_main.colorLogic.isLigther(itemColor)) {
		self.component.altTabber.classList.add("dark-foreground");
	} else {
		self.component.altTabber.classList.remove("dark-foreground");
	}

	if (itemColor.indexOf("rgba") != -1) {
		self.component.altTabber.classList.add("transparent");
	} else {
		self.component.altTabber.classList.remove("transparent");
	}

	var taskbarItemId = item.getAttribute("data-taskbar-item-id");
	var hlWindow = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItemId+"']");

	a9os_core_window.highligthWindow(hlWindow);
}

a9os_core_taskbar_alttabber.select = () => {
	
	var selectedItem = self.component.querySelector(".items .item.selected");
	a9os_core_main.selectWindow(a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+selectedItem.getAttribute("data-taskbar-item-id")+"']"));
	self.close();
}

a9os_core_taskbar_alttabber.selectByClick = (event, item) => {
	
	a9os_core_main.selectWindow(a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+item.getAttribute("data-taskbar-item-id")+"']"));
	self.close();
}

a9os_core_taskbar_alttabber.close = () => {
	
	self.component.altTabber.classList.remove("show");
	self.component.altTabber.style.width = "";

	var indicator = self.component.querySelector(".indicator");
	indicator.style.left = 0;

	a9os_core_window.removeHighligthWindows();
}