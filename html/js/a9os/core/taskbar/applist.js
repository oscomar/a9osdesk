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
	
	a9os_core_main.addEventListener(a9os_core_main.mainDiv, "click", self.close);

	a9os_core_main.addEventListener(a9os_core_taskbar.component.querySelector(".taskbar .main-button"), "click", self.toggle);

	self.component.appList = self.component.querySelector(".main-app-list");
	a9os_core_main.addEventListener(self.component.appList, "click", (event) => {event.stopPropagation()});

	self.component.appList.querySelectorAll(".app-list a, .header .register").forEach((e) => {
		e.addEventListener("click", self.toggle);
	});

	self.component.appList.querySelector(".main-app-list .app-search").addEventListener("keyup", (event) => { 
		self.search(event.currentTarget.value); 
		self.searchEnter(event);
	});

	var submitBtn = self.component.appList.querySelector(".header .not-logged .buttons .submit");
	a9os_core_main.addEventListener(submitBtn, "click", self.submitLogin);

	var passInput = self.component.appList.querySelector(".header .not-logged input.password");
	a9os_core_main.addEventListener(passInput, "keyup", (event, input) => {
		if (event.which == 13) self.submitLogin();
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

a9os_core_taskbar_applist.close = (event) => {
	event.stopPropagation();
	self.component.appList.classList.remove("open");

	self.component.appList.querySelector(".header input.name").value = "";
	self.component.appList.querySelector(".header input.password").value = "";
	self.component.appList.querySelector(".app-list").scrollTop = 0;
	self.component.appList.querySelector(".app-search").value = "";
	self.search("");
}

a9os_core_taskbar_applist.toggle = (event) => {
	
	if (event) event.stopPropagation();
	if (self.component.appList.classList.contains("open")){
		a9os_core_taskbar_applist.close(event);
	} else {
		a9os_core_taskbar_applist.open(event);
	}
}
a9os_core_taskbar_applist.search = (query) => {
	
	var query = query.toLowerCase().replace(/[^0-9a-z-]/g,"");
	var container = self.component.appList.querySelector(".main-app-list .app-list");

	container.querySelectorAll("a").forEach((item,i) => {
		if (query == ""){
			item.classList.remove("filtered");
			return;
		}
		if (item.textContent.toLowerCase().indexOf(query) == -1){
			item.classList.add("filtered");
		} else {
			item.classList.remove("filtered");
		}
	});
}

a9os_core_taskbar_applist.open = () => {
	
	self.component.appList.classList.add("open");
	/*setTimeout(() => {
		self.component.appList.querySelector(".app-search").focus();
	}, 100);*/
}

a9os_core_taskbar_applist.searchEnter = (event) => {
	
	if (event.which == 13){
		self.component.appList.querySelector(".app-list a:not(.filtered)").click();
	}
}

a9os_core_taskbar_applist.addAppToList = (arrAppData) => {
	
	var itemHTML = '<a href="'+arrAppData.url+'" class="ibl-c"><img src="'+arrAppData.icon_url+'"><span>'+arrAppData.name+'</span></a>';
	var appsContainer = self.component.appList.querySelector(".app-list-inner");
	appsContainer.innerHTML = itemHTML+appsContainer.innerHTML;
	core.parseHrefHandlers();
}


a9os_core_taskbar_applist.submitLogin = (event) => {
	
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
					a9os_core_taskbar_popuparea.new("Usuario o contraseña incorrectas");
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