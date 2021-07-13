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
a9os_core_taskbar_applist.main = (data) => {
	self.component.appList = self.component.querySelector(".main-app-list");
	
	core.addEventListener(a9os_core_main.mainDiv, "click", self.close);
	core.addEventListener(self.component.appList, "click", (event) => {event.stopPropagation()});


	core.addEventListener(a9os_core_taskbar.component.querySelector(".taskbar .main-button"), "click", self.toggle);



	self.appSearchInput.init();



	self.userControl.init(data);


	self.appendOrderLetters();
	core.parseHrefHandlers();
	self.appendCloseEventToItems();
}

a9os_core_taskbar_applist.appendCloseEventToItems = () => {
	core.addEventListener(self.component.appList.querySelectorAll(".app-list a, .header .register"), "click", self.toggle);
}

a9os_core_taskbar_applist.userControl = {};
a9os_core_taskbar_applist.userControl.init = (data) => {
	var submitBtn = self.component.appList.querySelector(".header .not-logged .buttons .submit");
	core.addEventListener(submitBtn, "click", self.userControl.submitLogin);

	var passInput = self.component.appList.querySelector(".header .not-logged input.password");
	core.addEventListener(passInput, "keyup", (event, input) => {
		if (event.which == 13) self.userControl.submitLogin();
	});

	if (window.a9os_user && a9os_user.user.name != "__anon__") {
		self.component.appList.classList.remove("not-logged");
		self.component.appList.querySelector(".header .logged .name").textContent = a9os_user.user.name;
	}

	var userAvatarItem = self.component.querySelector(".header .avatar");
	if (data.userAvatar) userAvatarItem.style.backgroundImage = "url("+data.userAvatar+")";

	if (data.systemAnonMode == "demo") {
		self.component.querySelector(".header .logged").style.display = "none";
		self.component.querySelector(".header .not-logged").style.display = "none";
		self.component.querySelector(".header .demo-mode").style.display = "block";

		var mainAppList = self.component.querySelector(".main-app-list");
		mainAppList.classList.remove("not-logged");
		mainAppList.classList.remove("logged");
		mainAppList.classList.add("demo-mode");

		self.component.querySelector(".app-list .add-app").style.display = "none";
	}
}

a9os_core_taskbar_applist.userControl.submitLogin = (event) => {
	
	var arrUserPass = {
		name : self.component.appList.querySelector(".header input.name").value,
		password : self.component.appList.querySelector(".header input.password").value
	};

	if (arrUserPass.name == "" || arrUserPass.password == "") return;

	core.sendRequest(
		"/login",
		arrUserPass,
		{
			fn : (response, component) => {
				if (response == "ok") {
					a9os_app_vf_desktop.selectDesktop();
					core.reloadPage();
				} else {
					a9os_core_taskbar_popuparea.new("Usuario o contraseña incorrectas", false, "error");
					component.appList.querySelector(".header input.name").value = "";
					component.appList.querySelector(".header input.password").value = "";
				}
			},
			args : {
				response : false,
				component : self.component
			}
		}
	)
}




a9os_core_taskbar_applist.toggle = (event) => {
	if (event) event.stopPropagation();
	if (self.component.appList.classList.contains("open")){
		a9os_core_taskbar_applist.close(event);
	} else {
		a9os_core_taskbar_applist.open(event);
	}
}
a9os_core_taskbar_applist.open = () => {
	
	self.component.appList.classList.add("open");
	/*setTimeout(() => {
		self.component.appList.querySelector(".app-search").focus();
	}, 100);*/
}
a9os_core_taskbar_applist.close = (event) => {
	event.stopPropagation();
	self.component.appList.classList.remove("open");

	self.component.appList.querySelector(".header input.name").value = "";
	self.component.appList.querySelector(".header input.password").value = "";
	self.component.appList.querySelector(".app-list").scrollTop = 0;
	self.component.appList.querySelector(".app-search").value = "";
	self.appSearchInput.search("");
}





a9os_core_taskbar_applist.appSearchInput = {};
a9os_core_taskbar_applist.appSearchInput.init = () => {
	var appSearchInput = self.component.appList.querySelector(".main-app-list .app-search");

	core.addEventListener(appSearchInput, "input", (event, appSearchInput) => {
		self.appSearchInput.search(appSearchInput.value); 
	});

	core.addEventListener(appSearchInput, "keyup", (event, appSearchInput) => {
		if (event.which == 13){
			var firstFoundApp = self.component.appList.querySelector(".app-list a:not(.filtered)");
			if (firstFoundApp) firstFoundApp.click();
		}
	});
}

