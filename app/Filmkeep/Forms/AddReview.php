<?php namespace Filmkeep\Forms;

use Laracasts\Validation\FormValidator;

class AddReview extends FormValidator{
  
  protected $rules = [
    'film' => 'required'
  ];

}