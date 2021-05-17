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
a9os_app_imgviewer_main.main = (data) => {
	
	if (data.window) a9os_core_window.processWindowData(data);
	self.component.fileExtensions = data.fileExtensions;


	self.attachMouseMovement();
	self.attachScrollEvent();
	self.attachButtonsEvent();
	self.attachDragEvent();
	self.attachTouchZoom();
	self.file.attach();

	a9os_core_main.addEventListener(self.component.querySelector("img"), "load", (event, img) => {
		core.loading.unset();
		img.classList.add("loaded");
		var imgColor = a9os_core_main.colorLogic.getAverageRGB(img);
		self.component.goToParentClass("window").querySelector(".window-bar").setAttribute("data-window-color", imgColor);
		a9os_core_window.setWindowColor(self.component.goToParentClass("window"));

		var mainDiv = self.component.querySelector(".main");
		mainDiv.style.backgroundColor = imgColor;

		//mainDiv.querySelector(".buttons").style.setProperty("--window-color", imgColor);
	});
	a9os_core_main.addEventListener(self.component.querySelector("img"), "error", (event, img) => {
		core.loading.unset();
		a9os_core_taskbar_popuparea.new("No se puede cargar: "+img.src, false, "error");
	});

	a9os_core_main.addEventListener(self.component.querySelector(".main"), "dblclick", self.toggleFullscreen);

}

a9os_app_imgviewer_main.file = {};
a9os_app_imgviewer_main.file.attach = () => {
	
	self.component.fileHandleId = a9os_app_vf_main.fileHandle.attach(
		self.component,
		{
			fn : (component) => {
				return { qty : "simple", type : "file", fileExtensions : component.fileExtensions, dropType : "single" }
			},
			args : {
				component : self.component
			}
		},
		false,
		{
			fn : (component, handle) => {
				if (!handle.data) return;
				core.loading.set();

				var zoomDiv = self.component.querySelector(".buttons .zoom");
				zoomDiv.textContent = "100%";
				zoomDiv.setAttribute("data-scale", 1);
				zoomDiv.setAttribute("data-translate-x", 0);
				zoomDiv.setAttribute("data-translate-y", 0);
				self.updateScalePos();

				component.querySelector("img").src = a9os_app_vf_main.fileHandle.getBlobUrl(handle.data);
				component.querySelector("img").classList.remove("loaded");
				self._updateWindowData(handle.path);
			},
			args : {
				component : self.component,
				handle : false
			}
		},
		false,
		{
			fn : (component, handle, registry, confirmCallback) => {
				if (registry.action == "file_write") confirmCallback();
			},
			args : {
				component : self.component,
				handle : false,
				registry : false,
				confirmCallback : false
			}
		},
		{ //cancelFn
			fn : a9os_core_main.removeWindow,
			args : {
				component : self.component
			}
		}
	);

	self.component.querySelector(".main").setAttribute("data-vf-drop-area", self.component.fileHandleId);

	a9os_app_vf_main.fileHandle.addDirectoryFileListing(self.component, self.component.fileHandleId, {
		fn : self.receiveFileFolder,
		args : {
			component : self.component,
			handle : false
		}
	});


	if (!(core.link.hash.get()["file"]||false)) {
		a9os_app_vf_main.fileHandle.open(self.component, self.component.fileHandleId);
	}
}

a9os_app_imgviewer_main.receiveFileFolder = (component, handle) => {
		var arrFiles = handle.arrFolderFiles;

	component.arrFiles = arrFiles;
	component.currFileIndex = getFileIndex(arrFiles, handle.path);

	var prevDiv = self.component.querySelector(".buttons .prev");
	var nextDiv = self.component.querySelector(".buttons .next");

	nextDiv.disabled = true;
	prevDiv.disabled = true;

	if (component.currFileIndex == 0) {
		nextDiv.disabled = false;
	} else if (component.currFileIndex >= arrFiles.length-1) {
		prevDiv.disabled = false;
	} else {
		nextDiv.disabled = false;
		prevDiv.disabled = false;
	}

	function getFileIndex(arrFiles, currPath) {
		for (var i = 0 ; i < arrFiles.length ; i++){
			if (arrFiles[i].path == currPath) {
				return i;
			}
		}
	}
}

