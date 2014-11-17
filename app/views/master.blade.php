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
<body >
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
        @if(Auth::check())
        <li><a ui-sref='root.feed'>Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: "{{Auth::user()->username}}" })'  >My Filmkeep</a></li>
        @endif
      </ul>
      
      <ul class="nav navbar-nav navbar-right">
        
        @if(!Auth::check())
        <li><a href="/user/login" target="_self" class="btn">Log in</a></li>
        @endif
        @if(Auth::check())
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown"><img ng-src="%%'{{Auth::user()->avatar}}' | profileFilter%%" width="30" height="30" onerror="this.src = '/assets/img/default-profile.jpg';"/></a>
          <ul class="dropdown-menu" role="menu">
            <li><a ui-sref="root.settings.profile"><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
            <li class="divider"></li>
            
            <li><a href="/user/logout" target="_self">Logout</a></li>
            
          </ul>
        </li>
        @endif
      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
    <div class="container-fluid">
      <!--Error messages from backend pages -->
    	@if (Session::has('message'))
            <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box ">{{ Session::get('message') }} <a href="#" class="close">&times;</a></div>
        @endif
      <!--Error messages from angular -->
      <alert-box box-class="alert alert-box radius " alert-class="alert" warning-class="warning" notice-class="success" class="admin-alert "></alert-box>
    	<div class="row">
    		<div class="col-md-12">
          <search></search>
               @yield('content')
                
                <div ui-view></div>

    
    		</div>
    	</div>
    </div>
    <div class="container footer">
        <div class="col-xs-12">
            Filmkeep 2014  |  This product uses the TMDb API but is not endorsed or certified by TMDb.
        </div>
    </div>
    
</body>
</html>
