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
a9os_user_register.main = (data) => {
	if (data.window) a9os_core_window.processWindowData(data);
	core.addEventListener(self.component.querySelector(".btn.close"), "click", a9os_core_window.close);
	core.addEventListener(self.component.querySelector("form"), "submit", self.submit, "CACA");
	core.addEventListener(self.component.querySelectorAll("form input"), "blur", self.ifInputEmpty);
	core.addEventListener(self.component.querySelectorAll("form input"), "keyup", self.enableDisableSubmit);
}

a9os_user_register.submit = (event, btn) => {
	event.preventDefault();
	self.errors.clear();
	var userForm = self.component.querySelector("form");
		
	var arrFormData = {
		name : userForm.querySelector(".name").value,
		email : userForm.querySelector(".email").value,
		password1 : userForm.querySelector(".password1").value,
		password2 : userForm.querySelector(".password2").value,
		"system-key" : userForm.querySelector(".system-key").value
	};
	core.sendRequest(
		"/register/submit",
		arrFormData,
		{
			fn : (response) => {
				if (response == "ok") {
					a9os_core_window.close();
					if (window.a9os_core_taskbar_popuparea) a9os_core_taskbar_popuparea.new("<h1>Usuario creado exisosamente</h1><br>Inicie sesión desde el menú de inicio");
				} else {
					self.errors.show(response);
				}
			},
			args : {
				response : false
			}
		}
	);
}

a9os_user_register.errors = {};
a9os_user_register.errors.clear = () => {
	var arrErrors = self.component.querySelectorAll("form label .error");
	for (var i = 0 ; i < arrErrors.length ; i++) {
		arrErrors[i].parentElement.removeChild(arrErrors[i]);
	}
}

a9os_user_register.errors.show = (arrErrors) => {
	for (var inputName in arrErrors) {
		var arrInputError = arrErrors[inputName];
		if (arrInputError.length == 0) continue;
		var newError = document.createElement("div");
		newError.classList.add("error");
		var errorIcon = document.createElement("div");
		errorIcon.classList.add("error-icon");
		errorIcon.textContent = "×";
		newError.appendChild(errorIcon);

		var popupMsg = document.createElement("div");
		popupMsg.classList.add("popup-msg");

		for (var i = 0 ; i < arrInputError.length ; i++){
			var errorItem = document.createElement("div");
			errorItem.classList.add("item");
			errorItem.textContent = arrInputError[i];
			popupMsg.appendChild(errorItem);
		}
		newError.appendChild(popupMsg);
		self.component.querySelector("form input."+inputName).parentElement.appendChild(newError);

	}
}


a9os_user_register.ifInputEmpty = (event, input) => {
	if (input.value.length > 0) {
		input.classList.add("non-empty");
	} else {
		input.classList.remove("non-empty");
	}
}

a9os_user_register.enableDisableSubmit = (event, item) => {
	var arrInputs = self.component.querySelectorAll("form input");
	var submitEnabled = true;
	for (var i = 0 ; i < arrInputs.length ; i++){
		if (arrInputs[i].value.length == 0){
			submitEnabled = false;
			break;
		}
	}

	if (submitEnabled) {
		self.component.querySelector("form .btn.submit").removeAttribute("disabled");
	} else {
		self.component.querySelector("form .btn.submit").setAttribute("disabled", "");
	}
}