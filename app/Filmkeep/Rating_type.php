<?php namespace Filmkeep;

use Illuminate\Database\Eloquent\Model;

class Rating_type extends Model {

	protected $guarded = [];

    public function user(){
         return $this->belongsTo('Filmkeep\User')->select(array('id', 'username','name','avatar'));
    }

    public function ratings(){
         return $this->hasMany('Filmkeep\Rating');
    }

}
