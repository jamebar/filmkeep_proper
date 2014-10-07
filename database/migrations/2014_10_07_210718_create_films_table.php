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
            $table->integer('tmdb_id');
            $table->integer('imdb_id');
            $table->string('release_date');
            $table->string('poster_img');
            $table->string('backdrop_img');
            $table->string('summary');
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
