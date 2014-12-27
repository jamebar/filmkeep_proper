<h1>Filmkeep Password Reset</h1>

<p>{{ Lang::get('confide::confide.email.password_reset.greetings', array( 'name' => $user['name'])) }},</p>

<p>{{ Lang::get('confide::confide.email.password_reset.body') }}</p>
<a href='{{ URL::to('users/reset_password/'.$token) }}'>
    {{ URL::to('users/reset_password/'.$token)  }}
</a>

<p>{{ Lang::get('confide::confide.email.password_reset.farewell') }}</p>
<p>Your friends at Filmkeep</p>
