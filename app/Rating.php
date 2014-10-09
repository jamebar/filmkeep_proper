<?php namespace App;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model {

	protected $fillable = [];

    public function review(){
         return $this->belongsTo('App\Review');
    }

    public function rating_type(){
         return $this->hasOne('App\Rating_type');
    }
}
