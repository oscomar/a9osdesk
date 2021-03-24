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
a9os_core_taskbar_notifarea_clock.main = () => {
	
	var clock = self.component.querySelector(".clock");
	setInterval((clock) => {
		var arrTime = self.getTime();
		clock.innerHTML = arrTime[0]+"<br><span class='date'>"+arrTime[1]+"</span>";
	}, 1000, clock);

	a9os_core_taskbar_statusbox.append(
		self.component,
		self.component.querySelector(".statusbox-container"),
		{
			fn : (boxNode, clock) => {
				function appendTime() {					
					var arrTime = self.getTime();
					boxNode.querySelector(".clock").innerHTML = arrTime[0];
				}
				
				appendTime();
				setInterval(appendTime, 1000);

				var calendar = boxNode.querySelector(".calendar");
				var prevMonth = calendar.querySelector(".month-buttons .m.prev");
				var nextMonth = calendar.querySelector(".month-buttons .m.next");
				var prevYear = calendar.querySelector(".month-buttons .y.prev");
				var nextYear = calendar.querySelector(".month-buttons .y.next");
				var returnToday = calendar.querySelector(".month-buttons .y-and-m");

				a9os_core_main.addEventListener(prevMonth, "click", (event, prevMonth, calendar) => {
					var year = parseInt(calendar.querySelector(".month-buttons .year").textContent);
					var month = parseInt(calendar.querySelector(".m-line").getAttribute("data-month-num"));
					month--;
					if (month < 0) {
						year--;
						month = 11;
					}

					self.calendar.process(calendar, {
						month : month,
						year : year
					});
				}, calendar);

				a9os_core_main.addEventListener(nextMonth, "click", (event, nextMonth, calendar) => {
					var year = parseInt(calendar.querySelector(".month-buttons .year").textContent);
					var month = parseInt(calendar.querySelector(".m-line").getAttribute("data-month-num"));
					month++;
					if (month > 11) {
						year++;
						month = 0;
					}

					self.calendar.process(calendar, {
						month : month,
						year : year
					});
				}, calendar);

				a9os_core_main.addEventListener(prevYear, "click", (event, prevYear, calendar) => {
					var year = parseInt(calendar.querySelector(".month-buttons .year").textContent);
					var month = parseInt(calendar.querySelector(".m-line").getAttribute("data-month-num"));


					self.calendar.process(calendar, {
						month : month,
						year : --year
					});
				}, calendar);

				a9os_core_main.addEventListener(nextYear, "click", (event, nextYear, calendar) => {
					var year = parseInt(calendar.querySelector(".month-buttons .year").textContent);
					var month = parseInt(calendar.querySelector(".m-line").getAttribute("data-month-num"));


					self.calendar.process(calendar, {
						month : month,
						year : ++year
					});
				}, calendar);

				a9os_core_main.addEventListener(returnToday, "click", (event, returnToday, calendar) => {
					self.calendar.process(calendar);
				}, calendar);

				self.calendar.process(calendar);
			},
			args : {
				boxNode : false,
				clock : clock
			}
		}
	);
}

a9os_core_taskbar_notifarea_clock.getTime = () => {
	var time = new Date();
	var arrTmp = [time.getHours(), time.getMinutes(), time.getDate(), time.getMonth()+1, time.getFullYear()];
	arrTmp.forEach((n,i) => { arrTmp[i] = (n<10)?"0"+n:n; });
	return [arrTmp[0]+":"+arrTmp[1], arrTmp[2]+"/"+arrTmp[3]+"/"+arrTmp[4]];
}



a9os_core_taskbar_notifarea_clock.calendar = {};
a9os_core_taskbar_notifarea_clock.calendar.process = (calendar, arrMonthYear) => {
	
	var arrMonthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

	if (!arrMonthYear) {
		var timeNow = new Date();
		var time = new Date(timeNow.getFullYear(), timeNow.getMonth(), 1);
	}
	else var time = new Date(arrMonthYear.year, arrMonthYear.month, 1);
	var currDate = time.getDate();
	var currDay = time.getDay();
	var currMonth = time.getMonth();
	var currYear = time.getFullYear();

	var arrMonthsLength = [31,28,31, 30,31,30, 31,31,30, 31,30,31];
	if (((currYear % 4 == 0) && (currYear % 100 != 0)) || (currYear % 400 == 0)) arrMonthsLength[1] = 29;

	var startDay = (currDate % 7) + currDay - 1;

	var datesDiv = calendar.querySelector(".cal .dates");
	datesDiv.textContent = "";

	var item = document.createElement("div");
	item.classList.add("item");
	for (var i = 0 ; i < 7*6 ; i++) {
		var newItem = item.cloneNode(true);

		if (i < startDay) {
			newItem.classList.add("padd");
		} else if (i >= startDay && i-startDay < arrMonthsLength[currMonth]) {
			newItem.textContent = i-startDay+1;
		} else {
			newItem.classList.add("padd");
		}

		if (timeNow && i-startDay+1 == timeNow.getDate() && !arrMonthYear) newItem.classList.add("today");

		datesDiv.appendChild(newItem);
	}
	
	var yearDiv = calendar.querySelector(".month-buttons .year");
	yearDiv.textContent = currYear;

	var monthDiv = calendar.querySelector(".m-line");
	monthDiv.textContent = arrMonthNames[currMonth];
	monthDiv.setAttribute("data-month-num", currMonth);

}