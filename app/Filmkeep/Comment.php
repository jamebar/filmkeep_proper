<?php namespace Filmkeep;

class Comment extends \Eloquent {

    protected $guarded = [];

    // public $activityLazyLoading = ['target','user'];


    public function user()
    {
     return $this->belongsTo('Filmkeep\User', 'user_id');
    }

    public function commentable()
    {
        return $this->morphTo();
    } 
}
