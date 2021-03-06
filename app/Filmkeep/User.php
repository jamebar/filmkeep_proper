<?php namespace Filmkeep;

use Illuminate\Database\Eloquent\Model;
use Zizaco\Confide\ConfideUser;
use Zizaco\Confide\ConfideUserInterface;

class User extends Model implements ConfideUserInterface
{
    use ConfideUser;
  protected $hidden = array('password','confirmation_code','remember_token','confirmed','facebook_id','google_id');

  public function reviews(){
       return $this->hasMany('Filmkeep\Review');
  }

  public function followers()
  {
   return $this->belongsToMany('Filmkeep\User', 'followers', 'user_id', 'follower_id')->select(array('follower_id as id', 'username','name','avatar'));
  }

  public function watchlist(){
       return $this->hasOne('Filmkeep\Watchlist');
  }

  public function rating_types(){
       return $this->hasMany('Filmkeep\Rating_type');
  }

  
  
}
