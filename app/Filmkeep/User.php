<?php namespace Filmkeep;


use Illuminate\Auth\UserTrait;
use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableTrait;
use Illuminate\Auth\Reminders\RemindableInterface;
use Illuminate\Database\Eloquent\Model;

class User extends Model implements UserInterface, RemindableInterface {

	use UserTrait, RemindableTrait;

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = ['password', 'remember_token'];


	protected $fillable =['email', 'password'];

	/*
	* @param $password
	*/
	public function setPasswordAttribute($password)
	{
		$this->attributes['password'] = \Hash::make($password);
	}

  public function reviews(){
       return $this->hasMany('Filmkeep\Review');
  }

  public function followers()
  {
   return $this->belongsToMany('User', 'followers', 'user_id', 'follower_id');
  }

  public function watchlist(){
       return $this->hasOne('Filmkeep\Watchlist');
  }

  public function rating_types(){
       return $this->hasMany('Filmkeep\Rating_type');
  }

  
}
