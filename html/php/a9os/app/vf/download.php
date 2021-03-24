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

class a9os_app_vf_download extends a9os_app_vf_main {
	public function main($data){
		$arrPaths = $data["data"];

		if (count($arrPaths) < 1) $this->getCore()->end();

		if (count($arrPaths) == 1) {
			$userFolder = $this->getUserFolder();
			$pathToDownload = $userFolder.$arrPaths[0];
			if (is_dir($pathToDownload)) {
				$this->downloadDirectory($pathToDownload);
			} else {
				$this->returnFile($pathToDownload);
			}
		} else {
			$arrFiles = [];
			foreach ($arrPaths as $currPath) {
				$arrFiles[] = $this->getUserFolder().$currPath;
			}
			$this->zipFiles($arrFiles);
		}

		$this->getCore()->end();
	}

	public function downloadDirectory($path){
		$arrFiles = [];
		$arrScanFiles = scandir($path);
		foreach ($arrScanFiles as $currScanFile) {
			if ($currScanFile[0] == ".") continue;
			$arrFiles[] = $path.$currScanFile;
		}
		$this->zipFiles($arrFiles);
	}

	public function zipFiles($arrPaths){

		$zipTmpName = "a9os_tmpzip_".rand(1000, 999999).".zip";

		$zip = new ZipArchive();
		$zip->open('/tmp/'.$zipTmpName, ZipArchive::CREATE | ZipArchive::OVERWRITE);

		foreach ($arrPaths as $currPath){
			if (!is_dir($currPath)){
				$relativePath = substr($currPath, strlen($this->getUserFolder())-strlen($currPath));
				$zip->addFile($currPath, $relativePath);
			}
		}

		$zip->close();

		$this->returnFile("/tmp/".$zipTmpName);
	}
}