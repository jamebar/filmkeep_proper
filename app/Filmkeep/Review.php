<?php namespace Filmkeep;

use Illuminate\Database\Eloquent\Model;

class Review extends Model {

	protected $fillable = [];

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
