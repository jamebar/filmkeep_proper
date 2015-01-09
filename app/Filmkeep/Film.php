<?php namespace Filmkeep;

use Filmkeep\TheMovieDb;

use Illuminate\Database\Eloquent\Model;

class Film extends Model {

	protected $guarded = [];


  public function digestFilm($tmdb_id)
  {
    
    $TheMovieDb = new TheMovieDb();
    $tmdb_info = $TheMovieDb->getFilmTmdb($tmdb_id);

    if(is_array($tmdb_info) && isset($tmdb_info['id'])){
      $poster_path = (isset($tmdb_info['poster_path'])) ? $tmdb_info['poster_path'] : "";
      $backdrop_path = (isset($tmdb_info['backdrop_path'])) ? $tmdb_info['backdrop_path'] : "";
      $imdb_id = (isset($tmdb_info['imdb_id'])) ? $tmdb_info['imdb_id'] : "";
      $overview = (isset($tmdb_info['overview'])) ? $tmdb_info['overview'] : "";
      $film_data = array(
        'tmdb_id' => $tmdb_info['id'],
        'title' => $tmdb_info['title'],
        'poster_path' => $poster_path,
        'backdrop_path' => $backdrop_path,
        'imdb_id' => $imdb_id,
        'summary' => $overview
      );

      //add the film
      $film = self::firstOrNew( ['tmdb_id'=>$film_data['tmdb_id']] );
      $film->fill($film_data)->save();

      return $film;
    }
    
  }

}
