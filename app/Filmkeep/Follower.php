<?php namespace Filmkeep;

class Follower extends \Eloquent {

    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;
    protected $guarded = [];

    public $activityLazyLoading = ['target','user'];

    public function target()
    {
        return $this->belongsTo('Filmkeep\User', 'follower_id');
    }

    public function user()
    {
     return $this->belongsTo('Filmkeep\User', 'user_id');
    }

    public function activityNotify()
    {
        $targetFeed = \FeedManager::getNotificationFeed($this->target->id);
        return array($targetFeed);
    }
 
}