a9os_app_imgviewer_main.attachMouseMovement = () => {
	
}

a9os_app_imgviewer_main.attachScrollEvent = () => {
	
	var dataElement = self.component.querySelector(".buttons .zoom");
	dataElement.setAttribute("data-scale", 1);
	var scaleMin = 1;
	var scaleMax = 10;
	var currScale = 1;
	var boolLimit = -1;
	a9os_core_main.addEventListener(self.component.querySelector(".main"), "wheel", (event) => {
		var direction = (event.deltaY < 0)?"up":"down";
		currScale = self.getCurentScale();
		if (currScale > scaleMax) boolLimit = 1;
		else if (currScale < scaleMin) boolLimit = 2;
		else boolLimit = -1;
		if (direction == "up") {
			if (currScale >= 1) {
				if (boolLimit != 1) {
					currScale += 0.5;
					/*dataElement.setAttribute("data-translate-x",
						parseFloat(dataElement.getAttribute("data-translate-x"))/currScale
					);*/
				}
			} else {
				dataElement.setAttribute("data-translate-x", 0);
				dataElement.setAttribute("data-translate-y", 0);
				/*if (boolLimit != 1)*/ currScale = 1;
			}
		} else {
			if (currScale > 1) {
				if (boolLimit != 2) currScale -= 0.5;
			} else {
				dataElement.setAttribute("data-translate-x", 0);
				dataElement.setAttribute("data-translate-y", 0);
				/*if (boolLimit != 2)*/ currScale = 1;
			}
		}
		dataElement.setAttribute("data-scale", currScale);
		self.updateScalePos();
	});
}

a9os_app_imgviewer_main.attachButtonsEvent = () => {
	
	var zoomDiv = self.component.querySelector(".buttons .zoom");

	a9os_core_main.addEventListener(zoomDiv, "click", (event, elem) => {
		elem.textContent = "100%";
		elem.setAttribute("data-scale", 1);
		elem.setAttribute("data-translate-x", 0);
		elem.setAttribute("data-translate-y", 0);
		self.updateScalePos();
	});

	var prevDiv = self.component.querySelector(".buttons .prev");
	var nextDiv = self.component.querySelector(".buttons .next");
	a9os_core_main.addEventListener([prevDiv, nextDiv], "click", (event, button) => {
		button.disabled = true;

		if (button.classList.contains("prev")) {
			self.component.currFileIndex--;
		} else if (button.classList.contains("next")) {
			self.component.currFileIndex++;
		}
		var newPath = self.component.arrFiles[ self.component.currFileIndex ].path;
		a9os_app_vf_main.fileHandle.openByPath(self.component, self.component.fileHandleId, newPath);
	});

}

a9os_app_imgviewer_main.attachDragEvent = () => {
	
	var dataElement = self.component.querySelector(".buttons .zoom");
	dataElement.setAttribute("data-translate-x", 0);
	dataElement.setAttribute("data-translate-y", 0);
	var mainImg = self.component.querySelector(".main img");
	a9os_core_main.moveEvent.add(self.component.querySelector(".main"), (interface, item) => {
		var event = interface.originalEvent;
		var currScale = self.getCurentScale();
		if (currScale <= 1) return;
		if (event.buttons != 1) return;
		self.moveImg(event.movementX, event.movementY);
	});
}

a9os_app_imgviewer_main.moveImg = (movX, movY) => {
	
	var dataElement = self.component.querySelector(".buttons .zoom");
	movX = parseFloat(dataElement.getAttribute("data-translate-x"))+movX;
	movY = parseFloat(dataElement.getAttribute("data-translate-y"))+movY;

	/*if (movX*currScale > mainImg.offsetWidth/2 || movX*currScale < -mainImg.offsetWidth/2) 
		movX = parseFloat(dataElement.getAttribute("data-translate-x"));
	if (movY*currScale > mainImg.offsetHeight/2 || movY*currScale < -mainImg.offsetHeight/2) 
		movY = parseFloat(dataElement.getAttribute("data-translate-y"));*/ 

	dataElement.setAttribute("data-translate-x", movX);
	dataElement.setAttribute("data-translate-y", movY);


	self.updateScalePos();
}

