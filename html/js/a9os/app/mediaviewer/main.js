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
a9os_app_mediaviewer_main.main = (data) => {
	
	if (data.window) a9os_core_window.processWindowData(data, [
		{
			shortcut : ["ctrl", "O"],
			action : {
				fn : self.mediaPopup.selectNewFile,
				args : {}
			}
		},
		{
			shortcut : ["space"],
			action : {
				fn : self.mediaPopup.item.alterPlayPause,
				args : {}
			}
		},
		{
			shortcut : ["F"],
			action : {
				fn : self.toggleFullScreen,
				args : {}
			}
		},
		{
			shortcut : ["N"],
			action : {
				fn : self.mediaPopup.item.nextVideo,
				args : {}
			}
		},
		{
			shortcut : ["P"],
			action : {
				fn : self.mediaPopup.item.prevVideo,
				args : {}
			}
		},
		{
			shortcut : ["M"],
			action : {
				fn : self.alterMuteVolume,
				args : {}
			}
		},
		{
			shortcut : ["S"],
			action : {
				fn : self.mediaPopup.item.stop,
				args : {}
			}
		},
		{
			shortcut : ["NP-"],
			action : {
				fn : self.downVolume,
				args : {}
			}
		},
		{
			shortcut : ["-"],
			action : {
				fn : self.downVolume,
				args : {}
			}
		},
		{
			shortcut : ["NP+"],
			action : {
				fn : self.upVolume,
				args : {}
			}
		},
		{
			shortcut : ["+"],
			action : {
				fn : self.upVolume,
				args : {}
			}
		},
		{
			shortcut : ["Larrow"],
			action : {
				fn : self.moveVideoStep,
				args : { backOrForward : false }
			}
		},
		{
			shortcut : ["Rarrow"],
			action : {
				fn : self.moveVideoStep,
				args : { backOrForward : true }
			}
		},
		{
			shortcut : ["Uarrow"],
			action : {
				fn : self.upVolume,
				args : { backOrForward : false }
			}
		},
		{
			shortcut : ["Darrow"],
			action : {
				fn : self.downVolume,
				args : { backOrForward : true }
			}
		}
	]);

	self.component.arrAV = self.component.querySelectorAll("video, audio");

	self.component.formatElementTable = {
		"MP3" : "audio",
		"MP4" : "video",
		"OGG" : "audio",
		"OGV" : "video",
		"WEBM" : "video",
		"M4V" : "video",
		"M4A" : "audio",
		"WAV" : "audio"
	};

	self.attachControls();

	a9os_app_mediaviewer_main.component.stmHandler = 0;
	a9os_app_mediaviewer_main.component.doStm = 0;

	a9os_app_mediaviewer_main.file.handle();

	self.component.fileExtensions = data.fileExtensions;
}

a9os_app_mediaviewer_main._closeWindow = () => {
		var arrAV = self.component.arrAV;
	for (var i = 0 ; i < arrAV.length ; i++) {	
		arrAV[i].src = "";
		arrAV[i].load();
	}
	return true;
}

