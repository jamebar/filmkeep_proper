'use strict';

angular.module('Filters',[])

.filter('unsafe', function($sce) {
    return function(val) {
        return $sce.trustAsHtml(val);
    };

})

.filter('imageFilter', [ function() {
  return function(path, type, size)
  {
    var image_config = image_path_config;
    
    var s = size || 0;
    var t = type || 'poster';

    return image_config.images.base_url + image_config.images[type + '_sizes'][size] +  path;

  }
    
}])

.filter('profileFilter', [ function() {
  return function(path)
  {
    var p = path || '/assets/img/default-profile.jpg';
    return p;

  }
    
}])

.filter('verb',function(){
  return function(verb){
    var keys = {'filmkeep\\review':'reviewed',
                'filmkeep\\watchlist':'added',
                'filmkeep\\comment':'commented',
                'filmkeep\\follower':'started following'
                };
    return keys[verb];
  }
})
