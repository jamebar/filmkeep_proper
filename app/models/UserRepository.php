<?php

use Filmkeep\User;
use Filmkeep\Follower;
/**
 * Class UserRepository
 *
 * This service abstracts some interactions that occurs between Confide and
 * the Database.
 */
class UserRepository
{
    /**
     * Signup a new account with the given parameters
     *
     * @param  array $input Array containing 'username', 'email' and 'password'.
     *
     * @return  User User object that may or may not be saved successfully. Check the id to make sure.
     */
    public function signup($input)
    {
        $user = new User;

        $user->name = array_get($input, 'name');
        if(empty($user->name))
          $user->name  = $this->nameFromEmail( array_get($input, 'email') );
          
        $user->email    = array_get($input, 'email');
        $user->password = array_get($input, 'password');
        $user->avatar = array_get($input, 'avatar');
        $user->google_id = array_get($input, 'google_id');
        $user->facebook_id = array_get($input, 'facebook_id');
        $user->confirmed = (array_get($input, 'confirmed')) ?  array_get($input, 'confirmed') : 0;

        $new_username =  preg_replace("/[^A-Za-z0-9]/", "", $user->name);
        $username_check = User::where('username', $new_username)->first();

        if (is_null($username_check))
        {
            $user->username = $new_username;
        }

        // The password confirmation will be removed from model
        // before saving. This field will be used in Ardent's
        // auto validation.
        $user->password_confirmation = array_get($input, 'password_confirmation');

        // Generate a random confirmation code
        $user->confirmation_code     = md5(uniqid(mt_rand(), true));

        // Save if valid. Password field will be hashed before save
        $this->save($user);

        //have user follow itself
        // Follower::firstOrCreate(['user_id'=>$user->id, 'follower_id'=>$user->id]);

        //follow the feed
        if($user->id)
        {
          FeedManager::followUser($user->id, $user->id);
          Follower::firstOrCreate(['user_id'=>$user->id, 'follower_id'=>1]);
          FeedManager::followUser($user->id, 1);
          Follower::firstOrCreate(['user_id'=>$user->id, 'follower_id'=>4]);
          FeedManager::followUser($user->id, 4);
        }

        if (!is_null($username_check) && $user->id)
        {
            $user->username = $new_username . $user->id;
            $user->save();
        }
        return $user;
    }

    public function nameFromEmail($email)
    {
      $email_parts = explode("@", $email);
      return $email_parts[0];
    }

    /**
     * Attempts to login with the given credentials.
     *
     * @param  array $input Array containing the credentials (email/username and password)
     *
     * @return  boolean Success?
     */
    public function login($input)
    {
        if (! isset($input['password'])) {
            $input['password'] = null;
        }

        return Confide::logAttempt($input, Config::get('confide::signup_confirm'));
    }

    /**
     * Checks if the credentials has been throttled by too
     * much failed login attempts
     *
     * @param  array $credentials Array containing the credentials (email/username and password)
     *
     * @return  boolean Is throttled
     */
    public function isThrottled($input)
    {
        return Confide::isThrottled($input);
    }

    /**
     * Checks if the given credentials correponds to a user that exists but
     * is not confirmed
     *
     * @param  array $credentials Array containing the credentials (email/username and password)
     *
     * @return  boolean Exists and is not confirmed?
     */
    public function existsButNotConfirmed($input)
    {
        $user = Confide::getUserByEmailOrUsername($input);

        if ($user) {
            $correctPassword = Hash::check(
                isset($input['password']) ? $input['password'] : false,
                $user->password
            );

            return (! $user->confirmed && $correctPassword);
        }
    }

    /**
     * Resets a password of a user. The $input['token'] will tell which user.
     *
     * @param  array $input Array containing 'token', 'password' and 'password_confirmation' keys.
     *
     * @return  boolean Success
     */
    public function resetPassword($input)
    {
        $result = false;
        $user   = Confide::userByResetPasswordToken($input['token']);

        if ($user) {
            $user->password              = $input['password'];
            $user->password_confirmation = $input['password_confirmation'];
            $result = $this->save($user);
        }

        // If result is positive, destroy token
        if ($result) {
            Confide::destroyForgotPasswordToken($input['token']);
        }

        return $result;
    }

    /**
     * Simply saves the given instance
     *
     * @param  User $instance
     *
     * @return  boolean Success
     */
    public function save(User $instance)
    {
        return $instance->save();
    }
}
