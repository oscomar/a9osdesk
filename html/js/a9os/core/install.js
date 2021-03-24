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
a9os_core_install.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);

	self.attachControls();
}

a9os_core_install.attachControls = () => {
	var cancelButton = self.component.querySelector(".btn.cancel");
	var submitButton = self.component.querySelector(".btn.submit");
	var syskeyInput = self.component.querySelector(".syskey-input input");
	var syskeyMsg = self.component.querySelector(".syskey-input .message");


	a9os_core_main.addEventListener(cancelButton, "click", (event, cancelButton) => {
		a9os_core_window.close();
		core.link.push("/");
	});

	a9os_core_main.addEventListener(syskeyMsg, "click", (event, syskeyMsg) => {
		syskeyMsg.classList.remove("show");
	});


	a9os_core_main.addEventListener(submitButton, "click", (event, submitButton) => {
		submitButton.disabled = true;

		syskeyMsg.textContent = "Instalando...";
		syskeyMsg.classList.add("show");
		core.sendRequest(
			"/install_a9os/submit",
			{
				systemKey : syskeyInput.value
			},
			{
				fn : (response) => {
					if (response == "bad_password") {
						syskeyMsg.textContent = "System Key incorrecta";
						syskeyMsg.classList.add("show");
						syskeyInput.focus();
						syskeyInput.setSelectionRange(0, syskeyInput.value.length);
						submitButton.disabled = false;
					} else if (response == "__RELOAD__") {
						a9os_core_window.close();
						core.link.push("/");
						location.reload();
					}
				},
				args : {
					response : false
				}
			}
		);
	});
}