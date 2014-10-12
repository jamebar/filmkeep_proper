<!doctype html>
<html lang="en" ng-app="myApp">
<head>
	<meta charset="UTF-8">
	<title>Filmkeep</title>
	<link rel="stylesheet" href="/assets/css/styles.min.css">
    <script src="/assets/js/vendor.js"></script>
    <script src="/assets/js/app.js"></script>


</head>
<body>
	@if (Session::has('message'))
        <div id="flash_notice" data-alert data-options="animation_speed:500;" class="alert-box ">{{ Session::get('message') }} <a href="#" class="close">&times;</a></div>
    @endif
	<div class="row">
		<div class="small-12 columns">
			@yield('content')
		</div>
	</div>
</body>
</html>
