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
a9os_core_taskbar_notifarea_fullscreenbutton.main = () => {
	var fsButton = a9os_core_taskbar_notifarea_fullscreenbutton.component.querySelector(".fullscreen-button");
	fsButton.addEventListener("click", (event) => {
		var isInFullScreen = 
			(document.fullScreenElement && document.fullScreenElement !== null)
        ||  (document.mozFullScreen || document.webkitIsFullScreen);
		
		if (isInFullScreen){
			document.exitFullscreen = document.exitFullscreen || document.webkitExitFullscreen || document.mozCancelFullScreen || document.msExitFullscreen;
			document.exitFullscreen();
			return;
		}
		var body = document.querySelector("body");
		body.requestFullscreen = body.requestFullscreen || body.mozRequestFullScreen || body.webkitRequestFullscreen || body.msRequestFullscreen;
		body.requestFullscreen();
	});
}