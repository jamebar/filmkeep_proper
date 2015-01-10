<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFilmsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('films', function(Blueprint $table)
		{
			$table->increments('id');
      $table->string('title');
      $table->string('rotten_id');
      $table->string('tmdb_id');
      $table->string('imdb_id');
      $table->string('release_date');
      $table->string('poster_path');
      $table->string('backdrop_path');
      $table->text('summary');
			$table->timestamps();
		});
	}

	/**
	 * Reverse the migrations. 
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('films');
	}

}
