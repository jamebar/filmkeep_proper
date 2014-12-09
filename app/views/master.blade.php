<!doctype html>
<html lang="en" ng-app="myApp">
<head>
	<meta charset="UTF-8">
	<title>Filmkeep</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/css/vendor.css">
    <link rel="stylesheet" href="/assets/css/animate.min.css">
  <link rel="stylesheet" href="/assets/css/styles.min.css">
    <link href='http://fonts.googleapis.com/css?family=Lato:400,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Volkhov:400,700italic' rel='stylesheet' type='text/css'>
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>

    <script>
      var image_path_config = {{json_encode($image_path_config)}};
    </script>
</head>
<body >
  <div class="navmenu navmenu-inverse navmenu-fixed-left offcanvas">
      <a class="navmenu-brand" href="/" onClick="$('.navmenu').offcanvas('hide')">Filmkeep</a>
      <ul class="nav navmenu-nav">
        @if(Auth::check())
        <li><a ui-sref='root.feed' onClick="$('.navmenu').offcanvas('hide')">Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: "{{Auth::user()->username}}" })' onClick="$('.navmenu').offcanvas('hide')" >My Filmkeep</a></li>
        <li><a ui-sref='root.user.watchlist({username: "{{Auth::user()->username}}" })' onClick="$('.navmenu').offcanvas('hide')">Watchlist</a></li>
        @endif
      </ul>
       <hr>
      <ul class="nav navmenu-nav">
        @if(Auth::check())
        <li><a ui-sref="root.settings.profile" onClick="$('.navmenu').offcanvas('hide')"><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
        <li><a href="/users/logout" target="_self">Logout</a></li>
        @endif
      </ul>
      
    </div>
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation" scroll-position="scroll"  style="background:rgba(50, 50, 50, %%(scroll/300) +.4%%)">
    <div class="container-fluid">
      <div class="navbar-header">
      @if(Auth::check())
      <button type="button" class="navbar-toggle" data-toggle="offcanvas" data-target=".navmenu" data-canvas="body">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      @else
        <ul class="nav nav-pills pull-right visible-xs-inline-block">
          <li role="button" class="navbar-btn "><a href="/users/login" target="_self">log in</a></li>
        </ul>
      @endif
      <a class="navbar-brand" href="/" target="_self" ></a>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" id="bs-example-navbar-collapse-1">
      <search></search>

     
      
      <ul class="nav navbar-nav navbar-right">
        @if(Auth::check())
        <li><a ui-sref='root.feed'>Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: "{{Auth::user()->username}}" })'  >My Filmkeep</a></li>
        @endif
        @if(!Auth::check())
        <li><a href="/users/login" target="_self" class="btn">Log in</a></li>
        @endif
        @if(Auth::check())
        <li class="dropdown">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown"><img class="round-corners" ng-src="%%'{{Auth::user()->avatar}}' | profileFilter%%" width="30" height="30" onerror="this.src = '/assets/img/default-profile.jpg';"/></a>
          <ul class="dropdown-menu" role="menu">
            <li><a ui-sref="root.settings.profile"><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
            <li><a ui-sref='root.user.watchlist({username: "{{Auth::user()->username}}" })'><span class="glyphicon glyphicon-list"></span> Watchlist</a></li>
            <li class="divider"></li>
            
            <li><a href="/users/logout" target="_self">Logout</a></li>
            
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
    	
          
               @yield('content')
                
                <div ui-view></div>

    
    		
    </div>
    <div class="container footer">
        <div class="col-xs-12">
            Filmkeep 2014  |  This product uses the TMDb API but is not endorsed or certified by TMDb.
        </div>
    </div>
    
</body>
</html>
