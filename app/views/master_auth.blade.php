<!doctype html>
<html lang="en" ng-app="myApp">
<head>
    <meta charset="UTF-8">
    <title>Filmkeep</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/css/styles.min.css">
    <link rel="stylesheet" href="/assets/css/animate.min.css">

    <link href='http://fonts.googleapis.com/css?family=Lato:400,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Volkhov:400,700italic' rel='stylesheet' type='text/css'>
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>

</head>
<body class="body-bg">

    <div class="container">
      @if (Session::get('error'))
          <div class="alert-box alert alert-error alert-danger" close-me="3000">
              {{{ Session::get('error') }}}
          </div>
      @endif

      @if (Session::get('notice'))
          <div class="alert-box alert" close-me="3000">{{ Session::get('notice') }}</div>
      @endif
      @if (Session::has('message'))
          <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box " close-me="3000">{{ Session::get('message') }} <a href="#" class="close">&times;</a></div>
      @endif
      <div class="row">
          <div class="col-md-12">
              <div class="login-logo"><img src="/assets/img/filmkeep-logo-invite.png"/></div>
              @yield('content')
              
          </div>
      </div>
    </div>
    <div class="container footer">
        <div class="col-xs-12">
            Filmkeep 2014
        </div>
    </div>
    
</body>
</html>
