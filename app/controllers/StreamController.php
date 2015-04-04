<?php

use Filmkeep\Review;
use Filmkeep\Film;
use Filmkeep\TheMovieDb;
use GetStream\StreamLaravel\Enrich;
use Filmkeep\User;
use Filmkeep\Follower;
use Filmkeep\Watchlist;

class StreamController extends Controller{

  public function index(){
    $type = Input::has('type') ? Input::get('type') : 'aggregated';
    $enricher = new Enrich();
    $feed = FeedManager::getNewsFeeds(Auth::id())[$type];
    $activities = $feed->getActivities(0,25)['results'];
    // return $activities;
    if($type === 'aggregated')
      $activities = $enricher->enrichAggregatedActivities($activities);
    else
      $activities = $enricher->enrichActivities($activities);

    $this->customEnrich($activities);

    return  $activities;
  }

  private function customEnrich($activities)
  {
    foreach($activities as &$activity_group)
    {
      foreach($activity_group['activities'] as &$activity)
      {
        
        switch($activity['verb']){
          case 'filmkeep\follower':
          break;
          case 'filmkeep\comment':
            // $activity['object']['commentable']['user'] = User::find($activity['object']['commentable']['user_id']);
          break;
          default:

            $review = Review::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($activity)
            {
                $q->where('tmdb_id', '=', $activity['object']['film']['tmdb_id']);

            })->first();
            $activity['object']['film']['reviewed'] = is_null($review) ? 'false' : 'true';

            
            $watchlist = Watchlist::where('user_id', Auth::user()->id)->whereHas('film', function($q) use ($activity)
            {
                $q->where('tmdb_id', '=', $activity['object']['film']['tmdb_id']);

            })->first();
            $activity['object']['film']['on_watchlist'] = is_null($watchlist) ? 'false' : 'true';
        }
      }
    }
  }

}