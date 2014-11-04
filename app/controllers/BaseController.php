<?php

use Filmkeep\TheMovieDb;

class BaseController extends Controller {

  protected $image_path_config;

	/**
	 * Setup the layout used by the controller.
	 *
	 * @return void
	 */
	protected function setupLayout()
	{

    //Get image path info for all poster and backdrop images
    $t = new TheMovieDb();
    $this->image_path_config = $t->getImgPath();
    View::share('image_path_config', $this->image_path_config);


		if ( ! is_null($this->layout))
		{
			$this->layout = View::make($this->layout);
		}
	}

}
