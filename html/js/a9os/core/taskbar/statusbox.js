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
a9os_core_taskbar_statusbox.main = () => {
	
	self.statusBox = self.component.querySelector(".statusbox");
	self.closeFn = false;

	var closeEvent = (event, main) => {
		var currClickElement = event.composedPath()[0];
		if (!self.statusBox.contains(currClickElement) && !a9os_core_taskbar_notifarea.component.contains(currClickElement) && self.isShown()) {

			var currShownNotifItem = a9os_core_taskbar_notifarea.component.querySelector(".selected");
			for (var i = 0 ; i < self.arrNotifItems.length ; i++) {
				if (currShownNotifItem == self.arrNotifItems[i].notifItem) {
					self.close(true);
					self.arrNotifItems[i].notifItem.classList.remove("selected");
					return;
				}
			}
		}
	};

	core.addEventListener(a9os_core_main.mainDiv, "mousedown", closeEvent);
	core.addEventListener(a9os_core_main.mainDiv, "touchstart", closeEvent);
}

a9os_core_taskbar_statusbox.arrNotifItems = [];

a9os_core_taskbar_statusbox.append = (notifItem, boxNode, loadFn, closeFn) => {
	var closeFn = closeFn||false;
	
	self.arrNotifItems.push({
		notifItem : notifItem,
		closeFn : closeFn,
		boxNode : boxNode,
		shown : false
	});

	core.addEventListener(notifItem, "click", (event, notifItem, boxNode, loadFn, closeFn, currArrNotifItem) => {
		if (notifItem.classList.contains("selected")) {
			self.close(true);
			notifItem.classList.remove("selected");
			return;
		}

		for (var i = 0 ; i < self.arrNotifItems.length ; i++){ // old selected to new selected
			var currNotifItem = self.arrNotifItems[i];
			if (!currNotifItem.notifItem.classList.contains("selected")) continue;

			currNotifItem.notifItem.classList.remove("selected");
			self.statusBox.classList.add("sliding");
			self.close();
			setTimeout((currArrNotifItem, boxNode, loadFn) => {
				self.statusBox.classList.remove("sliding");

				self.statusBox.classList.add("sliding2");
				self.statusBox.innerHTML = "";
				var boxNodeInStbox = boxNode.cloneNode(true);
				self.statusBox.appendChild(boxNodeInStbox);

				core.callCallback(loadFn, {
					boxNode : boxNodeInStbox
				});

				currArrNotifItem.shown = true;

			}, 200, currArrNotifItem, boxNode, loadFn);

			setTimeout(() => {
				self.statusBox.classList.remove("sliding2");
			}, 400);

			notifItem.classList.add("selected");
			self.indicator.update();
			return;
		}

		notifItem.classList.add("selected");
		self.indicator.update();

		setTimeout((loadFn, boxNode, currArrNotifItem) => {
			self.statusBox.innerHTML = "";
			var boxNodeInStbox = boxNode.cloneNode(true);
			self.statusBox.appendChild(boxNodeInStbox);
			self.statusBox.classList.add("show");
			core.callCallback(loadFn, {
				boxNode : boxNodeInStbox
			});

			currArrNotifItem.shown = true;

		}, 50, loadFn, boxNode, currArrNotifItem);
	}, boxNode, loadFn, closeFn, self.arrNotifItems[self.arrNotifItems.length-1]);

}

a9os_core_taskbar_statusbox.close = (closeAll) => {
		var arrNotifItems = self.arrNotifItems;

	for (var i = 0 ; i < arrNotifItems.length ; i++) {
		var currNotifItem = arrNotifItems[i];
		if (currNotifItem.shown == true) {
			if (currNotifItem.closeFn) core.callCallback(currNotifItem.closeFn, {
				boxNode : self.statusBox.children[0]
			});
			currNotifItem.shown = false;
			break;
		}
	}

	if (closeAll) {
		self.statusBox.classList.remove("show");
		self.indicator.close();
	}

}

a9os_core_taskbar_statusbox.isShown = () => {
		return self.statusBox.classList.contains("show");

}

a9os_core_taskbar_statusbox.indicator = {};
a9os_core_taskbar_statusbox.indicator.update = () => {
	
	var notifarea = a9os_core_taskbar_notifarea.component.querySelector(".notif-area");
	var indicator = notifarea.querySelector(".statusbox-indicator");

	indicator.classList.add("show");
	for (var i = 0 ; i < self.arrNotifItems.length ; i++){
		var currItem = self.arrNotifItems[i].notifItem;

		if (currItem.classList.contains("selected")) {
			indicator.style.left = currItem.offsetLeft;
			indicator.style.width = currItem.offsetWidth;
			break;
		}
	}
}

a9os_core_taskbar_statusbox.indicator.close = () => {
		var notifarea = a9os_core_taskbar_notifarea.component.querySelector(".notif-area");
	var indicator = notifarea.querySelector(".statusbox-indicator");

	indicator.classList.remove("show");
	indicator.style.left = 0;
	indicator.style.width = "100%";
}