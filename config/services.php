<?php

return [

	/*
	|--------------------------------------------------------------------------
	| Third Party Services
	|--------------------------------------------------------------------------
	|
	| This file is for storing the credentials for third party services such
	| as Stripe, Mailgun, Mandrill, and others. This file provides a sane
	| default location for this type of information, allowing packages
	| to have a conventional place to find your various credentials.
	|
	*/

	'mailgun' => [
		'domain' => '',
		'secret' => '',
	],

	'mandrill' => [
		'secret' => '',
	],

	'stripe' => [
		'model'  => 'User',
		'secret' => '',
	],

    'facebook' => array(
        'client_id'     => '227434434072987',
        'client_secret' => 'eedd99c36b86cc904b5152a4ee8cd0d5',
        'redirect'		=> 'http://dev.filmkeep.com:8000/auth/loginFacebook',
        'scope'         => array('email'),
    ),

    
    'Twitter' => array(
        'client_id'     => 'qIoEyyHNO0rcUUtCPygmIQ',
        'client_secret' => 'Dy53ALzIcBW3l4jo3iZw982gLXAaU90oH1RgBMp2c',
    ),	

    
    'Google' => array(
		'client_id'     => '114160101710-c98v7leavosm0h603egf38l74s0t8ut0.apps.googleusercontent.com',
		'client_secret' => 'b5k1mhfq4U_3FscXiSFueXIW',
		'scope'         => array('userinfo_email', 'userinfo_profile'),
	), 	

];
