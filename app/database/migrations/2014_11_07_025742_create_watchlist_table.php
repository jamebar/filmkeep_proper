<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWatchlistTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('watchlist', function(Blueprint $table)
    {
      $table->increments('id');
      $table->integer('user_id');
      $table->integer('film_id');
      $table->integer('list_order');
      $table->dateTime('watched_at');
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
		Schema::drop('watchlist');
	}

}
