<?php namespace Filmkeep;


class Watchlist extends \Eloquent {
    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;

    protected $guarded = [];
    
    public $activityLazyLoading = ['film','user','comments'];

    public function film(){
         return $this->belongsTo('Filmkeep\Film');
    }

    public function user(){
        return $this->belongsTo('Filmkeep\User')->select(array('id', 'username','name','avatar'));
    }

    public function onWatchlist($tmdb_id)
    {
      
      $watchlist = $this::where('user_id', \Auth::user()->id)->whereHas('film', function($q) use ($tmdb_id)
      {
          $q->where('tmdb_id', '=', $tmdb_id);

      })->first();
      return is_null($watchlist) ? 'false' : 'true';


    }

    public function comments()
    {
        return $this->morphMany('Filmkeep\Comment', 'commentable');
    }
    
}
