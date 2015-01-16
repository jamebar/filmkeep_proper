<?php namespace Filmkeep;


class CustomList extends \Eloquent {
    use \GetStream\StreamLaravel\Eloquent\ActivityTrait;

    protected $guarded = [];

    protected $table = 'lists';
    
    public $activityLazyLoading = ['film','user'];

    public function films(){
      return $this->belongsToMany('Filmkeep\Film', 'film_list','list_id','film_id');
    }

    public function user(){
      return $this->belongsTo('Filmkeep\User');
    }

    public function deleteList(){
      $this->films()->detach();
      return $this->delete();
    }
    
}
