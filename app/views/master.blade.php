<!doctype html>
<html lang="en" ng-app="myApp">
<head>
	<meta charset="UTF-8">
	<title>Filmkeep</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
	<link rel="stylesheet" href="/assets/css/styles.min.css">
    <link rel="stylesheet" href="/assets/css/animate.min.css">
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>

    <script>
      var image_path_config = {{json_encode($image_path_config)}};
    </script>
</head>
<body ng-controller="appCtrl">
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation">
    <div class="container">
      <div class="navbar-header">
      <button type="button" class="navbar-toggle collapsed" data-toggle="collapse" data-target="#bs-example-navbar-collapse-1">
        <span class="sr-only">Toggle navigation</span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <a class="navbar-brand" href="/" target="_self">Filmkeep</a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <ul class="nav navbar-nav">
        <li><a href="#">My Fimkeep</a></li>
        
      </ul>
      
      <ul class="nav navbar-nav navbar-right">
        @if(!Auth::check())
        <li><a href="/user/login" target="_self" class="btn">Log in</a></li>
        @endif
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown">Dropdown <span class="caret"></span></a>
          <ul class="dropdown-menu" role="menu">
            <li><a href="#">Action</a></li>
            <li><a href="#">Another action</a></li>
            <li><a href="#">Something else here</a></li>
            <li class="divider"></li>
            @if(Auth::check())
            <li><a href="/user/logout" target="_self">Logout</a></li>
            @endif
          </ul>
        </li>
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
    <div class="container">
    	@if (Session::has('message'))
            <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box ">{{ Session::get('message') }} <a href="#" class="close">&times;</a></div>
        @endif
    	<div class="row">
    		<div class="col-md-12">
    			
                @yield('content')
                
                <div  ui-view="page"></div>

    
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
