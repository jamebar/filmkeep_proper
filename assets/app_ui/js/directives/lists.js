
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
                    updateSortOrder(evt.models);
                    scope.$apply();
                },
              }

              function updateSortOrder(items)
              {
                scope.show_loader = true;
                parseSortOrder(scope.list.films, items);
                Api.updateListSortOrder(scope.list.id, _.pluck(items, 'id').join(',')).then(function(response) {
                  scope.show_loader = false;
                })
              }


              scope.manageList = function(list){
                if(!list.id)
                  return scope.list = list;

                Api.Lists.get({id:list.id},function(response) {
                    scope.list = response.list;
                });
              }

              scope.saveList = function(){
                if(scope.list.id){
                  scope.list.$update();
                  AlertService.Notice("Your list has been updated.");
                  _.forEach(scope.lists, function(l){
                    if(l.id == scope.list.id){
                      _.assign(l, scope.list);
                    }
                  })  ;
                }else{
                  scope.list.$save(function(response){
                    scope.lists.push(response);
                    AlertService.Notice("Your list has been created, now add films to it.");
                  })
                }
              }

              scope.newList = function(){
                scope.list = new Api.Lists();
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
                  scope.list.films = response;
                  updateLists(scope.list.films);
                })
              }

              function updateLists(){
                _.forEach(scope.lists, function(l){
                    if(l.id == scope.list.id){
                      _.set(l,'films', scope.list.films);
                    }
                  })
              }

              scope.removeListItem = function(film)
              {
                Api.addRemoveListItem({film_id: film.id, list_action: 'remove', list_id: scope.list.id}).then(function(response) {
                  scope.list.films = response;
                  updateLists(scope.list.films);
                })
              }

              scope.manageList(scope.currentList);

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


.directive('viewList', ['Api', '$filter','$compile', 
    function(Api, $filter, $compile){
        return {
            restrict: 'E',
            scope:{ viewList: '='
                  },
            templateUrl: '/assets/templates/lists/view_list.tmpl.html',
            link: function(scope, element, attrs) {
              
              scope.loadList = function(list){
                Api.Lists.get({id:list.id, include_all: true},function(response) {
                  scope.list = response.list;
                  scope.all = response.all;
                });
              }

              scope.loadList(scope.viewList);

            }
        }
    }
  ])