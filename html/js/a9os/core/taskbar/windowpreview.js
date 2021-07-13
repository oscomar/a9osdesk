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
a9os_core_taskbar_windowpreview.wpShowT = false;
a9os_core_taskbar_windowpreview.wpHideT = false;
a9os_core_taskbar_windowpreview.main = () => {
		var windowPreview = self.component.querySelector(".window-preview");

	core.addEventListener(windowPreview, "mouseenter", (event, windowPreview) => {
		if (self.wpHideT) clearTimeout(self.wpHideT);

		var taskbarItemId = windowPreview.getAttribute("data-taskbar-item-id");
		var hlWindow = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItemId+"']");

		if (window.a9os_core_window) a9os_core_window.highligthWindow(hlWindow);
	});
	core.addEventListener(windowPreview, "mouseleave", (event, windowPreview) => {
		if (self.wpShowT) clearTimeout(self.wpShowT);
		if (window.a9os_core_window) a9os_core_window.removeHighligthWindows();

		self.wpHideT = setTimeout((windowPreview) => {
			windowPreview.classList.remove("show");
			self.wpHideT = false;
		}, 400, windowPreview);
	});
	core.addEventListener(windowPreview, "click", (event, windowPreview) => {
		var taskbarItem = a9os_core_taskbar_windowlist.component.querySelector(".item[data-taskbar-item-id='"+windowPreview.getAttribute("data-taskbar-item-id")+"']");
		taskbarItem.click();
		windowPreview.classList.remove("show");
		if (window.a9os_core_window) a9os_core_window.removeHighligthWindows();
	});
}


a9os_core_taskbar_windowpreview.appendItem = (taskbarItem) => {
	var windowPreview = a9os_core_taskbar_windowpreview.component.querySelector(".window-preview");

	core.addEventListener(taskbarItem, "mouseenter", itemMouseOver, windowPreview);

	core.addEventListener(taskbarItem, "mouseleave", (event, taskbarItem, windowPreview) => {
		if (taskbarItem.classList.contains("pinned") && !taskbarItem.classList.contains("used"))  return;

		if (self.wpShowT) clearTimeout(self.wpShowT);

		self.wpHideT = setTimeout((windowPreview) => {
			windowPreview.classList.remove("show");
			self.wpHideT = false;
		}, 300, windowPreview);

	}, windowPreview);

	core.addEventListener(taskbarItem, "click", (event, taskbarItem, windowPreview) => {
		if (taskbarItem.classList.contains("pinned") && !taskbarItem.classList.contains("used"))  return;

		windowPreview.classList.remove("show");
		//itemMouseOver(event, taskbarItem);
	}, windowPreview);


	function itemMouseOver(event, taskbarItem, windowPreview) {
		if (taskbarItem.classList.contains("pinned") && !taskbarItem.classList.contains("used"))  return;
		
		if (!windowPreview.classList.contains("show")) {
			self.wpShowT = setTimeout((windowPreview) => {

				if (!a9os_core_main.isMobile()) {
					windowPreview.classList.add("show");
					fillItemData(taskbarItem);
					moveItem(taskbarItem);
				}

				self.wpShowT = false;
			}, 800, windowPreview);
		} else {
			if (!a9os_core_main.isMobile()) {			
				fillItemData(taskbarItem);
				moveItem(taskbarItem);
			}
		}

		if (self.wpHideT){
			clearTimeout(self.wpHideT);
			self.wpHideT = false;
		}
	}


	function fillItemData (taskbarItem) {
		windowPreview.querySelector(".name").textContent = taskbarItem.getAttribute("data-title");
		var taskbarItemId = taskbarItem.getAttribute("data-taskbar-item-id");

		var wind0w = a9os_core_main.mainDiv.querySelector(".window[data-taskbar-item-id='"+taskbarItemId+"']");
		var windowColor = wind0w.querySelector(".window-bar").getAttribute("data-window-color");

		windowPreview.setAttribute("data-taskbar-item-id", taskbarItemId);

		if (!windowColor) windowColor = "#444444";
		windowPreview.style.backgroundColor = windowColor;
		if (a9os_core_main.colorLogic.isLigther(windowColor)) {
			windowPreview.classList.add("dark-foreground");
		} else {
			windowPreview.classList.remove("dark-foreground");
		}

		if (windowColor.indexOf("rgba") != -1) {
			windowPreview.classList.add("transparent");
		} else {
			windowPreview.classList.remove("transparent");
		}


		var windowPreviewPreview = windowPreview.querySelector(".preview");
		var mainContent = wind0w.querySelector(".main-content");

		var viewPrevW = 0;
		var viewPrevH = 0;
		if (150*mainContent.offsetWidth/mainContent.offsetHeight < 200){
			viewPrevW = 150*mainContent.offsetWidth/mainContent.offsetHeight;
			viewPrevH = 150;
		} else {
			viewPrevW = 200;
			viewPrevH = 200*mainContent.offsetHeight/mainContent.offsetWidth;
		}
		windowPreviewPreview.style.width = viewPrevW;
		windowPreviewPreview.style.height = viewPrevH;

		var debugView = windowPreviewPreview.querySelector(".main-content");
		debugView.innerHTML = "";
		var cmpCloned = mainContent.querySelector("cmp").cloneNode(true);
		cmpCloned.classList.remove("component");
		debugView.appendChild(cmpCloned);

		if (wind0w.classList.contains("transparent")) debugView.classList.add("transparent");
		else debugView.classList.remove("transparent");

		debugView.style.width = mainContent.offsetWidth;
		debugView.style.height = mainContent.offsetHeight;

		var scaleW = viewPrevW/mainContent.offsetWidth;
		var scaleH = viewPrevH/mainContent.offsetHeight;
		debugView.style.transform = "scale("+scaleW+", "+scaleH+")";
		debugView.style.transformOrigin = "0 0";
	}

	function moveItem(taskbarItem) {
		var newLeft = taskbarItem.offsetLeft + taskbarItem.parentElement.parentElement.offsetLeft + 5 + taskbarItem.offsetWidth/2 - windowPreview.offsetWidth/2;
		if (newLeft < 10) {
			newLeft = 10;
		}
		windowPreview.style.left = newLeft;
	}
}

a9os_core_taskbar_windowpreview.closeWindowByMenu = (event, item) => {
	var windowPreview = a9os_core_taskbar_windowpreview.component.querySelector(".window-preview");
	
	windowPreview.classList.remove("show");
	self.wpHideT = false;
	a9os_core_taskbar_windowlist.closeWindowByMenu(event, item);
}