a9os_app_mediaviewer_main.attachControls = () => {
	
	var arrAV = self.component.arrAV;

	for (var i = 0 ; i < arrAV.length ; i++){
		var currAV = arrAV[i];

		currAV.playing = false;
		
		a9os_core_main.addEventListener(currAV, "durationchange", (event, video) => {
			if (video.classList.contains("used")) {
				self.component.querySelector(".times .e").textContent = new Date(video.duration * 1000).toISOString().substr(11, 8);
			}
		});

		a9os_core_main.addEventListener(currAV, "play", (event, currAV) => {
			self.component.querySelector(".player").classList.remove("paused");
			self.component.querySelector(".player").classList.add("playing");
			currAV.playing = true;
		});

		a9os_core_main.addEventListener(currAV, "playing", (event, currAV) => {
			self.component.querySelector(".buffering").classList.remove("show");
			self.component.querySelector(".error").classList.remove("show");
		});

		a9os_core_main.addEventListener(currAV, "pause", (event, currAV) => {
			self.component.querySelector(".player").classList.add("paused");
			currAV.playing = false;
		});

		a9os_core_main.addEventListener(currAV, "progress", (event, currAV) => {
			self.loadBufferedProgress();
			self.component.querySelector(".error").classList.remove("show");
		});

		a9os_core_main.addEventListener(currAV, "volumechange", (event, currAV) => {
			self.component.querySelector(".v.percent .p").textContent = Math.round(currAV.volume*100) + "%";
		});

		a9os_core_main.addEventListener(currAV, "waiting", (event, currAV) => {
			self.component.querySelector(".buffering").classList.add("show");
		});

		a9os_core_main.addEventListener(currAV, "ended", (event, currAV) => {
			self.mediaPopup.item.nextVideo();
		});
		
		a9os_core_main.addEventListener(currAV, "error", (event, currAV) => {
			if (currAV.getAttribute("src") == "") return;
			if (!core.link.hash.get()["file"]) {
				self.component.querySelector(".player").classList.remove("playing");
				self.component.querySelector(".buffering").classList.remove("show");
				return;
			}
			self.component.querySelector(".buffering").classList.remove("show");
			self.component.querySelector(".error").classList.add("show");
		});

		setInterval((component) => {
			var currAV = component.querySelector("video.used, audio.used");
			if (currAV) { 
				component.querySelector(".times .c").textContent = new Date(currAV.currentTime * 1000).toISOString().substr(11, 8);

				var currentPercent = 100 / currAV.duration * currAV.currentTime;
				component.querySelector(".bar .played").style.width = currentPercent+"%";
			}

		}, 500, self.component);
	} 


	a9os_core_main.addEventListener(self.component.querySelector(".player"), "onmouseover", self.hidePlayerControls);
	a9os_core_main.addEventListener(self.component.querySelector(".player"), "onmousemove", self.preventHideControls);
	a9os_core_main.addEventListener(self.component.querySelector(".player"), "onmouseout", self.cancelHideControls);
	a9os_core_main.addEventListener(self.component.querySelector(".player"), "onkeypress", self.detectKeys);

	a9os_core_main.addEventListener(self.component.querySelector(".player"), "wheel", (event) => {
		var direction = (event.deltaY < 0)?"up":"down";
		if (direction == "up") {
			self.upVolume();
		} else {
			self.downVolume();
		}
	});

	a9os_core_main.addEventListener(self.component.querySelector(".player .big-play"), "click", self.mediaPopup.item.alterPlayPause);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .play"), "click", self.mediaPopup.item.alterPlayPause);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .prevvideo"), "click", self.mediaPopup.item.prevVideo);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .stop"), "click", self.mediaPopup.item.stop);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .nextvideo"), "click", self.mediaPopup.item.nextVideo);

	a9os_core_main.addEventListener(self.component.querySelector(".player .bar"), ["mouseup", "touchleave"], self.moveVideoTime);

	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .v.up"), "click", self.upVolume);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .v.down"), "click", self.downVolume);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .v.percent"), "click", self.alterMuteVolume);


	a9os_core_main.addEventListener(self.component.querySelector(".player .big-play"), "dblclick", self.toggleFullScreen);
	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .fullscreen"), "click", self.toggleFullScreen);

	a9os_core_main.addEventListener(self.component.querySelector(".player .controls .list"), "click", self.mediaPopup.alterShow);
	a9os_core_main.addEventListener(self.component.querySelector(".media-popup .buttons .add"), "click", self.mediaPopup.selectNewFile);
	a9os_core_main.addEventListener(self.component.querySelector(".media-popup .buttons .repeat"), "click", self.mediaPopup.alterRepeatButton);
	a9os_core_main.addEventListener(self.component.querySelector(".media-popup .buttons .shuffle"), "click", self.mediaPopup.alterShuffleButton);
}

a9os_app_mediaviewer_main.moveVideoTime = (event, element) => {
	
	var video = self.component.querySelector("video.used, audio.used");
	if (!video) return;

	var mousePercent = 100/element.offsetWidth * event.offsetX;
	video.currentTime = parseFloat((video.duration / 100 * mousePercent).toFixed(6));
}

