<?php namespace Filmkeep;

class GuideBox {

  public $gb;
  
  public function __construct()
  {
    $apikey = 'rKgXnowagmpL6XTR5qBQmK4hrV5dbBsl';
    $this->gb = new \GuideBox($apikey);
  }
    
  public function getMovie($tmdb_id)
  {
    
    if ( ! $movie_info =  \Cache::get("gb_movie-".$tmdb_id))
    {
      
      $gb_movie = $this->gb->searchTmdb($tmdb_id);
      if(isset($gb_movie['id']))
      {
        $movie_info = $this->gb->getMovie($gb_movie['id']);
        // Save into the cache for 1 week
        \Cache::put("gb_movie-".$tmdb_id, $movie_info,  10080);
      }
      else
      {
        return false;
      }
      
    }
          
    return $movie_info;
  }
  