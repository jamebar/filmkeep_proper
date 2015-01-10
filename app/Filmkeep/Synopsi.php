<?php namespace Filmkeep;

class Synopsi {

	public $url;
	
	public function __construct()
	{
		$this->url = "https://api.synopsi.tv/1.0/title/identify/";
		
	}
    
	public function getStreamInfo($imdb_id)
	{
		if(strpos($imdb_id , 'tt') !== false)
		{
			$imdb_id = explode('tt', $imdb_id)[1];
		}
		
    if ( ! $streaming =  \Cache::get("streaming-".$imdb_id))
		{
			
			$streaming = $this->CallAPI( "GET", $this->url, array("imdb_id"=> $imdb_id, "title_property[]"=> "streaming") );
		
			// Save into the cache for 1 week
			\Cache::put("streaming-".$imdb_id, $streaming,  10080);
		}
        	 
		
    return json_decode($streaming, true);
	}
	
	function CallAPI($method, $url, $data = false)
	{
	    $curl = curl_init();
      $headers = array(
        'Accept: application/json',
      );

	    switch ($method)
	    {
	        case "POST":
	            curl_setopt($curl, CURLOPT_POST, 1);

	            if ($data)
	                curl_setopt($curl, CURLOPT_POSTFIELDS, $data);
	            break;
	        case "PUT":
	            curl_setopt($curl, CURLOPT_PUT, 1);
	            break;
	        default:
	            if ($data)
	                $url = sprintf("%s?%s", $url, http_build_query($data));
	    }

	    curl_setopt($curl, CURLOPT_URL, $url);
      curl_setopt($curl, CURLOPT_HTTPHEADER, $headers);
      curl_setopt($curl, CURLOPT_HEADER, 1);
      curl_setopt($curl, CURLOPT_RETURNTRANSFER, 1);
      curl_setopt($curl, CURLOPT_SSL_VERIFYPEER, false);

	    $response = curl_exec($curl);
      $header_size = curl_getinfo($curl, CURLINFO_HEADER_SIZE);
      $header = substr($response, 0, $header_size);
      $body = substr($response, $header_size);

      $error_number = curl_errno($curl);
      $error_message = curl_error($curl);

      

      curl_close($curl);

      return $body;
	}
    
}