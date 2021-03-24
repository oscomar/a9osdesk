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

class a9os_app_vf_file_extension_preview_imagick extends a9os_app_vf_file_extension_preview {

	public function createThumb($file, $hash) {

		/*$arrExtensions = Imagick::queryformats();
		error_log(json_encode($arrExtensions));*/
		/*unset($arrExtensions[array_search("TXT", $arrExtensions)]);
		unset($arrExtensions[array_search("PDF", $arrExtensions)]);*/


		if (file_exists($this->getPreviewsFolder().$hash.".PNG")) return true;

		try {		
			$tmb = new Imagick();

			$tmb->setBackgroundColor(new ImagickPixel('rgba(0%, 0%, 0%, 0.1)'));
			$tmb->readImage($file);
			$tmb->setImageFormat("png");
			$tmb->thumbnailImage(200, 200, true);
			$tmb->setOption("png:compression-level", 8);
			$tmb->writeImage($this->getPreviewsFolder().$hash.".PNG");

			//error_log("made ".$file);

			return true;
		} catch (Exception $e) {
			error_log($e);
		}

		return false;
	}

}