a9os_app_mediaviewer_main.moveVideoStep = (backOrForward) => {
	
	var video = self.component.querySelector("video.used, audio.used");
	if (!video) return;

	if (backOrForward) {
		video.currentTime += 5;
	} else {
		video.currentTime -= 5;
	}
}

a9os_app_mediaviewer_main.upVolume = () => {
	
	var arrAV = self.component.arrAV;

	for (var i = 0 ; i < arrAV.length ; i++) {
		var video = arrAV[i];

		if (video.volume < 1){
			video.volume += 0.1;
		}
	}

	var downVolBtn = self.component.querySelector(".player .controls .v.down");
	var button = self.component.querySelector(".player .controls .v.up");
	if (video.volume == 1) {
		button.disabled = true;
	} else {
		button.disabled = false;
	}
	downVolBtn.disabled = false;
}

a9os_app_mediaviewer_main.downVolume = () => {
	

	var arrAV = self.component.arrAV;

	for (var i = 0 ; i < arrAV.length ; i++) {
		var video = arrAV[i];

		if (video.volume.toFixed(2) > 0.00){
			video.volume -= 0.1;
		}
	}


	var upVolBtn = self.component.querySelector(".player .controls .v.up");
	var button = self.component.querySelector(".player .controls .v.down");
	if (video.volume.toFixed(2) == 0) button.disabled = true;
	else button.disabled = false;
	upVolBtn.disabled = false;
}

a9os_app_mediaviewer_main.alterMuteVolume = () => {
	
	var arrAV = self.component.arrAV;

	for (var i = 0 ; i < arrAV.length ; i++) {
		var video = arrAV[i];

		video.muted = !video.muted;
	}

	var element = self.component.querySelector(".player .controls .v.percent");
	if (video.muted) {
		element.classList.add("muted");
	} else {
		element.classList.remove("muted");
	}
}

a9os_app_mediaviewer_main.toggleFullScreen = () => {
		if (a9os_core_window.isFullscreen()) {
		a9os_core_window.unsetFullscreen();
	} else {
		a9os_core_window.setFullscreen();
	}
}


a9os_app_mediaviewer_main.hidePlayerControls = () => {
	
	if (self.component.querySelector("video.used")) {	
		self.component.stmHandler = setTimeout((component) => {
			component.querySelector(".player").classList.add("stop-over");
			component.doStm = 1;
		}, 2000, self.component);
	}
}

a9os_app_mediaviewer_main.preventHideControls = () => {
	
	a9os_app_mediaviewer_main.cancelHideControls();
	a9os_app_mediaviewer_main.hidePlayerControls();
}

a9os_app_mediaviewer_main.cancelHideControls = () => {
	
	if (self.component.stmHandler != 0){
		clearTimeout(self.component.stmHandler);
		if (self.component.doStm== 1){
			self.component.querySelector(".player").classList.remove("stop-over");
			self.component.doStm = 0;
		}
	}
}

a9os_app_mediaviewer_main.detectKeys = (event) => {
	
	if (event.keyCode == 32){
		self.mediaPopup.item.alterPlayPause();
	}

	if (event.keyCode == 70 || event.keyCode == 102){
		self.toggleFullScreen();
	}
	
}




a9os_app_mediaviewer_main.file = {};
a9os_app_mediaviewer_main.file.handle = () => {
	
	self.component.fileHandleId = a9os_app_vf_main.fileHandle.attach(
		self.component,
		{
			fn : self.file.getConfigData,
			args : {
				component : self.component
			}
		},
		false,
		{
			fn : self.file.getFileData,
			args : {
				component : self.component,
				handle : false
			}
		},
		false,
		false,
		{ //cancelFn
			fn : a9os_core_main.selectWindow,
			args : {
				component : self.component
			}
		}
	);

	self.component.querySelector(".player").setAttribute("data-vf-drop-area", self.component.fileHandleId);
}

