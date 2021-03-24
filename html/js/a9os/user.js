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
a9os_user.config = {};
a9os_user.user = {};
a9os_user.main = (data) => {
	for (var i in data.user) {
		self.user[i] = data.user[i];
	}
	for (var x in data.config) {
		self.config[x] = data.config[x];
	}

}

a9os_user.logout = (event) => {
	core.cookie.remove("a9os_user_token");
	a9os_app_vf_desktop.selectDesktop();
	core.reloadPage();
}

a9os_user.getConfig = (path) => {
	return self.config[path];
}
a9os_user.setConfig = (path, value) => {
	var path = path.trim();
	path = path.toLowerCase();

	self.config[path] = value;

	core.sendRequest(
		"/user/setConfig",
		{
			path : path,
			value : value
		},
		{
			fn : (response) => {
				//nothing
			},
			args : {
				response : false
			}
		},
		false,
		true
	);

	return value;
}