<?php namespace Filmkeep;

class TheMovieDb {

	public $tmdb;
	
	public function __construct()
	{
		
		$apikey = 'f39589d9c877cecbe4032052979da1aa';
    $this->tmdb = new \TMDb($apikey,'en');
	}
    
	public function getFilmTrailer($tmdb_id)
	{
		
    if ( ! $film_trailer =  \Cache::get("film_trailer-".$tmdb_id))
		{
			
			$film_trailer = $this->tmdb->getMovieTrailers($tmdb_id,'en');
		
			// Save into the cache for 1 month
			\Cache::put("film_trailer-".$tmdb_id, $film_trailer,  40320);
		}
        	
		
        	return $film_trailer;
	}
	
	 /**
	 * Get film by tmdb id
	 * 
	 * Handles the Ajax call to get tmdb info for film 
	 * 
	 */
	public function getFilmTmdb($tmdb_id)
	{

		
		if ( ! $film_info =  \Cache::get("film_info-".$tmdb_id))
		{
			
			$film_info = $this->tmdb->getMovie($tmdb_id, 'en');
		
			// Save into the cache for 1 month
			\Cache::put("film_info-".$tmdb_id, $film_info,  40320);
		}

		

		return $film_info;

	}
	
	public function getImgPath()
	{
		
		//get image path configuration
		if ( ! $image_path_config =  \Cache::get("image_path_config"))
		{
			
			$image_path_config = $this->tmdb->getConfiguration();
		
			// Save into the cache for 2 week
			\Cache::put('image_path_config', $image_path_config, 20160);
		}
		
		
		return $image_path_config;
	}

	/**
	* Film Search tmdb
	* 
	* Handles the Ajax call to search tmdb for films 
	* 
	*/
	public function searchTmdb($query)
	{

    if ( ! $results =  \Cache::get("query-". $query))
    {
  		$results = $this->tmdb->searchMovie($query, 1,'ngram');

      // Save into the cache for 1 day
      \Cache::put("query-". $query, $results, 1440);
    }

    return $results;
	}

  /**
  * now plyaing tmdb
  * 
  * Handles the Ajax call to retrieve now playing films 
  * 
  */
  public function getNowPlaying()
  {

    //get image path configuration
    if ( ! $now_playing =  \Cache::get("now_playing"))
    {
      
      $now_playing = $this->tmdb->getNowPlayingMovies();
    
      // Save into the cache for 1 day
      \Cache::put('now_playing', $now_playing, 1440);
    }

    return $now_playing;

  }
    
}