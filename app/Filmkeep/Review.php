<?php namespace Filmkeep;


class Review extends \Eloquent {
    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;

	  protected $guarded = [];
    
    public $activityLazyLoading = ['film','ratings','ratings.rating_type'];

    public function film(){
         return $this->belongsTo('Filmkeep\Film');
    }

    public function user(){
        return $this->belongsTo('Filmkeep\User')->select(array('id', 'username','name','avatar'));
    }

    public function ratings(){
        return $this->hasMany('Filmkeep\Rating');
    }

    
}
