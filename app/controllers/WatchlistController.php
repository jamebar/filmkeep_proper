<?php

use Filmkeep\Watchlist;
use Filmkeep\User;
use Filmkeep\Review;

class WatchlistController extends \BaseController {

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
    $user_id = \Input::get('user_id');
		$watchlist = Watchlist::with('film', 'comments')->where('user_id', $user_id)->orderBy('list_order', 'asc')->orderby('created_at','asc')->get();
    
    if($user_id == Auth::user()->id)
    {
      foreach($watchlist as &$w){
        $w['film']['on_watchlist'] = 'true';
      }
    }
    else{
      $this->checkWatchlistReviewed($watchlist);
    }
      
    
    return \Response::json(['status' => 200, 'results' => $watchlist]);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function addRemove()
	{
   
    $film_id = \Input::get('film_id');
    $user_id = \Auth::user()->id;
    $action = 'added';

    $results = Watchlist::where('film_id', $film_id)->where('user_id', $user_id)->first();

    if ( ! is_null($results))
    {
      $results->delete();
      $action = 'removed';
    }
    else
    {
      $results = Watchlist::create(['user_id'=>$user_id, 'film_id'=>$film_id]);
    }


		return Response::json(['action'=>$action]);
	}

  private function checkWatchlistReviewed($items)
  {
      foreach($items as &$item)
      {

          $review = Review::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($item)
          {
              $q->where('tmdb_id', '=', $item['film']['tmdb_id']);

          })->first();
          $item['film']['reviewed'] = is_null($review) ? 'false' : 'true';

          
          $watchlist = Watchlist::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($item)
          {
              $q->where('tmdb_id', '=', $item['film']['tmdb_id']);

          })->first();
          $item['film']['on_watchlist'] = is_null($watchlist) ? 'false' : 'true';
       
      }
    
  }


}
