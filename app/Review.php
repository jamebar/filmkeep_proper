<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Review extends Model {

	protected $fillable = [];

    public function film(){
         return $this->belongsTo('App\Film');
    }

    public function user(){
        return $this->belongsTo('App\User');
    }

    public function ratings(){
        return $this->hasMany('App\Rating');
    }
}
