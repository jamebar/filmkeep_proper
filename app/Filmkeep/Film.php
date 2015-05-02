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
      $release_date = (isset($tmdb_info['release_date'])) ? $tmdb_info['release_date'] : "";
      $film_data = array(
        'tmdb_id' => $tmdb_info['id'],
        'title' => $tmdb_info['title'],
        'poster_path' => $poster_path,
        'backdrop_path' => $backdrop_path,
        'release_date' => $release_date,
        'imdb_id' => $imdb_id,
        'summary' => $overview,
        'certification' => $this->getCertification($tmdb_info)
      );

      //add the film
      $film = self::firstOrNew( ['tmdb_id'=>$film_data['tmdb_id']] );
      $film->fill($film_data)->save();

      return $film;
    }
    
  }

  private function getCertification($info)
  {
    if (!isset($info['releases']))
      return NULL;
    $value = array_first($info['releases']['countries'], function($key, $value)
    {
        return $value['iso_3166_1'] == 'US';
    });

    if(isset($value['certification']))
      return $value['certification'];

    return NULL;
  }

  public function comments()
  {
      return $this->morphMany('Filmkeep\Comment', 'commentable');
  }

}
