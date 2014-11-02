<?php 

return array( 
	
	/*
	|--------------------------------------------------------------------------
	| oAuth Config
	|--------------------------------------------------------------------------
	*/

	/**
	 * Storage
	 */
	'storage' => 'Session', 

	/**
	 * Consumers
	 */
	'consumers' => array(

		/**
		 * Facebook
		 */
	        'Facebook' => array(
	            'client_id'     => '227434434072987',
	            'client_secret' => 'eedd99c36b86cc904b5152a4ee8cd0d5',
	            'scope'         => array('email'),
	        ),

	        /**
		 * Twitter
		 */
	        'Twitter' => array(
	            'client_id'     => 'qIoEyyHNO0rcUUtCPygmIQ',
	            'client_secret' => 'Dy53ALzIcBW3l4jo3iZw982gLXAaU90oH1RgBMp2c',
	        ),	

	        /**
		 * Google
		 */
	        'Google' => array(
			'client_id'     => '114160101710-c98v7leavosm0h603egf38l74s0t8ut0.apps.googleusercontent.com',
			'client_secret' => 'b5k1mhfq4U_3FscXiSFueXIW',
			'scope'         => array('userinfo_email', 'userinfo_profile'),
		), 	

	)

);