<?php namespace Filmkeep;

use Illuminate\Database\Eloquent\Model;

class Rating extends Model {

	protected $guarded = [];

    public function review(){
         return $this->belongsTo('Filmkeep\Review');
    }

    public function rating_type(){
         return $this->belongsTo('Filmkeep\Rating_type');
    }
}
