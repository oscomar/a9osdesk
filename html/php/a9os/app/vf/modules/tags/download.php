<?php 
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

class a9os_app_vf_modules_tags_download extends a9os_app_vf_download {
	public function main($data){
		$arrTagPaths = $data["data"];
		if (count($arrTagPaths) < 1) $this->getCore()->end();

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();

		$arrFiles = [];
		foreach ($arrTagPaths as $currTagPath) {
			$currTagName = trim(mb_strtolower(explode("/", $currTagPath)[1]));
			$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
			$vfTag->_setSelect("
				SELECT * from {$vfTag->getTableName()}
				where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
				and name = {$this->_quote($currTagName)}
			");
			$vfTag = $vfTag->fetch();
			if (!$vfTag) continue;

			$tagFilesCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
			$tagFilesCollection->_setSelect("
				SELECT * from {$tagFilesCollection->getTableName()}
				where {$vfTag->getPrimaryIdx()} = {$vfTag->getID()}
			");

			while ($currTagFile = $tagFilesCollection->fetch()) {
				$vfFile = $this->getCore()->getModel("a9os.app.vf.file")->load($currTagFile->getA9osAppVfFileId());
				$arrFiles[] = $this->getUserFolder().$vfFile->getPath();
			}
		}

		$this->zipFiles($arrFiles);
		$this->getCore()->end();

	}
}