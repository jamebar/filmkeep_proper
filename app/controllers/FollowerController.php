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
  public function unfollow($follow_id)
  {
    if(!$follow_id)
      return Response::json(['response'=>'failed']);

    $user = Auth::user();

    Follower::where('user_id',$user->id)->where('follower_id', $follow_id)->delete();

    //follow the feed
    FeedManager::unfollowUser($user->id, $follow_id);

    return User::with('followers')->where('id',Auth::user()->id)->first();

  }

}