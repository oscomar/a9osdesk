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
var a9os_app_vf_sourcerouter_edit_window = {};
a9os_app_vf_sourcerouter_edit_window.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);

	self.attachControls();
}

a9os_app_vf_sourcerouter_edit_window._closeWindow = () => {
	
	var parentCCI = core.link.hash.get()["cci"]||false;
	a9os_core_main.windowCrossCallback.execute(parentCCI);
	return true;
}

a9os_app_vf_sourcerouter_edit_window.attachControls = () => {
	var submitButton = self.component.querySelector(".buttons .btn.apply");
	var cancelButton = self.component.querySelector(".buttons .btn.cancel");
	var arrItems = self.component.querySelectorAll(".sources-list .item");

	var arrItemCheckboxes = self.component.querySelectorAll(".sources-list .item .check");
	a9os_core_main.addEventListener(arrItemCheckboxes, "click", (event, currCheckbox) => {
		currCheckbox.parentElement.setAttribute("data-selected", currCheckbox.checked);
	});

	a9os_core_main.addEventListener(cancelButton, "click", (event, cancelButton) => {
		a9os_core_window.close();
	});

	a9os_core_main.addEventListener(arrItems, "click", (event, currItem) => {
		if (event.target == currItem.querySelector(".check")) return;
		currItem.querySelector(".check").click();
	});

	a9os_core_main.addEventListener(submitButton, "click", (event, submitButton) => {
		submitButton.disabled = true;

		var arrReturnItemData = [];
		for (var i = 0 ; i < arrItems.length ; i++) {
			var currItem = arrItems[i];
			if (!currItem.querySelector(".check").checked) continue;

			arrReturnItemData.push(currItem.getAttribute("data-id"));
		}

		core.sendRequest(
			"/vf/sourceslist/edit/submit",
			{
				arrItems : arrReturnItemData
			},
			{
				fn : (response) => {
					a9os_core_main.removeWindow(self.component);

					var parentCCI = core.link.hash.get()["cci"]||false;
					a9os_core_main.windowCrossCallback.execute(parentCCI, {
						arrSources : response
					});

				},
				args : {
					response : false
				}
			}
		);
	});


}