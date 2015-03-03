<?php

use Filmkeep\Follower;
use Filmkeep\User;

class FollowerController extends \BaseController {

  public function getFollowers()
  {
    $user = User::with('followers')->where('id',Auth::user()->id)->first();
    return $user;
  }

	/**
	 * Follow a user
	 *
	 * @return Response
	 */
	public function follow($follow_id)
	{
    if(!$follow_id)
      return Response::json(['response'=>'failed']);

    $user = Auth::user();

    Follower::firstOrCreate(['user_id'=>$user->id, 'follower_id'=>$follow_id]);

    //follow the feed
    FeedManager::followUser($user->id, $follow_id);

    return User::with('followers')->where('id',Auth::user()->id)->first();

	}


  /**
   * Follow a user
   *
   * @return Response
   */
  public function unfollow($follower_id)
  {
    if(!$follower_id)
      return Response::json(['response'=>'failed']);

    $user = Auth::user();

    $follow = Follower::where('user_id',$user->id)->where('follower_id', $follower_id)->first();
    $follow_id = $follow->id;
    $follow->delete();

    // $api_key = \Config::get('stream-laravel::api_key');
    // $api_secret = \Config::get('stream-laravel::api_secret');
    // $client = new GetStream\Stream\Client($api_key, $api_secret );
    // $user_feed = $client->feed("user","{$user->id}");
    // $user_feed->removeActivity("Filmkeep\Follower:{$follow_id}", true);

    //unfollow the feed
    FeedManager::unfollowUser($user->id, $follower_id);

    return User::with('followers')->where('id',Auth::user()->id)->first();

  }

}