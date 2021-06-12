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
a9os_core_splash.main = (data) => {
	self.attachFormActions();
	self.attachChangeScope();

	if (data.wallpaper) self.setWallpaper(data.wallpaper);
}
a9os_core_splash.attachChangeScope = () => {
	a9os_core_main.addEventListener(self.component, "click", (event, component) => {
		core.link.push("/", {}, true);
		core.link.title("os.com.ar - login");
	});
}

a9os_core_splash.attachFormActions = () => {
	var arrInputs = self.component.querySelectorAll(".login-box input");
	setInterval((arrInputs) => {
		for (var i = 0 ; i < arrInputs.length ; i++) {
			var currInput = arrInputs[i];
			if (currInput.value != "") {
				currInput.classList.add("non-empty");
			} else {
				currInput.classList.remove("non-empty");
			}
		}	
	}, 200, arrInputs);
	a9os_core_main.addEventListener(
		self.component.querySelectorAll(".login-box input"),
		"keyup",
		(event, currInput) => {
			if (event.which == 13) self.submitLogin(event);
			if (currInput.value != "") {
				currInput.classList.add("non-empty");
			} else {
				currInput.classList.remove("non-empty");
			}
		}
	);

	a9os_core_main.addEventListener(
		self.component.querySelectorAll(".login-box .submit"),
		"click",
		self.submitLogin
	)
}

a9os_core_splash.submitLogin = (event) => {
	var arrUserPass = {
		name : self.component.querySelector(".login-box input.name").value,
		password : self.component.querySelector(".login-box input.password").value
	};

	core.sendRequest(
		"/login",
		arrUserPass,
		{
			fn : (response, component) => {
				if (response == "ok") {
					core.reloadPage();
				} else {
					var errorBox = component.querySelector(".login-box .error");
					errorBox.classList.add("show");
					errorBox.textContent = "Usuario o contraseña incorrectas";

					setTimeout((errorBox) => {
						errorBox.classList.remove("show");
					}, 3000, errorBox);

					component.querySelector(".login-box input.name").value = "";
					component.querySelector(".login-box input.password").value = "";
				}

			},
			args : {
				response : false,
				component : self.component
			}
		}
	)
}


a9os_core_splash.setWallpaper = (wallpaper) => {
	a9os_core_main.mainDiv.style.backgroundImage = "url("+wallpaper+")";
}