a9os_app_mediaviewer_main.file.getConfigData = (component) => {
	return { qty : "simple", type : "file", fileExtensions : component.fileExtensions, dropType : "single", onlySrcUrl : true }
}

a9os_app_mediaviewer_main.file.getFileData = (component, handle) => {
	
	if (handle.path == "untitled") return;

	self.mediaPopup.item.append(handle.path, handle.srcUrl, true);
}

a9os_app_mediaviewer_main.file._updateWindowData = (path) => {
	
	var arrPathName = a9os_core_main.splitFilePath(path);

	var originalTitle = a9os_core_window.getWindowData()["originalTitle"];
	var arrWindowTitle = [arrPathName[1], originalTitle];

	a9os_core_window.updateWindowData({ title : arrWindowTitle.join(" - ") });
}


a9os_app_mediaviewer_main.loadBufferedProgress = () => {
	
	var video = self.component.querySelector("video.used, audio.used");
	if (!video) return;

	var playerBar = self.component.querySelector(".player .bar");

	var arrLoadDivs = playerBar.querySelectorAll(".load");
	for (var i = 0 ; i < arrLoadDivs.length ; i++) {
		playerBar.removeChild(arrLoadDivs[i]);
	}

	var arrTimeRanges = video.buffered;
	var arrIntTimeRanges = [];
	for (var i = 0 ; i < arrTimeRanges.length ; i++) {
		var used = false;
		for (var x = 0 ; x < arrIntTimeRanges.length ; x++) {
			if (arrIntTimeRanges[x][0] == arrTimeRanges.start(i) && arrIntTimeRanges[x][1] == arrTimeRanges.end(i)) {
				used = true;
				break;
			}
		}

		if (!used) arrIntTimeRanges.push([arrTimeRanges.start(i), arrTimeRanges.end(i)]);
	}

	for (var i = 0 ; i < arrIntTimeRanges.length ; i++) {
		var currTimeRange = arrIntTimeRanges[i];

		var newLoadDiv = document.createElement("div");
		newLoadDiv.classList.add("load");
		newLoadDiv.style.marginLeft = secondsToPercent(currTimeRange[0]) + "%";
		newLoadDiv.style.width = secondsToPercent(currTimeRange[1] - currTimeRange[0]) + "%";
		playerBar.appendChild(newLoadDiv);
	}

	function secondsToPercent(seconds) {
		var videoLength = video.duration;
		return 100 * seconds / videoLength;
	}
}

a9os_app_mediaviewer_main.mediaPopup = {};
a9os_app_mediaviewer_main.mediaPopup.alterShow = (event, listButton) => {
	
	var mediaPopup = self.component.querySelector(".media-popup");

	if (listButton.classList.contains("show")){
		listButton.classList.remove("show");
		mediaPopup.classList.remove("show");
	} else {
		listButton.classList.add("show");
		mediaPopup.classList.add("show");
	}
}

a9os_app_mediaviewer_main.mediaPopup.selectNewFile = () => {
	
	core.link.push("/vf", {
		folder : "/", 
		mode : "open", 
		config : self.file.getConfigData(self.component),
		cci : a9os_core_main.windowCrossCallback.add({
			fn : self.mediaPopup.item.appendFromVf,
			args : {
				component : self.component,
				path : false
			}
		}, self.component),
		cancelCci : a9os_core_main.windowCrossCallback.add({
			fn : a9os_core_main.selectWindow,
			args : {
				component : self.component,
			}
		}, self.component)
	}, false);
}

