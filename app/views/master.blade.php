<!doctype html>
<html lang="en" ng-app="myApp" ng-controller="wrapperCtrl">
<head>
	<meta charset="UTF-8">
   <!-- Set the viewport width to device width for mobile -->
  <meta name="viewport" content="width=device-width"  />
	<title ng-bind-template="Filmkeep: %%page_title%%">Filmkeep</title>
    <link rel="stylesheet" href="/assets/css/bootstrap.min.css">
    <!-- <link rel="stylesheet" href="/assets/css/vendor.css"> -->
    <!-- <link rel="stylesheet" href="/assets/css/animate.min.css"> -->
  <link rel="stylesheet" href="/assets/css/styles.min.css">
    <link href='http://fonts.googleapis.com/css?family=Lato:400,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Volkhov:400,700italic' rel='stylesheet' type='text/css'>
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>
    <base href="/" />
    <script>
      var image_path_config = {{json_encode($image_path_config)}};
    </script>
</head>
<body >

  <!-- <div class="navmenu collapse navbar-collapse">
      <a class="navmenu-brand" href="/" >Filmkeep</a>
      <ul class="nav navbar-nav">
        @if(Auth::check())
        <li><a ui-sref='root.feed' >Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: "{{Auth::user()->username}}" })' >My Filmkeep</a></li>
        <li><a ui-sref='root.user.watchlist({username: "{{Auth::user()->username}}" })' >Watchlist</a></li>
        @endif
      </ul>
       <hr>
      <ul class="nav navmenu-nav">
        @if(Auth::check())
        <li><a ui-sref="root.settings.profile" ><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
        <li><a href="/users/logout" target="_self">Logout</a></li>
        @endif
      </ul>
      
    </div> -->
<nav class="navbar navbar-inverse navbar-fixed-top" role="navigation" scroll-position="scroll"  style="background:rgba(50, 50, 50, %%(scroll/300) +.4%%)" ng-class="{forceopacity: !navbarCollapsed}">
    <div class="container-fluid site-max">
      <div class="navbar-header">
      @if(Auth::check())
      <button type="button" class="navbar-toggle collapsed"  ng-click="navbarCollapsed = !navbarCollapsed">
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
        <span class="icon-bar"></span>
      </button>
      <!-- <ul class="nav nav-pills pull-right visible-xs-inline-block"> -->
        <a ng-click="newReview()" class="pull-right add-review-mobile visible-xs-inline-block" target="_self"><span class="glyphicon-plus glyphicon" ></span> </a>
      <!-- </ul> -->
      @else
        <ul class="nav nav-pills pull-right visible-xs-inline-block">
          <li role="button" class="navbar-btn "><a href="/users/login" target="_self">log in</a></li>
        </ul>
      @endif
      <a class="navbar-brand" href="/" target="_self" ></a>
      <search></search>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" collapse="navbarCollapsed" ng-init="navbarCollapsed=true">
      

      <ul class="nav navbar-nav navbar-right">
        @if(Auth::check())
        <li><a ui-sref='root.feed'>Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: "{{Auth::user()->username}}" })'>My Filmkeep</a></li>
        <li><a ui-sref='root.user.watchlist({username: "{{Auth::user()->username}}" })'>Watchlist</a></li>
        <li class="hidden-xs"><a ng-click="newReview()" target="_self"><span class="glyphicon-plus glyphicon"></span> Review</a></li>
        
        <li class="dropdown" ng-if="navbarCollapsed">
          <a href="#" class="dropdown-toggle" data-toggle="dropdown"><avatar class="avatar sm" info="header_user" disable-click="true"></avatar></a>
          <ul class="dropdown-menu" role="menu">
            <li><a ui-sref="root.settings.profile"><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
            
            <li class="divider"></li>
            
            <li><a href="/users/logout" target="_self">Logout</a></li>
            
          </ul>
        </li>
        <li ng-if="!navbarCollapsed"><a ui-sref="root.settings.profile"><span class="glyphicon glyphicon-cog"></span> Settings</a></li>
        <li ng-if="!navbarCollapsed"><a href="/users/logout" target="_self">Logout</a></li>
        @else
        <li ><a href="/users/login" target="_self">log in</a></li>
        @endif

      </ul>
    </div><!-- /.navbar-collapse -->
  </div><!-- /.container-fluid -->
</nav>
    <div class="container-fluid">
      <!--Error messages from backend pages -->
    	@if (Session::has('message'))
            <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box success fadeOutUp animated" close-me="3000">{{ Session::get('message') }} </div>
        @endif
      <!--Error messages from angular -->
      <alert-box box-class="alert alert-box radius " alert-class="alert" warning-class="warning" notice-class="success" class="admin-alert "></alert-box>
    	
          
               @yield('content')
                
                <div ui-view autoscroll="true"></div>

    
    		
    </div>
    <div class="container-fluid footer">
      <div class="row site-max">
        <div class="col-xs-12">
            <h4>Filmkeep 2014</h4>
            <p>This product uses the TMDb API but is not endorsed or certified by TMDb.<p>
        </div>
      </div>
    </div>
    
</body>
</html>
