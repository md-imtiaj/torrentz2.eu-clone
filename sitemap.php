<?php
header('Content-type: text/plain; charset=UTF-8');

$apiServer = 'https://torrents-api.1111110.xyz/api/torrent-api-v1';

$actual_link = (isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http") . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

$site_link = explode('?', $actual_link)[0];
$site_link = explode('sitemap.php', $site_link)[0];

if(isset($_GET['page'])){
	$pageNumber = $_GET['page'];
	$apiUrl = $apiServer . '?pid=data_top100_recent_' . ($pageNumber - 1) . '.json';
	if($pageNumber == 1){ $apiUrl = $apiServer . '?pid=data_top100_recent.json'; }
	
	
	$json_data = file_get_contents($apiUrl);
    $results = json_decode($json_data, true);
	
	$users_array = array();
	foreach($results as $res){
		$id = $res['id'];
		$ids = base_convert($id, 10, 36);
		$title = $res['name'];
		$sluz = slugify($title);
		echo $site_link . "T$ids/$sluz\n";
		$users_array[] = $res['username'];
	}
	//add users sitemap at the end.
	$users_array = array_unique($users_array);
	foreach($users_array as $ua){
		 echo $site_link  . "sitemap.php?user=$ua\n";
    }
}
else if(isset($_GET['user']) && isset($_GET['userpage'])){
	$userName = $_GET['user'];
	$userpage = $_GET['userpage'];
	
	$apiUrl = $apiServer . "?q=user%3A$userName%3A$userpage";
	if($userpage == 1){ $apiUrl = $apiServer . "?q=user%3A$userName"; }
	
	$json_data = file_get_contents($apiUrl);
	$results = json_decode($json_data, true);
	
	foreach($results as $res){
		$id = $res['id'];
		$ids = base_convert($id, 10, 36);
		$title = $res['name'];
		$sluz = slugify($title);
		echo $site_link . "T$ids/$sluz\n";
	}
}
//user
else if(isset($_GET['user'])){
	$userName = $_GET['user'];
	
	$apiUrl = $apiServer . '?q=pcnt%3A' . $userName;
	$json_data = file_get_contents($apiUrl);
	
	for($i=1;$i<=$json_data;$i++){
		echo $site_link  . "sitemap.php?user=$userName&userpage=$i\n";		
	}
}
else if(isset($_GET['users'])){
	$userNames = file_get_contents('topUsers.txt');
	$users = explode("\n",$userNames);
	$users = array_unique($users);
	
	
	foreach($users as $user){
		if(trim($user)!=''){
		    echo $site_link  . "sitemap.php?user=$user\n";
        }			
	}
}
else{
	for($i=1;$i<=159;$i++){
		echo $site_link  . "sitemap.php?page=$i\n";		
	}	
}



function slugify($text)
	{
	  $text = preg_replace('/\s+/', '-', $text);         // Replace spaces with -
	  $text = preg_replace('/[^\w\-]+/', '-', $text);    // Remove all non-word chars
	  $text = preg_replace('/\-\-+/', '-', $text);       // Replace multiple - with single -
	  $text = preg_replace('/^-+/', '', $text);          // Trim - from start of text
	  $text = preg_replace('/-+$/', '', $text);          // Trim - from end of text
	  return $text;
		
	}
 


