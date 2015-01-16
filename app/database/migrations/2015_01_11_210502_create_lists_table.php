<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateListsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('lists', function(Blueprint $table)
    {
      $table->increments('id');
      $table->integer('user_id')->unsigned();
      $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
      $table->string('name');
      $table->string('description');
      $table->integer('sort_order');
      $table->timestamps();
    });

    Schema::create('film_list', function(Blueprint $table)
    {
      $table->increments('id');
      $table->integer('film_id')->references('id')->on('films');
      $table->integer('list_id')->references('id')->on('lists')->onDelete('cascade');
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
    Schema::dropIfExists('lists');
		Schema::dropIfExists('film_list');
	}

}
