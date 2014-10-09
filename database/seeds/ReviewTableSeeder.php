<?php
use App\Review;
use App\Rating;
use App\Rating_type;
use App\Film;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class ReviewTableSeeder extends Seeder {
 
  public function run()
  {
    Model::unguard();
    $faker = Faker\Factory::create();
    
    foreach(Film::all() as $film)
    {
      $review = Review::create(array(
        'film_id' => $film->id,
        'user_id' => 1,
        'notes' => $faker->text,
        'seen_at'=> $faker->iso8601('now'),
      ));


      foreach(Rating_type::all() as $rating_type)
      {
        $r = new Rating([
            'rating_type_id' => $rating_type->id,
            'value'=> $faker->numberBetween(1,100)
            ]);

        $review->ratings()->save($r);
      }

    }
  }
 
}