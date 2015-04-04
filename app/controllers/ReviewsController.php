<?php 
use Filmkeep\User;
use Filmkeep\Review;
use Filmkeep\Film;
use Filmkeep\Rating;
use Filmkeep\Follower;
use Filmkeep\TheMovieDb;
use Filmkeep\Forms\AddReview;
use Filmkeep\Watchlist;
use Filmkeep\Rotten;


class ReviewsController extends BaseController {

  private $addReviewForm;


  function __construct( AddReview $addReviewForm)
  {
    $this->addReviewForm = $addReviewForm;
  }

	/**
	 * Display a listing of the resource.
	 * GET /reviews
	 *
	 * @return Response
	 */
	public function index()
	{
        if(Input::has('username'))
        {
          $user = User::where('username', \Input::get('username') )->first();

          if(empty($user))
            return App::abort(404);

        }
        else{
          $user = \Input::has('user_id') ? User::find(\Input::get('user_id')) : User::find(Auth::id());
        }

        if(!$user)
          return App::abort(401);
        
        $num = \Input::has('num') ? \Input::get('num') : 24;
        $page = \Input::has('page') ? \Input::get('page') : 1;
        $offset = $num * ($page -1);
        $sortBy = \Input::has('sort_by') ? \Input::get('sort_by') : 'id';
        $sortDirection = \Input::get('sort_direction');

        if(\Input::has('sort_by_rating_type') && \Input::get('sort_by_rating_type') !== 'null')
        {
          $sortByRatingType = \Input::get('sort_by_rating_type');
		      $review = $user->reviews()
                        ->with('ratings','ratings.rating_type','film')
                        ->join('ratings', 'reviews.id', '=', 'ratings.review_id')
                        ->select('ratings.*','reviews.*')
                        ->where('rating_type_id', '=', $sortByRatingType)
                        ->orderBy('ratings.value', $sortDirection)
                        ->take($num)
                        ->offset($offset);
        }
        else{
          $review = $user->reviews()
                        ->with('ratings','ratings.rating_type','film')
                        ->take($num)
                        ->offset($offset)
                        ->orderBy($sortBy, $sortDirection);
        }
        

        $total = $user->reviews()->count();

        return \Response::json(['status' => 200, 'results' => $review->get(), 'total'=>$total]);
	}

  /**
   * Search for reviews.
   *
   * @param  string $query
   * @return Response
   */
  public function search()
  {
      $query = \Input::get('query');
      $reviews = Review::with('film','user')->whereHas('film', function($q) use ($query)
      {
          $q->where('title', 'LIKE', '%'.$query.'%');

      })->take(3)->get();
      return Response::json(['results'=>$reviews, 'query'=>$query]);
  }

  /*
  * returns all the reviews of friends for comparison
  */
  public function compares()
  {

    $film_id = \Input::get('film_id');
    $user_id = Auth::user()->id;
    $ids = $followers = Follower::where('user_id', $user_id)->lists('follower_id');
    $ids[] = $user_id;

    if(count($followers) > 0){
      $reviews =  Review::with('user','film','ratings','ratings.rating_type')
                  ->where('film_id', $film_id)
                  ->whereIn('user_id', $ids)
                  ->take(30)
                  ->get();

    }

    return (count($reviews)>1) ? $reviews : 'false';
    
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
    //Validate
    $this->addReviewForm->validate(\Input::all());

        $film_data =  \Input::get('film');
        
        $film = new Film();
        $film = $film->digestFilm($film_data['tmdb_id']);

        $user_id = Auth::user()->id;

        $review_data = array(
            'user_id' => $user_id,
            'notes' => Input::get('notes', ''),
        );

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

        $review = Review::with('ratings','film', 'user')->find($id);

        if(Auth::check())
        {
          $reviewed = Review::where('user_id', Auth::user()->id)->where('film_id', $review->film_id)->first();
          $review['reviewed'] = is_null($reviewed) ? 'false' : 'true';
          $w = new Watchlist();
          $review['film']['on_watchlist'] = $w->onWatchlist($review['film']['tmdb_id']);

          if(isset($review['film']['imdb_id'])){
            $rotten = new Rotten();
            $review['film']['rotten'] = $rotten->getScore($review['film']['imdb_id']);
          }
          
        }
        //add the latest 50 reviews for comparison
        $reviews = Review::with('ratings','film')
                            ->where('user_id', $review['user_id'])
                            ->take(50)
                            ->orderBy('created_at', 'desc')
                            ->get()
                            ->toArray();

        foreach($reviews as &$r){
          $newratings = [];
          foreach($r['ratings'] as $rating){
            $newratings[$rating['rating_type_id']] = $rating;
          }
          $r['ratings'] = $newratings;
        }

        $review['reviews'] = $reviews;
        
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