a9os_app_mediaviewer_main.mediaPopup.item = {};
a9os_app_mediaviewer_main.mediaPopup.item.append = (path, srcUrl, play) => {
	
	var ifExistsItem = self.component.querySelector(".media-popup .item[data-src-url='"+srcUrl+"']");
	if (ifExistsItem) {
		self.mediaPopup.item.play(ifExistsItem);
		return;
	}

	var newItem = document.createElement("div");
	newItem.classList.add("item");
	newItem.textContent = a9os_core_main.splitFilePath(path)[1];
	newItem.setAttribute("data-full-path", path);
	newItem.setAttribute("data-src-url", srcUrl);
	newItem.setAttribute("data-menu-r", JSON.stringify([
		{
			name : "Quitar",
			action : "mediaPopup.item.remove"
		}
	]));
	self.component.querySelector(".media-popup .list").appendChild(newItem);

	a9os_core_main.addEventListener(newItem, "dblclick", (event, item) => { self.mediaPopup.item.play(item) });

	var ifItemPlayedOrPaused = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");
	if (play || !ifItemPlayedOrPaused) self.mediaPopup.item.play(newItem);
}

a9os_app_mediaviewer_main.mediaPopup.item.remove = (event, item) => {
		if (item.classList.contains("play") || item.classList.contains("pause")) {
		self.mediaPopup.item.nextVideo();
	}
	item.parentElement.removeChild(item);
}

a9os_app_mediaviewer_main.mediaPopup.item.appendFromVf = (component, path) => {
		a9os_core_main.selectWindow(component);

	a9os_app_vf_main.fileHandle.getDirectFileUrl({ path : path }, {
		fn : (handle) => {
			self.mediaPopup.item.append(handle.path, handle.srcUrl);
		},
		args : {
			handle : false
		}
	}, path);
}

a9os_app_mediaviewer_main.mediaPopup.item.play = (item) => {
	
	var playingItem = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");
	if (playingItem) self.mediaPopup.item.stop();

	var path = item.textContent;
	var srcUrl = item.getAttribute("data-src-url");


	core.link.hash.set({ file : item.getAttribute("data-full-path") });
	setTimeout((srcUrl, path) => {
		var extension = a9os_core_main.getFileExtension(path);
		var elementName = self.component.formatElementTable[extension];
		var video = self.component.querySelector(elementName);

		video.classList.add("used");

		video.src = srcUrl;
		video.load();
		video.play();

		var winColor = "#886c4e";
		if (elementName == "audio") winColor = "#608a92";
		self.component.goToParentClass("window").querySelector(".window-bar").setAttribute("data-window-color", winColor);
		a9os_core_window.setWindowColor(self.component.goToParentClass("window"));

	}, 50, srcUrl, path);

	self.file._updateWindowData(path);
	item.classList.add("play");


	var firstItem = self.component.querySelector(".media-popup .list").firstChild;
	var lastItem = self.component.querySelector(".media-popup .list").lastChild;

	var prevVideoBtn = self.component.querySelector(".player .controls .prevvideo");
	var nextVideoBtn = self.component.querySelector(".player .controls .nextvideo");


	if (firstItem == item && lastItem == item){
		prevVideoBtn.disabled = true;
		nextVideoBtn.disabled = true;
	} else if (firstItem == item) {
		prevVideoBtn.disabled = true;
		nextVideoBtn.disabled = false;
	} else if (lastItem == item) {
		prevVideoBtn.disabled = false;
		nextVideoBtn.disabled = true;
	} else {
		prevVideoBtn.disabled = false;
		nextVideoBtn.disabled = false;
	}
}

a9os_app_mediaviewer_main.mediaPopup.item.alterPlayPause = (event, button) => {
	
	var video = self.component.querySelector("video.used, audio.used");
	if (!video) {
		var playingItem = self.component.querySelector(".media-popup .list .item");
		self.mediaPopup.item.play(playingItem);
		return;
	}

	var item = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");
	if (item) {	
		if (item.classList.contains("play")) {
			video.pause();
			item.classList.remove("play");
			item.classList.add("pause");
		} else {
			video.play();
			item.classList.add("play");
			item.classList.remove("pause");
		}
	}
}

a9os_app_mediaviewer_main.mediaPopup.item.stop = () => {
	
	var itemPlayed = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");
	if (itemPlayed) {	
		itemPlayed.classList.remove("play");
		itemPlayed.classList.remove("pause");
	}

	var video = self.component.querySelector("video.used, audio.used");

	self.component.querySelector(".bar .played").style.width = 0;

	if (video) {
		video.pause();
		video.currentTime = 0;

		video.src = "";
		video.load();

		video.classList.remove("used");

		self.component.querySelector(".player").classList.remove("playing");

		core.link.hash.set({ file : null });

		return;
	}

}

