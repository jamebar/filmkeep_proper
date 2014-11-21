<?php 
use Filmkeep\User;
use Filmkeep\Review;
use Filmkeep\Film;
use Filmkeep\Rating;
use Filmkeep\Follower;
use Filmkeep\TheMovieDb;
use Filmkeep\Forms\AddReview;


class FilmController extends BaseController {


  public function index()
  {
    $tmdb_id = \Input::get('tmdb_id');
    $film = Film::where('tmdb_id', $tmdb_id)->first();

    if(is_null($film))
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

          $film = Film::create($film_data);
        }
    }
    
    if(isset($film->id))
    {
      $film_id = $film->id;
      $response = ['film'=>$film];
      if(Auth::check())
      {
        $followers = Follower::where('user_id', Auth::user()->id)->lists('follower_id');
        $follower_reviews =  Review::with('user','film','ratings','ratings.rating_type')
                      ->where('film_id', $film_id)
                      ->whereIn('user_id', $followers)
                      ->take(10)
                      ->get();
        $response['follower_reviews'] = $follower_reviews;
      }
      return Response::json($response);
    }
    
  }
}