a9os_core_taskbar_applist.appSearchInput.search = (query) => {
	
	var query = query.toLowerCase().replace(/[^0-9a-z-]/g,"");
	var container = self.component.appList.querySelector(".main-app-list .app-list");

	if (query != "") {
		container.classList.add("in-search");
	} else {
		container.classList.remove("in-search");
		container.querySelector(".search-not-found").classList.remove("show");
	}

	var arrApps = container.querySelectorAll("a");
	var qtyFound = 0;
	for (var i = 0 ; i < arrApps.length ; i++) {
		var item = arrApps[i];
		if (query == ""){
			item.classList.remove("filtered");
			qtyFound = 0;
			continue;
		}
		if (item.textContent.toLowerCase().indexOf(query) == -1){
			item.classList.add("filtered");
			qtyFound++;
		} else {
			item.classList.remove("filtered");
			qtyFound--;
		}
	}

	if (qtyFound == arrApps.length) {
		container.querySelector(".search-not-found").classList.add("show");
	} else {
		container.querySelector(".search-not-found").classList.remove("show");
	}
}

a9os_core_taskbar_applist.reloadAppList = (appList) => {
	core.preProcess(self.component.appList.querySelector(".app-list"), { appList : appList });
	self.appendOrderLetters();
	core.parseHrefHandlers();
	self.appendCloseEventToItems();
}

a9os_core_taskbar_applist.addToWindowlist = (event, item) => {
	var newPinnedApp = {
		id : item.getAttribute("data-appid"),
		url : item.getAttribute("href"),
		icon : item.querySelector("img").getAttribute("src"),
		title : item.querySelector("span").textContent
	};

	a9os_core_taskbar_windowlist.item.pinned.add(newPinnedApp);
}

a9os_core_taskbar_applist.setUserAvatar = {};
a9os_core_taskbar_applist.setUserAvatar.set = (event) => {
	var avatarItem = self.component.querySelector(".header .avatar");
	
	core.link.push("/vf", {
		folder : "/", 
		mode : "open", 
		config : { qty : "simple", type : "file", fileExtensions : ["JPG", "PNG", "GIF", "BMP", "SVG"] }, 
		cci : a9os_core_main.windowCrossCallback.add({
			fn : self.setUserAvatar.receive,
			args : {
				path : false,
				avatarItem : avatarItem
			}
		}, self.component),
		cancelCci : false
	}, false);
}
a9os_core_taskbar_applist.setUserAvatar.receive = (path, avatarItem) => {
	core.sendRequest(
		"/applist/setUserAvatar",
		{
			path : path
		},
		{
			fn : (response, avatarItem) => {
				avatarItem.style.backgroundImage = "url("+response+")";
				self.toggle();
			},
			args : {
				response : false,
				avatarItem : avatarItem
			}
		}
	);

	//final callback - applinst open
}

a9os_core_taskbar_applist.openAbout = () => {
	core.link.push("/about");
}

a9os_core_taskbar_applist.setHeaderGradientByBackground = () => {
	if (!window.a9os_app_vf_desktop) return;

	var appList = self.component.querySelector(".main-app-list");

	var imgPreloader = self.component.querySelector(".tmp-preloader");
	if (imgPreloader.getAttribute("data-attached") == "false") {
		imgPreloader.setAttribute("data-attached", "true");
		core.addEventListener(imgPreloader, "load", (event, imgPreloader) => {
			var arrImgColors = a9os_core_main.colorLogic.getAverageRGB(imgPreloader, 2);
			appList.style.backgroundImage = "linear-gradient(160deg, "+arrImgColors[0]+" 0%, "+arrImgColors[1]+" 50%)";

			var imgColor = a9os_core_main.colorLogic.getAverageRGB(imgPreloader);
			document.body.style.backgroundColor = imgColor;
		});
	}

	var backgroundImageUrl = a9os_app_vf_desktop.component.querySelector(".vf-files-container");
	backgroundImageUrl = backgroundImageUrl.getAttribute("data-background-image");
	if (backgroundImageUrl != "false") imgPreloader.src = backgroundImageUrl;

}

a9os_core_taskbar_applist.appendOrderLetters = () => {
	var appList = self.component.appList.querySelector(".app-list-inner");
	var arrItems = appList.querySelectorAll("a");

	var currLetter = "";
	for (var i = 0 ; i < arrItems.length ; i++) {
		var currItem = arrItems[i];
		var currItemFirstLetter = currItem.querySelector("span").textContent.charAt(0).toUpperCase();

		if (currLetter != currItemFirstLetter) {
			currLetter = currItemFirstLetter;
			appendItemLetter(currLetter, currItem);
		}
	}

	function appendItemLetter(currLetter, currItem) {
		var itemElement = document.createElement("div");
		itemElement.textContent = currLetter;
		itemElement.classList.add("letter-element");
		currItem.parentElement.insertBefore(itemElement, currItem);
	}
}