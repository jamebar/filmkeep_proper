<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class ModifyUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
    DB::statement('ALTER TABLE `users` MODIFY `avatar` VARCHAR(255) NULL;');
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    //
		DB::statement('ALTER TABLE `users` MODIFY `avatar` VARCHAR(255) NOT NULL;');
	}

}
