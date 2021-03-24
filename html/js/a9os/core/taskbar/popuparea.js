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
a9os_core_taskbar_popuparea.main = (data) => {
	self.component.popupArea = self.component.querySelector(".popup-area");

	if (data.systemAnonMode != "demo") {	
		var welcomeMsg = "Bienvenido! Iniciá sesión desde el menú de inicio";
		if (a9os_user.user.name != "__anon__") {
			var welcomeMsg = "Hola "+a9os_user.user.name+"!";
		}
		self.new(welcomeMsg, "/resources/app-icon.svg");
	}
}


a9os_core_taskbar_popuparea.new = (popupHtml, popupIcon) => {
	
	var newPopup = document.createElement("div");
	newPopup.classList.add("popup");
	
	newPopup.classList.add("closed");
	setTimeout((p) => { p.classList.remove("closed") }, 10, newPopup);

	var iconStr = "";
	if (popupIcon) {
		iconStr = "<div class=\"icon\" style=\"background-image:url("+popupIcon+");\"></div>";
	}

	newPopup.innerHTML = iconStr + '<div class="text">' + popupHtml + '</div>';
	self.component.popupArea.appendChild(newPopup);
	
	a9os_core_main.addEventListener(newPopup, "click", (event, newPopup) => {
		self.close(newPopup);
	});

	a9os_core_main.addEventListener(newPopup, "mouseenter", (event, newPopup) => {
		if (newPopup.closeTimeout) clearTimeout(newPopup.closeTimeout);
	});
	a9os_core_main.addEventListener(newPopup, "mouseout", (event, newPopup) => {
		if (newPopup.closeTimeout) clearTimeout(newPopup.closeTimeout);
		newPopup.closeTimeout = setTimeout((newPopup) => {
			self.close(newPopup);
		}, 5000, newPopup);
	});

	newPopup.closeTimeout = setTimeout((newPopup) => {
		self.close(newPopup);
	}, 5000, newPopup);
}

a9os_core_taskbar_popuparea.close = (popup) => {
		
	popup.classList.add("closed");
	setTimeout((popup) => {
		if (popup.parentElement){
			self.component.popupArea.removeChild(popup);
		}
	}, 300, popup);
}


a9os_core_taskbar_popuparea.showDemoPopup = () => {
	var popupHtml = self.component.querySelector(".templates .demo-mode").innerHTML;
	var popupIcon = self.component.querySelector(".templates .demo-mode").getAttribute("data-icon");

	self.new(popupHtml, popupIcon);
}