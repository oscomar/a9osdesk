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

	core.addEventListener(document.body, "keyup", (event, component) => {
		if (event.which == 16 && self.component.altTabber.classList.contains("show")) {
			self.select();
		}
	});

	self.component.altTabber = self.component.querySelector(".alttabber");

	self.component.arrMinimizedWindows = [];

	self.component.arrWindows = [];

	self.component.resetWindowPositionsAfterAnimTimeout = 0;
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

	self.component.arrWindows = arrWindows;

	if (self.component.resetWindowPositionsAfterAnimTimeout) {
		clearTimeout(self.component.resetWindowPositionsAfterAnimTimeout);
		self.realWindowAnimation.resetWindowPositionsAfterAnim();
	}

	self.component.querySelector(".alttabber-blockover").classList.add("show");
	self.component.querySelector(".alttabber-background").classList.add("show");
	self.component.querySelector(".alttabber-background-grid").classList.add("show");

	a9os_core_main.mainDiv.classList.add("alttabber-mode");





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

		core.addEventListener(newItem, "click", self.selectByClick);

		if (currWindow.classList.contains("minimized")) {
			self.component.arrMinimizedWindows.push(currWindow);
			currWindow.classList.remove("minimized");
		}


		var tmpWindowAlttaberScale = ((a9os_core_main.mainDiv.offsetHeight - 100) / (currWindow.offsetHeight+300)) ;
		currWindow.style.setProperty("--tmp-alttabber-zoom-factor", tmpWindowAlttaberScale);
		currWindow.style.setProperty("--tmp-alttabber-offsetwidth", currWindow.offsetWidth+"px");
		currWindow.style.setProperty("--tmp-alttabber-origtop", currWindow.style.top+"px");
		if (i == 0) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 1);
		}
		else if (i == 1) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 2);
		}
		else if (i == 2) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 3);
		}
		else {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, -1);
		}

	}
	
	self.component.altTabber.style.left = "calc(50% - "+(self.component.altTabber.offsetWidth/2)+"px)";
	self.component.altTabber.style.width = self.component.altTabber.offsetWidth;

	if (window.a9os_core_taskbar)a9os_core_taskbar.component.querySelector(".taskbar").style.opacity = 0;

	self.component.altTabber.classList.add("show");
	self.moveForward();

}

a9os_core_taskbar_alttabber.moveForward = () => {
	
	var arrItems = self.component.querySelectorAll(".items .item");
	if (arrItems.length == 1) { // nunca
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
	
	self.realWindowAnimation.moveForward();

}

a9os_core_taskbar_alttabber.udpateIndicator = (item) => {
	
	var indicator = self.component.querySelector(".indicator");
	var titleContainer = self.component.querySelector(".name");
	indicator.style.left = item.offsetLeft;
	indicator.style.top = item.offsetTop + item.parentElement.offsetTop;
	titleContainer.textContent = item.getAttribute("data-title");


	var itemColor = item.getAttribute("data-window-color");
	if (itemColor == "null") itemColor = "#999";
	self.component.querySelector(".alttabber-background-grid").style.backgroundColor = itemColor;

	if (a9os_core_main.colorLogic.isLigther(itemColor)) {
		self.component.querySelector(".alttabber-background-grid").classList.add("dark-foreground");
		self.component.altTabber.classList.add("dark-foreground");
	} else {
		self.component.querySelector(".alttabber-background-grid").classList.remove("dark-foreground");
		self.component.altTabber.classList.remove("dark-foreground");
	}

	if (itemColor.indexOf("rgba") != -1) {
		self.component.querySelector(".alttabber-background-grid").classList.add("transparent");
	} else {
		self.component.querySelector(".alttabber-background-grid").classList.remove("transparent");
	}



	var taskbarItemId = item.getAttribute("data-taskbar-item-id");
	var hlWindow = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItemId+"']");

	//a9os_core_window.highligthWindow(hlWindow);
}

a9os_core_taskbar_alttabber.select = () => {
	self.resetWindowPositions();
	var selectedItem = self.component.querySelector(".items .item.selected");
	a9os_core_main.selectWindow(a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+selectedItem.getAttribute("data-taskbar-item-id")+"']"));
	self.close();
}

a9os_core_taskbar_alttabber.selectByClick = (event, item) => {
	self.resetWindowPositions();
	a9os_core_main.selectWindow(a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+item.getAttribute("data-taskbar-item-id")+"']"));
	self.close();
}

