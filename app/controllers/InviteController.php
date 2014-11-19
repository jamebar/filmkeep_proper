<?php
 
use Filmkeep\Repositories\Invite\InviteRepository;
 
class InviteController extends BaseController {
 
  /**
   * InviteRepository
   *
   * @var Filmkeep\Repositories\Invite\InviteRepository
   */
  protected $repository;
 
  /**
   * Create a new instance of the InviteController
   *
   * @param Filmkeep\Repositories\Invite\InviteRepository
   */
  public function __construct(InviteRepository $repository)
  {
    $this->repository = $repository;
  }
 
  /**
   * Create a new invite
   *
   * @return Response
   */
  public function store()
  {
    $invite = $this->repository->create(Input::all());
  }
 
}