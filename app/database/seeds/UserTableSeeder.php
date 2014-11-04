<?php
use Filmkeep\User;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class UserTableSeeder extends Seeder {
 
  public function run()
  {
  
    $faker = Faker\Factory::create();
    for ($i = 0; $i < 100; $i++)
    {
      $user = User::create(array(
        'username' => $faker->userName,
        'first_name' => $faker->firstName,
        'last_name' => $faker->lastName,
        'email' => $faker->email,
        'password' => $faker->word
      ));
    }
  }
 
}