a9os_core_taskbar_alttabber.close = () => {

	self.component.altTabber.classList.remove("show");
	self.component.altTabber.style.width = "";

	var indicator = self.component.querySelector(".indicator");
	indicator.style.left = 0;

	//a9os_core_window.removeHighligthWindows();
}

a9os_core_taskbar_alttabber.resetWindowPositions = () => {
	var nodeListWindows = a9os_core_main.mainDiv.querySelectorAll(".window");
	if (nodeListWindows.length < 2) return;
	if (a9os_core_main.mainDiv.querySelector(".window.fullscreen")) return;


	self.realWindowAnimation.resetWindowPositions();
}


a9os_core_taskbar_alttabber.realWindowAnimation = {};
a9os_core_taskbar_alttabber.realWindowAnimation.moveForward = () => {
	var arrWindows = self.component.arrWindows;

	var flagLastSeenWin = false;
	for (var i = 0 ; i < arrWindows.length ; i++) {
		var currWindow = arrWindows[i];

		if (currWindow.classList.contains("aix0")) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, -1);
		} else if (currWindow.classList.contains("aix1")) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 0);

			if (arrWindows.length == 4) {
				self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, -1);
			} else if (arrWindows.length == 3) {
				self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 3);
			} else if (arrWindows.length == 2) {
				self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 2);
			}
		} else if (currWindow.classList.contains("aix2")) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 1);

		} else if (currWindow.classList.contains("aix3") && !flagLastSeenWin) {
			self.realWindowAnimation.setWindowStyleByTabberIdx(currWindow, 2);

			flagLastSeenWin = true;
			if (arrWindows[i+1] && arrWindows[i+1].classList.contains("aix-1")) {
				self.realWindowAnimation.setWindowStyleByTabberIdx(arrWindows[i+1], 3);

			} else if (!arrWindows[i+1] && arrWindows[0]) {
				self.realWindowAnimation.setWindowStyleByTabberIdx(arrWindows[0], 3);
			}
		}
	}
}
a9os_core_taskbar_alttabber.realWindowAnimation.resetWindowPositions = () => {

	var arrWindows = self.component.arrWindows;

	for (var i = 0 ; i < arrWindows.length ; i++) {
		var currWindow = arrWindows[i];

		currWindow.classList.remove("aix1");
		currWindow.classList.remove("aix2");
		currWindow.classList.remove("aix3");
		currWindow.classList.remove("aix0");
		currWindow.classList.remove("aix-1");

	}

	for (var i = 0 ; i < self.component.arrMinimizedWindows.length ; i++) {
		self.component.arrMinimizedWindows[i].classList.add("minimized");
	}
	self.component.arrMinimizedWindows = [];

	if (window.a9os_core_taskbar) a9os_core_taskbar.component.querySelector(".taskbar").style.opacity = 1;

	self.component.querySelector(".alttabber-blockover").classList.remove("show");
	self.component.querySelector(".alttabber-background").classList.remove("show");
	self.component.querySelector(".alttabber-background-grid").classList.remove("show");

	a9os_core_main.mainDiv.classList.remove("alttabber-mode");
	self.component.resetWindowPositionsAfterAnimTimeout = setTimeout(self.realWindowAnimation.resetWindowPositionsAfterAnim, 350);
}
a9os_core_taskbar_alttabber.realWindowAnimation.resetWindowPositionsAfterAnim = () => {
	var arrWindows = self.component.arrWindows;

	for (var i = 0 ; i < arrWindows.length ; i++) {
		var currWindow = arrWindows[i];

		currWindow.classList.remove("alttabber-idx");
		currWindow.style.removeProperty("--tmp-alttabber-zoom-factor");
		currWindow.style.removeProperty("--tmp-alttabber-offsetwidth");
		currWindow.style.removeProperty("--tmp-alttabber-origtop");
	}
	self.component.resetWindowPositionsAfterAnimTimeout = 0;
}


a9os_core_taskbar_alttabber.realWindowAnimation.setWindowStyleByTabberIdx = (currWindow, altTabberIdx) => {
	currWindow.classList.remove("aix1");
	currWindow.classList.remove("aix2");
	currWindow.classList.remove("aix3");
	currWindow.classList.remove("aix0");
	currWindow.classList.remove("aix-1");

	currWindow.classList.add("alttabber-idx");
	currWindow.classList.add("aix"+altTabberIdx);
}