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
a9os_core_taskbar.main = (data) => {
	//a9os_core_taskbar.altTabber.init();
	a9os_core_main.kbShortcut.add(a9os_core_taskbar.component, [
		{
			shortcut : ["meta"],
			action : {
				fn : a9os_core_taskbar_applist.toggle,
				args : {
					event : false
				}
			}
		},
		{
			shortcut : ["Rmeta"],
			action : {
				fn : a9os_core_taskbar_applist.toggle,
				args : {
					event : false
				}
			}
		}
	]);
}

a9os_core_taskbar.showDesktopAlter = (event) => { // from start right menu
	a9os_core_taskbar_notifarea_showdesktop.alter(event);
}


a9os_core_taskbar.updateBackgroundColor = () => {
		setTimeout(() => {
		var taskbar = a9os_core_taskbar.component.querySelector(".taskbar")

		var selectedWindow = a9os_core_main.mainDiv.querySelector(".window.top-window");
		if (selectedWindow) {
			var windowBar = selectedWindow.querySelector(".window-bar");
			if (windowBar.hasAttribute("data-window-color")) {
				setColor(windowBar.getAttribute("data-window-color"));
			} else {
				setColor(false);
			}
		} else {
			setColor(false);
		}

		function setColor(color) {
			if (!color) {
				taskbar.style.backgroundColor = null;
				document.querySelector("meta[name=theme-color]").setAttribute("content", "#666666");
				taskbar.classList.remove("dark-foreground");
				return;
			}
			taskbar.style.backgroundColor = color;
			document.querySelector("meta[name=theme-color]").setAttribute("content", color);
			if (a9os_core_main.colorLogic.isLigther(color)) {
				taskbar.classList.add("dark-foreground");
			} else {
				taskbar.classList.remove("dark-foreground");
			}

			if (color.indexOf("rgba") != -1) {
				taskbar.classList.add("transparent");
			} else {
				taskbar.classList.remove("transparent");
			}
		}
	}, 1);
}