
  'use strict';

  angular.module('search', [
])

  .directive('search', ['$document','$filter','$state',
    function($document,$filter,$state){
        return {
            restrict: 'E',
            scope:{},
            templateUrl: '/assets/templates/search.tmpl.html',
            link: function(scope, element, attrs) {

              scope.search = {};
              scope.search.query = null;  
              

                var people = new Bloodhound({
                    datumTokenizer: function(d) {
                        return Bloodhound.tokenizers.whitespace(title);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/api/user/search?query=%QUERY',
                        filter: function(list) {
                            return $.map(list.results, function(data) {
                                if(data.avatar.length < 2) data.avatar = '/assets/img/default-profile.jpg';
                                
                                
                                return {
                                    name: data.name,
                                    avatar: $filter('profileFilter')(data.avatar),
                                    username: data.username
                                };
                            });
                        }
                    }
                });

                var films = new Bloodhound({
                    datumTokenizer: function(d) {
                        return Bloodhound.tokenizers.whitespace(title);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/api/tmdb/%QUERY',
                        filter: function(list) {
                            return $.map(list.results, function(data) {
                                return {
                                    title: data.title ,
                                    tmdb_id: data.id,
                                    poster: $filter('imageFilter')(data.poster_path,'poster',0),
                                    release_date: data.release_date.substring(0, 4)
                                };
                            });
                        }
                    }
                });

                people.initialize();
                films.initialize();

                scope.typeaheadOptions = {
                    hint: true,
                    highlight: true,
                    minLength: 1
                };

                scope.mulitpleData = [
                {
                    name: 'people',
                    displayKey: 'name',
                    source: people.ttAdapter(),
                    templates: {
                      header: '<h3 class="search-title">People</h3>',
                      suggestion: function (context) {
                        return '<div><img src="'+context.avatar + '" height="30" width="30"/> ' +context.name+'<span></span></div>'
                      }
                    }
                },
                {
                    name: 'films',
                    displayKey: 'title',
                    source: films.ttAdapter(),
                    templates: {
                      header: '<h3 class="search-title">Films</h3>',
                      suggestion: function (context) {
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" /></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
                      }
                    }
                }
                ]

                scope.$on('typeahead:autocompleted', searchComplete);
                scope.$on('typeahead:selected', searchComplete);
                
                function searchComplete(event, suggestion, dataset){

                  if(dataset === 'people'){
                    $state.go('root.user.filmkeep', {username: suggestion.username});
                  }

                  if(dataset === 'films'){
                    $state.go('root.film', {filmId: suggestion.tmdb_id, filmSlug: $filter('slugify')(suggestion.title) });
                    
                  }
                  scope.search.query = null;

                }

                

            }

        }
    }
  ]);