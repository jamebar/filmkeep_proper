<?php
use Filmkeep\Review;
use Filmkeep\Rating;
use Filmkeep\Rating_type;
use Filmkeep\Film;
use Illuminate\Database\Seeder;
use Illuminate\Database\Eloquent\Model;

class RatingTypesTableSeeder extends Seeder {
 
  public function run()
  {
    Model::unguard();
    
    
      Rating_type::create([
        'user_id'=> 0,
        'label'=>'Impression of the movie before you saw it',
        'label_short'=>'Impression',
        'sort_order'=>0]);

      Rating_type::create([
        'user_id'=> 0,
        'label'=>'How much did you like it?',
        'label_short'=>'How much did you like it?',
        'sort_order'=>1]);
      
      Rating_type::create([
        'user_id'=> 0,
        'label'=>'Rewatchability',
        'label_short'=>'Rewatchability',
        'sort_order'=>2]);

      Rating_type::create([
        'user_id'=> 0,
        'label'=>'How well made is it?',
        'label_short'=>'How well made is it?',
        'sort_order'=>3]);

      Rating_type::create([
        'user_id'=> 0,
        'label'=>'Serious|Fun',
        'label_short'=>'Serious|Fun',
        'sort_order'=>4]);

   
  }
 
}