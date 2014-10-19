<?php 

use Filmkeep\Review;

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
		//
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
        $review = Review::find($id)->with('ratings','film')->first();

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
		//
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