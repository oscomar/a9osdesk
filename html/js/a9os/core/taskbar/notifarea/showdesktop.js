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
a9os_core_taskbar_notifarea_showdesktop.main = () => {
	
	var showDesktopDiv = self.component.querySelector(".show-desktop");

	core.addEventListener(showDesktopDiv, "click", self.alter);

	core.addEventListener(showDesktopDiv, "mouseenter", () => {
		self.component.hlTimeout = setTimeout(() => {
			if (window.a9os_core_window) a9os_core_window.highligthWindow();
		}, 300);
	});
	core.addEventListener(showDesktopDiv, "mouseleave", () => {
		if (self.component.hlTimeout) {
			clearTimeout(self.component.hlTimeout);	
			self.component.hlTimeout = false;
		}
		if (window.a9os_core_window) a9os_core_window.removeHighligthWindows();
	});

}

a9os_core_taskbar_notifarea_showdesktop.alter = (event) => {
	
	var elem = self.component.querySelector(".show-desktop");

	var arrWindows = a9os_core_main.mainDiv.querySelectorAll("cmp.a9os_core_window > .window");

	if (window.a9os_core_window) a9os_core_window.removeHighligthWindows();

	if (elem.hasAttribute("data-on")){
		elem.removeAttribute("data-on");
		arrWindows.forEach((wind0w) => {
			if (wind0w.hasAttribute("data-prevent-all-restore")){
				wind0w.removeAttribute("data-prevent-all-restore");
				return;
			}
			a9os_core_window.minimizeRestoreWindow(wind0w);
		});
	} else {
		elem.setAttribute("data-on", true);
		arrWindows.forEach((wind0w) => {
			if (wind0w.classList.contains("minimized")){
				wind0w.setAttribute("data-prevent-all-restore", true);
				return;
			}
			a9os_core_window.minimizeWindow(wind0w);
		});
	}
}