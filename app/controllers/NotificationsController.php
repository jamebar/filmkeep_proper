<?php

use GetStream\StreamLaravel\Enrich;

class NotificationsController extends Controller{

  public function index(){

    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    $feed = FeedManager::getNotificationFeed(Auth::user()->id);
    $enricher = new Enrich();
    $activities = $feed->getActivities(0,10)['results'];
    $activities = $enricher->enrichAggregatedActivities($activities);
    return $activities;

  }

  public function markSeen(){
    if(Auth::guest())
      App::abort(403, 'Unauthorized action.');

    $feed = FeedManager::getNotificationFeed(Auth::user()->id);
    $options = array('mark_seen' => true);
    $activities = $feed->getActivities(0,100,$options);
    return Response::json(['response'=> true]);
  }

}