a9os_app_imgviewer_main.getCurentScale = () => {
	
	return parseFloat(self.component.querySelector(".buttons .zoom").getAttribute("data-scale"))||1;
}

a9os_app_imgviewer_main.updateScalePos = () => {
	
	var dataElement = self.component.querySelector(".buttons .zoom");
	var currScale = dataElement.getAttribute("data-scale");
	var currMovX = dataElement.getAttribute("data-translate-x");
	var currMovY = dataElement.getAttribute("data-translate-y");
	self.component.querySelector(".buttons .zoom").textContent = Math.round(currScale*100)+"%";

	var viewW = self.component.querySelector(".main").offsetWidth;
	var viewY = self.component.querySelector(".main").offsetHeight;
	//var extraOfW = Math.abs(viewW - self.component.querySelector(".main img").offsetWidth)/2;
	var finalX = currMovX/currScale;
	var finalY = currMovY/currScale;

	if (Math.abs(finalX) > (viewW - (viewW/currScale))/2) {
		if (finalX > 0) finalX = (viewW - (viewW/currScale))/2;
		else finalX = ((viewW/currScale) - viewW)/2;

		dataElement.setAttribute("data-translate-x", finalX*currScale);
	}

	self.component.querySelector(".main img").style.transform = "scale("+currScale+") translate("+finalX+"px, "+finalY+"px)";
}

a9os_app_imgviewer_main.attachTouchZoom = () => {
	
	var dataElement = self.component.querySelector(".buttons .zoom");
	var initScaleDiff = 0;
	var initElementScale =  parseFloat(dataElement.getAttribute("data-scale"))||0;
	var movX = 0;
	var movY = 0;
	a9os_core_main.addEventListener(self.component.querySelector(".main"), "touchstart", (event, item) => {
		if (event.touches.length >= 2) { 
			initScaleDiff = Math.hypot(
				event.touches[0].pageX - event.touches[1].pageX,
				event.touches[0].pageY - event.touches[1].pageY
			);
		} 
		movX = event.touches[0].pageX;
		movY = event.touches[0].pageY;

	});
	a9os_core_main.addEventListener(self.component.querySelector(".main"), "touchmove", (event, item) => {
		if (event.touches.length >= 2) { //zoom
			var currScaleDiff =  initScaleDiff - Math.hypot(
				event.touches[0].pageX - event.touches[1].pageX,
				event.touches[0].pageY - event.touches[1].pageY
			) ;
			if ((initElementScale - (currScaleDiff/100)) >= 1) {
				dataElement.setAttribute("data-scale", initElementScale - (currScaleDiff/100));
				self.updateScalePos();
			}else {
				dataElement.setAttribute("data-scale", 1);
				dataElement.setAttribute("data-translate-x", 0);
				dataElement.setAttribute("data-translate-y", 0);
				self.updateScalePos();
			}

		}
		if (parseFloat(dataElement.getAttribute("data-scale")) > 1){
			fmovX = event.touches[0].pageX - movX;
			fmovY = event.touches[0].pageY - movY;
			self.moveImg(fmovX, fmovY);
			movX = event.touches[0].pageX;
			movY = event.touches[0].pageY;
		}
	});

	a9os_core_main.addEventListener(self.component.querySelector(".main"), "touchend", (event, item) => {
		initScaleDiff = 0;
		initElementScale = parseFloat(dataElement.getAttribute("data-scale"))||0;
		movX = 0;
		movY = 0;
	});
}

a9os_app_imgviewer_main._updateWindowData = (path) => {
	
	var arrPathName = a9os_core_main.splitFilePath(path);

	var originalTitle = a9os_core_window.getWindowData()["originalTitle"];
	var arrWindowTitle = [arrPathName[1], originalTitle];

	a9os_core_window.updateWindowData({ title : arrWindowTitle.join(" - ") });
}

a9os_app_imgviewer_main.toggleFullscreen = () => {
	
	if (a9os_core_window.isFullscreen()) {
		a9os_core_window.unsetFullscreen();
	} else {
		a9os_core_window.setFullscreen();
	}
}