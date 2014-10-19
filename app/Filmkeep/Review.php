<?php namespace Filmkeep;

use Illuminate\Database\Eloquent\Model;

class Review extends Model {

	protected $guarded = [];

    public function film(){
         return $this->belongsTo('Filmkeep\Film');
    }

    public function user(){
        return $this->belongsTo('Filmkeep\User');
    }

    public function ratings(){
        return $this->hasMany('Filmkeep\Rating');
    }
}
