<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyUsersTableNullable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
    DB::statement('ALTER TABLE `users` MODIFY `google_id` VARCHAR(255) NULL;');
		DB::statement('ALTER TABLE `users` MODIFY `facebook_id` VARCHAR(255) NULL;');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		DB::statement('ALTER TABLE `users` MODIFY `google_id` VARCHAR(255) NOT NULL;');
    DB::statement('ALTER TABLE `users` MODIFY `facebook_id` VARCHAR(255) NOT NULL;');
	}

}
