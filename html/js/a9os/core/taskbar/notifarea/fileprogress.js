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
a9os_core_taskbar_notifarea_fileprogress.main = () => {
	
	self.component.classList.add("hide");
	self.component.boxNode = self.component.querySelector(".statusbox-container");

	a9os_core_taskbar_statusbox.append(
		self.component,
		self.component.querySelector(".statusbox-container"),
		{
			fn : (boxNode) => {
				self.component.boxNode = boxNode;
			},
			args : {
				boxNode : false
			}
		},
		{
			fn : (boxNode) => {
				self.component.querySelector(".statusbox-container").innerHTML = boxNode.innerHTML;
				self.component.boxNode = self.component.querySelector(".statusbox-container");
			},
			args : {
				boxNode : false
			}
		}
	);

	self.component.arrGearIds = [];
}

a9os_core_taskbar_notifarea_fileprogress.receiveFromGear = (message) => {
	self.component.classList.remove("hide");

	var gearId = message.gear_id;

	if (self.component.arrGearIds.indexOf(gearId) == -1) {
		self.component.arrGearIds.push(gearId);
		self.updateNotifNumber();
	}


	if (message.is_final_message == "1") {
		self.component.arrGearIds.splice(self.component.arrGearIds.indexOf(gearId), 1);
		self.updateNotifNumber();
	}

	var boxNode = self.component.boxNode;
	if (!boxNode) return;
	var currProgressLine = boxNode.querySelector(".fileprogress .progress-line[data-gearid='"+gearId+"']");

	if (message.is_final_message == "1") {
		currProgressLine.parentElement.removeChild(currProgressLine);

		if (self.component.arrGearIds.length == 0) {
			self.component.classList.add("hide");
			a9os_core_taskbar_statusbox.close(true);	
		}

		return ;
	}


	if (!currProgressLine) {
		var progressLineTemplate = boxNode.querySelector(".template .progress-line.new");
		boxNode.querySelector(".fileprogress").appendChild(progressLineTemplate.cloneNode(true));
		currProgressLine = boxNode.querySelector(".fileprogress .progress-line.new");
		currProgressLine.classList.remove("new");
		core.preProcess(currProgressLine, {gearId : gearId});
	}

	if (message.message.currFile.indexOf("/") == 0) message.message.currFile = message.message.currFile.substr(1);
	if (message.message.destFile.indexOf("/") == 0) message.message.destFile = message.message.destFile.substr(1);
	
	core.preProcess(currProgressLine, {
		gearId : gearId,
		type : message.message.type,
		from : message.message.currFile,
		to : message.message.destFile,
		percent : Math.round(message.message.percent)
	});

}

a9os_core_taskbar_notifarea_fileprogress.updateNotifNumber = () => {
		self.component.querySelector(".fileprogress span").textContent = self.component.arrGearIds.length;
}