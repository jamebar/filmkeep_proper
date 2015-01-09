<?php 
use Filmkeep\User;
use Filmkeep\Watchlist;
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
        $film = new Film();
        $film = $film->digestFilm($tmdb_id);
    }
    
    if(isset($film->id))
    {
      $film_id = $film->id;
      $response = ['film'=>$film];

      if(Auth::check())
      {
        $follower_reviews = [];
        $followers = Follower::where('user_id', Auth::user()->id)->lists('follower_id');
        if(count($followers))
        {
          $follower_reviews =  Review::with('user','film','ratings','ratings.rating_type')
                    ->where('film_id', $film_id)
                    ->whereIn('user_id', $followers)
                    ->take(10)
                    ->get();
        }
        $response['follower_reviews'] = $follower_reviews;
        $response['film']['reviewed'] = $this->isReviewed($film);
        $response['film']['on_watchlist'] = $this->onWatchlist($film);
      }
      return Response::json($response);
    }
    
  }

  public function nowPlaying()
  {
    $t = new TheMovieDb();
    $nowPlaying = [];
    $i = 0;
    foreach($t->getNowPlaying()['results'] as $tFilm){
      if($i >10)
        break;
      
      $f = new Film();
      $film = $f->digestFilm($tFilm['id']);
      $film['reviewed'] = $this->isReviewed($film);
      $film['on_watchlist'] = $this->onWatchlist($film);

      $nowPlaying[] = $film;
      $i++;
    }

    return Response::json($nowPlaying);
  }

  private function isReviewed($film)
  {
    
          $review = Review::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($film)
          {
              $q->where('tmdb_id', '=', $film['tmdb_id']);

          })->first();
          return is_null($review) ? 'false' : 'true';

  }

  private function onWatchlist($film)
  {
    
          $watchlist = Watchlist::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($film)
          {
              $q->where('tmdb_id', '=', $film['tmdb_id']);

          })->first();
          return is_null($watchlist) ? 'false' : 'true';


  }
}