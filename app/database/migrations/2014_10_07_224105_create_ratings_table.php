<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateRatingsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('ratings', function(Blueprint $table)
		{
			$table->increments('id');
            $table->integer('rating_type_id')->unsigned();
            $table->foreign('rating_type_id')->references('id')->on('rating_types')->onDelete('cascade');
            $table->integer('review_id')->unsigned();
            $table->foreign('review_id')->references('id')->on('reviews');
            $table->float('value');
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
		Schema::drop('ratings');
	}

}
