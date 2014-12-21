<?php
use Filmkeep\Review;
use Filmkeep\Rating;
use Filmkeep\Rating_type;
use Filmkeep\Film;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;
use Filmkeep\TheMovieDb;

class FilmTableSeeder extends Seeder {
 
  public function run()
  {
    
    for($i=100;$i<150;$i++){
      $TheMovieDb = new TheMovieDb();
      $tmdb_info = $TheMovieDb->getFilmTmdb($i);
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

        $film = Film::create($film_data);
        usleep(500000);
      }
    }

  }
 
}