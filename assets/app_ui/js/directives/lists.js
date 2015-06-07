
  'use strict';

  angular.module('lists', ['ng-sortable'
])

  .directive('manageList', ['Api', '$filter','$compile', 'AlertService','$timeout',
    function(Api, $filter, $compile, AlertService, $timeout){
        return {
            restrict: 'E',
            scope:{ currentList: '=',
                    lists: '='
                  },
            templateUrl: '/assets/templates/lists/manage_list.tmpl.html',
            link: function(scope, element, attrs) {
              scope.query = null;
              scope.dragOptions = {
                handle: ".drag-handle",
                draggable: ".list-item",
                animation: 550,
                onUpdate: function (evt) {
                    var itemEl = evt.item; 
                    scope.$apply();
                    parseSortOrder(scope.list.films, evt.models);
                    console.log(evt.models)

                },
              }
              

              Api.Lists.get({id:scope.currentList.id},function(response) {
                  response.films = parseSortOrder(response.films);
                  scope.list = response;
              });

              scope.saveList = function(){
                if(scope.list.id){
                  scope.list.$update();
                  AlertService.Notice("Your list has been updated.");
                }else{
                  scope.list.$save(function(response){

                  })
                }
              }

              function parseSortOrder(target, source)
              {
                source =  (typeof source !== 'undefined') ? source : target;
                _.forEach(source, function(s, key){
                  target[key].pivot.sort_order = key;
                })

                return target;
              }

              function addListItem(item)
              {
                AlertService.Notice("Adding " + item.title + " to your list...");
                var sort_order = scope.list.films || {};
                Api.addRemoveListItem({tmdb_id: item.tmdb_id, list_action: 'add', list_id: scope.list.id, sort_order: sort_order.length }).then(function(response) {
                  scope.list.films = parseSortOrder(response);
                })
              }

              scope.removeListItem = function(film)
              {
                Api.addRemoveListItem({film_id: film.id, list_action: 'remove', list_id: scope.list.id}).then(function(response) {
                  scope.list.films = response;
                })
              }

              // Instantiate the bloodhound suggestion engine
                var films = new Bloodhound({
                    datumTokenizer: function(d) {
                        return Bloodhound.tokenizers.whitespace(title);
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    remote: {
                        url: '/api/tmdb/%QUERY',
                        filter: function(list) {
                            return $.map(list.results, function(data) {
                                data.release_date  = data.release_date || 'N/A';
                                return {
                                    title: data.title,
                                    tmdb_id: data.id,
                                    release_date: data.release_date.substring(0, 4),
                                    poster: $filter('imageFilter')(data.poster_path,'poster',0)
                                };
                            });
                        }
                    }
                });

                films.initialize();

                scope.typeaheadOptions = {
                    hint: true,
                    highlight: true,
                    minLength: 1,
                };

                scope.typeaheadData = {
                    name: 'films',
                    displayKey: 'title',
                    source: films.ttAdapter(),
                    templates: {
                      suggestion: function (context) {
                        return '<div class="clearfix search-item"><div class="search-item-img"><img src="'+context.poster + '" onerror="if (this.src != \'/assets/img/fallback-poster.jpg\') this.src = \'/assets/img/fallback-poster.jpg\';"/></div> <div class="search-item-content">' +context.title+' <span class="release-date">('+context.release_date + ')</span></div></div>'
                      }
                    }
                };

                scope.$on('typeahead:autocompleted', searchComplete);
                scope.$on('typeahead:selected', searchComplete);
                
                function searchComplete(event, suggestion, dataset){
                  addListItem(suggestion);
                  $('.tt-input').typeahead('val', null);
                }



            }

        }
    }
  ])