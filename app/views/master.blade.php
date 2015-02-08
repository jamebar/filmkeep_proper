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
  <link rel="stylesheet" href="/assets/css/styles.min.css?v=1.4">
  <link rel="stylesheet" href="/assets/css/filmkeep-font.css">

    <link href='http://fonts.googleapis.com/css?family=Lato:400,700italic' rel='stylesheet' type='text/css'>
    <link href='http://fonts.googleapis.com/css?family=Volkhov:400,700italic' rel='stylesheet' type='text/css'>
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js?v=1.3"></script>
    <base href="/" />
    <script>
      var image_path_config = {{json_encode($image_path_config)}};
    </script>

    <script>
      (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
      })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

      ga('create', 'UA-58427686-1', 'auto');
      
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

      @if(Auth::check())
      <a class="navbar-brand" ui-sref='root.feed' ></a>
      @else
      <a class="navbar-brand" href="/" target="_self" ></a>
      @endif
      <search ></search>
    </div>

    <!-- Collect the nav links, forms, and other content for toggling -->
    <div class="collapse navbar-collapse" collapse="navbarCollapsed" ng-init="navbarCollapsed=true">
      

      <ul class="nav navbar-nav navbar-right">
        @if(Auth::check())
        <li><a ui-sref='root.feed'>Feed</a></li>
        <li><a ui-sref='root.user.filmkeep({username: header_user.username })'>My Filmkeep</a></li>
        <li><a ui-sref='root.user.watchlist({username: header_user.username })'>Watchlist</a></li>

       

        <li class="hidden-xs"><a ng-click="newReview()" target="_self"><span class="glyphicon-plus glyphicon"></span> Review</a></li>
        <li class="dropdown" >
          <a href="#" class="dropdown-toggle notif-wrapper" data-toggle="dropdown" ng-click="markSeen()"><i class="icon-megaphone"></i> <span ng-show="notif_new > 0" class="notif_count">%%notif_new%%</span></a>
          <ul class="dropdown-menu notif" role="menu">
            <li ng-if="notif_items.length <1">You have no notifications</li>
            <li  ng-repeat="notif_item in notif_items">
              <notif-items></notif-items>
            </li> 
          </ul>
        </li>
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
    <div class="container-fluid" >
      <!--Error messages from backend pages -->
    	@if (Session::has('message'))
            <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box success fadeOutUp animated" close-me="3000">{{ Session::get('message') }} </div>
        @endif
      <!--Error messages from angular -->
      <alert-box box-class="alert alert-box radius " alert-class="alert" warning-class="warning" notice-class="success" class="admin-alert "></alert-box>
        <div ui-view autoscroll="true" ></div>
        @yield('content')
    </div>
    <div class="container-fluid footer clearfix">
      <div class="row site-max">
        <div class="col-xs-12 col-md-2">
             <ul class="">
              <li><a ng-click="featureList()">Feature List</a></li>
              <li><a ui-sref='root.terms'>Terms &amp; Service</a></li>
              <li ><img src="/assets/img/filmkeep-logo-f.png"/></li>
            </ul>
           
        </div>
        <div class="col-xs-12 col-md-10">
          <p class="beige">Filmkeep is a social film experience. A place to share and discover movies. A repository of what you’ve watched and what you thought. It allows users to easily create customizable film ratings that combine the simplicity of a 5-star score with the depth of a full review. </p>
          <p>&copy; 2015 Filmkeep. All rights reserved.</p>
          <p>This product uses the TMDb API but is not endorsed or certified by TMDb.<p>
        </div>
      </div>
    </div>
    
</body>
</html>
