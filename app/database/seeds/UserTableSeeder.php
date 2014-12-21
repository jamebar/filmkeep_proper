<?php
use Filmkeep\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class UserTableSeeder extends Seeder {
 
  public function run()
  {
  
    $users = [];
    $faker = Faker\Factory::create();
    for ($i = 0; $i < 100; $i++)
    {
      $users[] = array(
        'username' => $faker->userName,
        'name' => $faker->firstName . " " . $faker->lastName,
        'email' => $faker->email,
        'password' => $faker->word,
        'confirmation_code' => '1234',
      );
    }

    $users[] = array(
      'username' => 'jamebar',
      'name' => 'James Barlow',
      'email' => 'james@lemonblock.com',
      'password' => '1averne',
      'confirmation_code' => '1234',
      );

    DB::table('users')->insert($users);
  }
 
}