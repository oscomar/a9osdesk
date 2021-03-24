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
a9os_core_taskbar_notifarea_battery.main = () => {
	
	var batteryDiv = self.component.querySelector(".battery");
	if (!navigator.getBattery) {
		 self.component.classList.add("hide");
		return ;
	}
	navigator.getBattery().then((battery) => {
		a9os_core_taskbar_statusbox.append(
			self.component,
			self.component.querySelector(".statusbox-container"),
			{
				fn : (boxNode, batteryDiv, battery) => {
					var batteryPopup = boxNode.querySelector(".battery-popup");
					var batteryIcon = batteryDiv.cloneNode(true);

					var txt1 = boxNode.querySelector("h1");
					txt1.textContent = "Batería: "+parseInt(battery.level * 100)+"%";

					var txt2 = boxNode.querySelector("p");
					txt2.textContent = (battery.charging)?"cargando":"Descargando";
					if (battery.level == 1) txt2.textContent = "Completo";

					batteryPopup.insertBefore(batteryIcon, txt1);
				},
				args : {
					boxNode : false,
					batteryDiv : batteryDiv,
					battery : battery
				}
			}
		);


		upd();
		setInterval(upd, 3000);
		battery.addEventListener("chargingchange", upd);

		function upd() {			
			if (battery.charging && battery.level == 1) {
				 self.component.classList.add("hide");
			} else {
				 self.component.classList.remove("hide");
			}

			if (battery.charging) {
				batteryDiv.classList.add("charging");
			} else {
				batteryDiv.classList.remove("charging");
			}
			var percent = battery.level * 100;
			var chargeColor = "#fff";
			if (percent < 15) {
				chargeColor = "#f00";
			}
			if (battery.charging) {
				chargeColor = "#3d3";
			}
			batteryDiv.style.background = "linear-gradient(transparent "+(100-percent)+"%, "+chargeColor+" 0%)";
		}

	});

	//console.log(navigator.connection); algo se puede hacer con esto
}