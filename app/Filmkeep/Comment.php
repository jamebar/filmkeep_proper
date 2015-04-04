<?php namespace Filmkeep;

class Comment extends \Eloquent {
    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;

    protected $guarded = [];

    public $activityLazyLoading = ['user','film','commentable'];

    public function user()
    {
     return $this->belongsTo('Filmkeep\User', 'user_id');
    }

    public function film()
    {
     return $this->belongsTo('Filmkeep\Film', 'film_id');
    }

    public function commentable()
    {
        return $this->morphTo();
    } 

    public function activityNotify()
    {
        $ob = new $this->commentable_type;
        $com = $ob->find($this->commentable_id);
        $user_ids = [];

        $owner_id = $this->commentable->user_id;
        if(\Auth::id() != $owner_id)
          $user_ids[] = $owner_id;

        foreach($com->comments as $c){
          if(\Auth::id() != $c->user_id)
            $user_ids[] = $c->user_id;
        }
        $unique_ids = array_unique($user_ids);

        $targetFeeds = [];
        foreach($unique_ids as $id){
          $targetFeeds[] = \FeedManager::getNotificationFeed($id);
        }
        // $targetFeed = \FeedManager::getNotificationFeed($this->target->id);
        return $targetFeeds;
    }
}
