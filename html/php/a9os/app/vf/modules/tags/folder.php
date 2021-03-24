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

class a9os_app_vf_modules_tags_folder extends a9os_app_vf_main {
	public function main($data){ // TAGS/ASD/
		$path = $data["data"]["path"];
		$arrPath = explode("/", $path);
		if (isset($arrPath[3])) return [
			"error" => "TAGS: Ruta incorrecta"
		];

		$tagName = "";
		if (!empty($arrPath[1])) $tagName = trim(mb_strtolower($arrPath[1]));

		$arrFoldersAndFiles = [];
		if (empty($tagName)) {
			$arrFoldersAndFiles = $this->getTagFolders();
		} else {
			$arrFoldersAndFiles = $this->getFilesFromTag($tagName);
		}

		// common output!!
		$arrFolderAddons = $this->processFolderAddons($path, $arrFoldersAndFiles);
		foreach ($arrFoldersAndFiles as $k => $currFile) {
			$arrFoldersAndFiles[$k] = $currFile->getData();
		}
		//////

		return [
			"files" => $arrFoldersAndFiles,
			"path" => $path,
			"postUpdate" => false,
			"folderAddons" => $arrFolderAddons
		];
	}

	public function getTagFolders(){
		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$tagsCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");

		$tagsCollection->_setSelect("
			SELECT * from {$tagsCollection->getTableName()}
			where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
		");

		$arrTagfolders = [];
		while ($currTag = $tagsCollection->fetch()) {
			$currFileObj = $this->getCore()->getModel("a9os.app.vf.file");
			$currFileObj->setType("folder");
			$currFileObj->setA9osUserId($a9osUser->getID());
			$currFileObj->setPath("TAGS/".$currTag->getName()."/");

			$arrTagfolders[] = $currFileObj;
		}

		return $arrTagfolders;
	}

	public function getFilesFromTag($tagName){
		$tagName = mb_strtolower(trim($tagName));
		if (empty($tagName)) return false;

		$a9osUser = $this->getCore()->getModel("a9os.user")->getSessionUser();
		$vfTag = $this->getCore()->getModel("a9os.app.vf.modules.tags.tag");
		$vfTag->_setSelect("
			SELECT * from {$vfTag->getTableName()}
			where {$a9osUser->getPrimaryIdx()} = {$a9osUser->getID()}
			and name = {$this->_quote($tagName)}
		");
		$vfTag = $vfTag->fetch();
		if (!$vfTag) return false;

		$vfFileTagCollection = $this->getCore()->getModel("a9os.app.vf.modules.tags.file.tag");
		$vfFileTagCollection->_setSelect("
			SELECT * from {$vfFileTagCollection->getTableName()}
			where {$vfTag->getPrimaryIdx()} = {$vfTag->getID()}
		");

		$arrFiles = [];
		$appAppExtension = $this->getCore()->getModel("application.application.extension");
		$vfExtPreview = $this->getCore()->getModel("a9os.app.vf.file.extension.preview");

		while ($currVfFileTag = $vfFileTagCollection->fetch()) {

			foreach ($arrFiles as $currFile) { // skip if file in arrFiles - files with more than one tagvalue with same tagname
				if ($currFile->getID() == $currVfFileTag->getA9osAppVfFileId()) continue 2;
			}


			$currFileObj = $this->getCore()->getModel("a9os.app.vf.file")->load($currVfFileTag->getA9osAppVfFileId());
			if (!$currFileObj) {
				$currVfFileTag->delete();
				continue;
			}


			$arrOpenApp = $appAppExtension->getApplicationByExtension($currFileObj->getExtension());
			$currFileObj->setOpenWithPath($arrOpenApp["path"]);
			$currFileObj->setOpenWithName($arrOpenApp["name"]);
			$currFileObj->setOpenWithIconUrl($arrOpenApp["icon_url"]);

			$arrFileStat = stat(mb_substr($this->getUserFolder(), 0, -1).$currFileObj->getPath());
			$currFileMtime = $arrFileStat["mtime"];
			$currSize = (double)$arrFileStat["size"];
			$currFileObj->setSize($currSize);
			$currFileObj->setDateModified(date('Y-m-d H:i:s', $currFileMtime));


			$thumbObject = $vfExtPreview->getThumbObjectByPath($currFileObj->getPath());
			$fileIcon = $appAppExtension->getFileIconByPath($currFileObj->getPath());
			if ($fileIcon) $currFileObj->setPreviewUrl($this->getIconsFolder().$fileIcon);

			if ($vfExtPreview->ifPathNeedsPreview($currFileObj->getPath()) && $currFileObj->getPreviewMade() == 1) {			
				$previewImgUrl = $vfExtPreview->getPreviewUrl($currFileObj->getHash(), $currFileObj->getPath());
				$currFileObj->setPreviewUrl($previewImgUrl);
			}

			$fileName = $currFileObj->getPath();
			$fileName = explode("/", $fileName);
			$fileName = $fileName[count($fileName) - 1 ];

			$currFileObj->setRealPath($currFileObj->getPath()); //getRealPath() in a9os_app_vf_modules_tags_folderaddon::receiveFiles if $pathIsTag
			$currFileObj->setPath("TAGS/".$tagName."/".$fileName);
			$arrFiles[] = $currFileObj;
		}

		return $arrFiles;
	}
}