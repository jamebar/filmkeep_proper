<?php 

use Filmkeep\Review;
use Filmkeep\Film;
use Filmkeep\Rating;
use Filmkeep\TheMovieDb;

class ReviewsController extends BaseController {

	/**
	 * Display a listing of the resource.
	 * GET /reviews
	 *
	 * @return Response
	 */
	public function index()
	{
        $user= \Input::get('user');
        $num = \Input::get('num') ? \Input::get('num') : 20;
        $sortBy = \Input::get('sort_by') ? \Input::get('sort_by') : 'id';
        $sortDirection = \Input::get('sort_direction') ;

		$review = Review::with('ratings','ratings.rating_type','film')->take($num)->orderBy($sortBy, $sortDirection);
        
        if($user)
            $review->where('user_id',$user);

        return \Response::json(['status' => 200, 'results' => $review->get()]);
	}

	/**
	 * Show the form for creating a new resource.
	 * GET /reviews/create
	 *
	 * @return Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 * POST /reviews
	 *
	 * @return Response
	 */
	public function store()
	{
		//get full film info from tmdb.com
        $TheMovieDb = new TheMovieDb();
        $film =  \Input::get('film');
        $tmdb_info = $TheMovieDb->getFilmTmdb($film['tmdb_id']);
        
        if(is_array($tmdb_info)){
            $poster_path = (isset($tmdb_info['poster_path'])) ? $tmdb_info['poster_path'] : "";
            $backdrop_path = (isset($tmdb_info['backdrop_path'])) ? $tmdb_info['backdrop_path'] : "";
            $imdb_id = (isset($tmdb_info['imdb_id'])) ? $tmdb_info['imdb_id'] : "";
            if(isset($tmdb_info['title']))
            {
                $title = $tmdb_info['title'];
            }
        }

        $user_id = 1;//Auth::user()->id;

        $review_data = array(
            'user_id' => $user_id,
            'notes' => Input::get('notes', ''),
            
        );

        $film_data = array(
            'tmdb_id' => $tmdb_info['id'],
            'title' => $title,
            'poster_path' => $poster_path,
            'backdrop_path' => $backdrop_path,
            'imdb_id' => $imdb_id
        );

        //add the film
        $film = Film::firstOrNew( ['tmdb_id'=>$film_data['tmdb_id']] );
        $film->fill($film_data)->save();

        $film_id = $film->id;

        //add the review
        $review_data['film_id'] = $film_id;
        $review = Review::firstOrNew( ['film_id'=>$film_id, 'user_id'=>$user_id] );
        $review->fill($review_data)->save();
        ##
        ##need to add a check here to make sure they haven't already reviewed a film
        ##
        

        $ratings = Input::get('ratings');
        
        foreach($ratings as $rating)
        {
            Rating::create([
                'review_id'=>$review->id,
                'rating_type_id'=>$rating['rating_type_id'],
                'value'=>$rating['value']
            ]);
           
        }

        $review['film'] = $film;
        $review['ratings'] = $ratings;

        return $review;
            
	}

	/**
	 * Display the specified resource.
	 * GET /reviews/{id}
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        $review = Review::with('ratings','film')->find($id);

        return $review;
	}

	/**
	 * Show the form for editing the specified resource.
	 * GET /reviews/{id}/edit
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 * PUT /reviews/{id}
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
    
    $user_id = 1;//Auth::user()->id;

    $review_data = array(
        'notes' => Input::get('notes', ''),
    );

    $review = Review::find( $id );
    $review->update($review_data);

    
    $ratings = Input::get('ratings');
    
    foreach($ratings as $rating)
    {
        $r = Rating::firstOrNew([
            'review_id'=>$review->id,
            'rating_type_id'=>$rating['rating_type_id'],
            
        ]);
        $r->value = $rating['value'];
        $r->save();
       
    }

    $review['film'] = Input::get('film');
    $review['ratings'] = $ratings;

    return $review;
	}

	/**
	 * Remove the specified resource from storage.
	 * DELETE /reviews/{id}
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

}