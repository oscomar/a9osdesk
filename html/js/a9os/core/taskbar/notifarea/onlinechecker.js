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
a9os_core_taskbar_notifarea_onlinechecker.main = () => {
	var offlineNotifInterval = 0;

	self.component.style.opacity = 0;
	setTimeout(() => { //nointer icon load when online
		self.component.classList.add("hide");
		self.component.style.opacity = 1;
	}, 1000);
	window.addEventListener("offline", (event) => {
		self.component.classList.remove("hide");
		var a9osMain = a9os_core_main.component.querySelector(".a9os-main");
		var screenLock = self.component.querySelector(".onlinechecker-screen-lock");
		screenLock.classList.add("offline");

		var screenLockCloned = screenLock.cloneNode(true);
		//screenLockCloned.classList.add("offline");

		a9osMain.appendChild(screenLockCloned);

		var screenLockNotificon = screenLock.querySelector(".notificon");
		var screenLockClonedNotificon = screenLockCloned.querySelector(".notificon");

		offlineNotifInterval = setInterval(() => {
			var notificonCoords = screenLockNotificon.getBoundingClientRect();
			screenLockClonedNotificon.style.left = notificonCoords.x;
			screenLockClonedNotificon.style.top = notificonCoords.y;
			screenLockClonedNotificon.style.width = notificonCoords.width + "px";
			screenLockClonedNotificon.style.height = notificonCoords.height + "px";
		}, 500);
	});
	window.addEventListener("online", (event) => {
		if (offlineNotifInterval) clearInterval(offlineNotifInterval);

		var screenLock = self.component.querySelector(".onlinechecker-screen-lock");
		screenLock.classList.remove("offline");

		var a9osMain = a9os_core_main.component.querySelector(".a9os-main");
		var screenLockCloned = a9osMain.querySelector(".onlinechecker-screen-lock.offline");
		a9osMain.removeChild(screenLockCloned);

		self.component.classList.add("hide");
	});
}