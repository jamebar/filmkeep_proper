<!doctype html>
<html lang="en" ng-app="myApp">
<head>
    <meta charset="UTF-8">
    <title>Filmkeep</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/css/styles.min.css">
    <link rel="stylesheet" href="/assets/css/filmkeep-font.css">
    <!-- <link rel="stylesheet" href="/assets/css/animate.min.css"> -->

    <link href='http://fonts.googleapis.com/css?family=Lato:400,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Volkhov:400,700italic' rel='stylesheet' type='text/css'>
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>

</head>
<body class="body-bg">

    <div class="container">
      @if (Session::get('error'))
          <div class="alert-box alert alert-error alert-danger no-header" close-me="3000">
              @if(is_array(Session::get('error')))
                @foreach(Session::get('error') as $error)
                {{{ $error }}}
                @endforeach
              @else
                {{{Session::get('error')}}}
              @endif
          </div>
      @endif

      @if (Session::get('notice'))
          <div class="alert-box alert no-header" close-me="3000">{{ Session::get('notice') }}</div>
      @endif
      @if (Session::has('message'))
          <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box no-header" close-me="3000">{{ Session::get('message') }} <a href="#" class="close">&times;</a></div>
      @endif
      <div class="row">
          <div class="col-md-12">
              <div class="login-logo"><img src="/assets/img/filmkeep-logo-invite.png"/></div>
              @yield('content')
              
          </div>
      </div>
    </div>
    <!-- <div class="container-fluid footer">
        <div class="col-xs-12">
            Filmkeep 2014
        </div>
    </div> -->
    
</body>
</html>
