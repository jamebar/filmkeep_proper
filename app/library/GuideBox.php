<?php

class GuideBox
{
  const GET = 'get';
  const POST = 'post';
  const HEAD = 'head';

  const API_VERSION = 'v1.43';
  const REGION = 'US';
  const API_URL = 'api-public.guidebox.com';
  const API_SCHEME = 'http://';
  const API_SCHEME_SSL = 'https://';



  protected $_apikey;

  protected $_apischeme;

  public function __construct($apikey,$scheme = GuideBox::API_SCHEME)
  {
    $this->_apikey = (string) $apikey;
    $this->_apischeme = ($scheme == GuideBox::API_SCHEME) ? GuideBox::API_SCHEME : GuideBox::API_SCHEME_SSL;
  }

  public function searchTmdb($tmdb_id)
  {
    return $this->_makeCall('search/movie/id/themoviedb/' . $tmdb_id);
  }

  public function getMovie($id)
  {
    return $this->_makeCall('movie/' . $id);
  }

  /**
   * Makes the call to the API
   *
   * @param string $function      API specific function name for in the URL
   * @param array $params       Unencoded parameters for in the URL
   * @param string $session_id    Session_id for authentication to the API for specific API methods
   * @param const $method       
   * @return Guidebox result array
   */
  private function _makeCall($function, $params = NULL, $session_id = NULL, $method = GuideBox::GET)
  {
    $params = ( ! is_array($params)) ? array() : $params;
    $auth_array = array('api_key' => $this->_apikey);

    $url = $this->_apischeme.GuideBox::API_URL.'/'.GuideBox::API_VERSION.'/'.GuideBox::REGION.'/'.$this->_apikey.'/'.$function;

    if($method === GuideBox::GET)
    {

      $url .= ( ! empty($params)) ? '&'.http_build_query($params, '', '&') : '';
    }

    $results = '{}';

    if (extension_loaded('curl'))
    {
      $headers = array(
        'Accept: application/json',
      );

      $ch = curl_init();

      if($method == GuideBox::POST)
      {
        $json_string = json_encode($params);
        curl_setopt($ch,CURLOPT_POST, 1);
        curl_setopt($ch,CURLOPT_POSTFIELDS, $json_string);
        $headers[] = 'Content-Type: application/json';
        $headers[] = 'Content-Length: '.strlen($json_string);
      }
      elseif($method == GuideBox::HEAD)
      {
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'HEAD');
        curl_setopt($ch, CURLOPT_NOBODY, 1);
      }

      curl_setopt($ch, CURLOPT_URL, $url);
      curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($ch, CURLOPT_HEADER, 1);
      curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

      $response = curl_exec($ch);

      $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
      $header = substr($response, 0, $header_size);
      $body = substr($response, $header_size);

      $error_number = curl_errno($ch);
      $error_message = curl_error($ch);

      if($error_number > 0)
      {
        throw new GuideBoxException('Method failed: '.$function.' - '.$error_message);
      }

      curl_close($ch);
    }
    else
    {
      throw new GuideBoxException('CURL-extension not loaded');
    }

    $results = json_decode($body, TRUE);

    if($results !== NULL)
    {
      return $results;
    }
    elseif($method == GuideBox::HEAD)
    {
      return $this->_http_parse_headers($header);
    }
    else
    {
      throw new GuideBoxException('Server error on "'.$url.'": '.$response);
    }
  }
}