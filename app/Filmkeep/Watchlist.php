<?php namespace Filmkeep;


class Watchlist extends \Eloquent {
    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;

    protected $guarded = [];
    
    public $activityLazyLoading = ['film','user'];

    public function film(){
         return $this->belongsTo('Filmkeep\Film');
    }

    public function user(){
        return $this->belongsTo('Filmkeep\User')->select(array('id', 'username','name','avatar'));
    }

    
}
