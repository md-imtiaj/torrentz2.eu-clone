<?php
header('Content-type: text/xml; charset=UTF-8');

echo "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n";
$dateToday = date("Y-m-d");


$apiServer = 'https://torrents-api.1111110.xyz/api/torrent-api-v1';

//https://stackoverflow.com/questions/4503135/php-get-site-url-protocol-http-vs-https
if (isset($_SERVER['HTTPS']) &&
    ($_SERVER['HTTPS'] == 'on' || $_SERVER['HTTPS'] == 1) ||
    isset($_SERVER['HTTP_X_FORWARDED_PROTO']) &&
    $_SERVER['HTTP_X_FORWARDED_PROTO'] == 'https') {
  $protocol = 'https';
}
else {
  $protocol = 'http';
}

$actual_link = $protocol . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";

$site_link = explode('?', $actual_link)[0];
$site_link = explode('sitemap.php', $site_link)[0];

//sitemap urlset
if(isset($_GET['page'])){
	$pageNumber = $_GET['page'];
	$apiUrl = $apiServer . '?pid=data_top100_recent_' . ($pageNumber - 1) . '.json';
	if($pageNumber == 1){ $apiUrl = $apiServer . '?pid=data_top100_recent.json'; }
	
	
	$json_data = file_get_contents($apiUrl);
    $results = json_decode($json_data, true);
	
	$users_array = array();
	
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";   
        
	foreach($results as $res){
		$id = $res['id'];
		$ids = base_convert($id, 10, 36);
		$title = $res['name'];
		$sluz = slugify($title);
		$siteMapUrl =  $site_link . "T$ids/" . rawurlencode($sluz);
		echo "<url><loc>$siteMapUrl</loc><lastmod>$dateToday</lastmod></url>\n";
		$users_array[] = $res['username'];
	}
	echo '</urlset>';
	/*
	//add users sitemap at the end.
	$users_array = array_unique($users_array);
	foreach($users_array as $ua){
		 echo $site_link  . "sitemap.php?user=$ua\n";
    }
	*/
}
//sitemap urlset
else if(isset($_GET['user']) && isset($_GET['userpage'])){
	$userName = $_GET['user'];
	$userpage = $_GET['userpage'];
	
	$apiUrl = $apiServer . "?q=user%3A$userName%3A$userpage";
	if($userpage == 1){ $apiUrl = $apiServer . "?q=user%3A$userName"; }
	
	$json_data = file_get_contents($apiUrl);
	$results = json_decode($json_data, true);
	
	echo '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">' . "\n";
	
	foreach($results as $res){
		$id = $res['id'];
		$ids = base_convert($id, 10, 36);
		$title = $res['name'];
		$sluz = slugify($title);
		$siteMapUrl =  $site_link . "T$ids/" . rawurlencode($sluz);
		echo "<url><loc>$siteMapUrl</loc><lastmod>$dateToday</lastmod></url>\n";
	}
	echo '</urlset>';
}
//user
//sitemap index
else if(isset($_GET['user'])){
	$userName = $_GET['user'];
	
	$apiUrl = $apiServer . '?q=pcnt%3A' . $userName;
	$json_data = file_get_contents($apiUrl);
	
	echo "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
	for($i=1;$i<=$json_data;$i++){
		$siteMapIndex =  $site_link  . "sitemap.php?user=$userName&amp;userpage=$i";
        echo  "<sitemap><loc>$siteMapIndex</loc><lastmod>$dateToday</lastmod></sitemap>\n";		
	}
	echo '</sitemapindex>';
}
//sitemap index
else if(isset($_GET['users'])){
	$userNames = file_get_contents('topUsers.txt');
	$users = explode("\n",$userNames);
	$users = array_unique($users);
	
	echo "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
	foreach($users as $user){
		if(trim($user)!=''){
		    $siteMapIndex =  $site_link  . "sitemap.php?user=$user";
			echo  "<sitemap><loc>$siteMapIndex</loc><lastmod>$dateToday</lastmod></sitemap>\n";
        }			
	}
	echo '</sitemapindex>';
}
//sitemap index
else{
	echo "<sitemapindex xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">\n";
	for($i=1;$i<=159;$i++){		
		$siteMapIndex = $site_link  . "sitemap.php?page=$i";
		echo  "<sitemap><loc>$siteMapIndex</loc><lastmod>$dateToday</lastmod></sitemap>\n";       	
	}
    echo '</sitemapindex>';		
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
 


