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
    
    if(Auth::check() && count($watchlist) > 0)
    $this->checkWatchlistReviewed($watchlist);

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
      $ids = [];
      foreach($items as $item)
      {
        $ids[] = $item['film_id'];
      }
      
      $review_matches = Review::where('user_id', Auth::user()->id)->whereIn('film_id', $ids)->get();
      $watchlist_matches = Watchlist::where('user_id', Auth::user()->id)->whereIn('film_id', $ids)->get();

      foreach($items as &$item)
      {
        $item['film']['reviewed'] = 'false';
        $item['film']['on_watchlist'] = 'false';

        foreach($review_matches as $rm)
        {

          if($item['film_id'] == $rm->film_id)
            $item['film']['reviewed'] = 'true';
        }
        foreach($watchlist_matches as $wm)
        {

          if($item['film_id'] == $wm->film_id)
            $item['film']['on_watchlist'] = 'true';
        }
        
      }
    
  }


}