a9os_app_mediaviewer_main.mediaPopup.item.nextVideo = () => {
	
	var playingItem = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");

	var isShuffle = self.component.querySelector(".media-popup .buttons .shuffle.enabled");
	var repeatMode = "";
	var repeatBtn = self.component.querySelector(".media-popup .buttons .repeat");
	if (repeatBtn.classList.contains("one")) repeatMode = "one";
	if (repeatBtn.classList.contains("list")) repeatMode = "list";

	if (playingItem) {
		if (isShuffle) {
			var nextVideoItem = self.getRandomItem(playingItem.parentElement);
		} else if (repeatMode == "one") {
			var nextVideoItem = playingItem;
		} else if (repeatMode == "list") {
			var nextVideoItem = playingItem.nextElementSibling;
			if (!nextVideoItem) nextVideoItem = playingItem.parentElement.firstChild;
		} else {
			var nextVideoItem = playingItem.nextElementSibling;
		}
	} else {
		var nextVideoItem = self.component.querySelector(".media-popup .list .item");
	}

	self.mediaPopup.item.stop();

	if (nextVideoItem) self.mediaPopup.item.play(nextVideoItem);
}

a9os_app_mediaviewer_main.mediaPopup.item.prevVideo = () => {
	
	var playingItem = self.component.querySelector(".media-popup .list .item.play, .media-popup .list .item.pause");

	var isShuffle = self.component.querySelector(".media-popup .buttons .shuffle.enabled");
	var repeatMode = "";
	var repeatBtn = self.component.querySelector(".media-popup .buttons .repeat");
	if (repeatBtn.classList.contains("one")) repeatMode = "one";
	if (repeatBtn.classList.contains("list")) repeatMode = "list";



	if (playingItem) {
		if (isShuffle) {
			var nextVideoItem = self.getRandomItem(playingItem.parentElement);
		} else if (repeatMode == "one") {
			var nextVideoItem = playingItem;
		} else if (repeatMode == "list") {
			var nextVideoItem = playingItem.previousElementSibling;
			if (!nextVideoItem) nextVideoItem = playingItem.parentElement.lastChild;
		} else {
			var nextVideoItem = playingItem.previousElementSibling;
		}
	} else {
		var nextVideoItem = self.component.querySelector(".media-popup .list .item");
	}

	self.mediaPopup.item.stop();

	if (nextVideoItem) self.mediaPopup.item.play(nextVideoItem);
}

a9os_app_mediaviewer_main.mediaPopup.alterRepeatButton = (event, button) => {
	
	if (button.classList.contains("one")) {
		button.classList.remove("one");
		button.classList.add("list");
	} else if (button.classList.contains("list")) {
		button.classList.remove("one");
		button.classList.remove("list");
	} else {
		button.classList.add("one");
		button.classList.remove("list");
	}
}

a9os_app_mediaviewer_main.mediaPopup.alterShuffleButton = (event, button) => {
	
	if (button.classList.contains("enabled")) {
		button.classList.remove("enabled");
	} else {
		button.classList.add("enabled");
	}
}

a9os_app_mediaviewer_main.getRandomItem = (list) => {
		
	var currentPlayingItem = -1;
	for (var i = 0 ; i < list.children.length ; i++) {
		var currChildrenItem = list.children[i];
		if (currChildrenItem.classList.contains("play") || currChildrenItem.classList.contains("pause")) {
			currentPlayingItem = i;
			break;
		}
	}

	var newRandomItemI = -1;
	do {
		newRandomItemI = getRandomInt(0, list.children.length-1);
	} while (list.children.length != 1 && newRandomItemI == currentPlayingItem);

	return list.children[newRandomItemI];


	function getRandomInt(min, max) {
		min = Math.ceil(min);
		max = Math.floor(max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}
}