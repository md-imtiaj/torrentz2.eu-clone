//var server = 'https://apibay.org';
var apiServer = 'https://torrents-api.1111110.xyz/api/torrent-api-v1';
//var server = 'http://localhost:3000/api/torrent-api-v1';
var torrent_download_url = 'https://torrents.1111110.xyz/api/torrent-download'
var magnet_url = 'https://magnet.1111110.xyz/api/magnet'
//var torrent_download_url = 'http://localhost:3000/api/torrent-download'

const translationlanguages = {'af': 'Afrikaans','sq': 'Albanian','ar': 'Arabic','az': 'Azerbaijani','eu': 'Basque','bn': 'Bengali','be': 'Belarusian','bg': 'Bulgarian','ca': 'Catalan','zh-CN': 'Chinese Simplified','zh-TW': 'Chinese Traditional','hr': 'Croatian','cs': 'Czech','da': 'Danish','nl': 'Dutch','en': 'English','eo': 'Esperanto','et': 'Estonian','tl': 'Filipino','fi': 'Finnish','fr': 'French','gl': 'Galician','ka': 'Georgian','de': 'German','el': 'Greek','gu': 'Gujarati','ht': 'Haitian Creole','iw': 'Hebrew','hi': 'Hindi','hu': 'Hungarian','is': 'Icelandic','id': 'Indonesian','ga': 'Irish','it': 'Italian','ja': 'Japanese','kn': 'Kannada','ko': 'Korean','la': 'Latin','lv': 'Latvian','lt': 'Lithuanian','mk': 'Macedonian','ms': 'Malay','mt': 'Maltese','no': 'Norwegian','fa': 'Persian','pl': 'Polish','pt': 'Portuguese','ro': 'Romanian','ru': 'Russian','sr': 'Serbian','sk': 'Slovak ','sl': 'Slovenian','es': 'Spanish','sw': 'Swahili','sv': 'Swedish','ta': 'Tamil','te': 'Telugu ','th': 'Thai','tr': 'Turkish','uk': 'Ukrainian','ur': 'Urdu','vi': 'Vietnamese','cy': 'Welsh','yi': 'Yiddish'};


var currentUrl = window.location.href.split(/[?#]/)['0'];


var apiUrl;
var documentTitle;
var recentLinks = '';
var apiPageCountUrl = '';
var query = getQueryStringValue('q');
var page = getQueryStringValue('page');
if(page==''){ pageNumber = 1; }
else{ pageNumber = parseInt(page); }

var ageQuery = getQueryStringValue('age');
var categoryUser = '';


//insert home top100 links
document.querySelector('#home-link').href = siteBaseUrl;
document.querySelector('#top-100-recent').href = siteBaseUrl + 'top100/recent';
document.querySelector('#top-100-all').href = siteBaseUrl  + 'top100/all';
//set search form action 
document.searchForm.action = siteBaseUrl;

//insert styleSheets
var linkElm = document.createElement("link");
linkElm.rel = "stylesheet";
linkElm.href = siteBaseUrl + "style.css";
document.getElementsByTagName("head")[0].appendChild(linkElm);

//simple router
var allCat = 	categoryList.join('|');
var catRegx = '\/(' + allCat + ')\/(.*?)$';


//category pages  //https://torrents-api.1111110.xyz/api/torrent-api-v1?pid=data_top100_48h_100.json
if( currentUrl.match(catRegx) ){
  var categoryNameMatch =  currentUrl.match(catRegx);
  var categoryName = categoryNameMatch[1];
  var categoryOrder = categoryNameMatch[2];
  
  var categoryNumber =  categoryToNUmber(categoryName);
  
  documentTitle = `Recent ${categoryName} torrents`;
  apiUrl = apiServer + '?q=category%3A' + categoryNumber;
  
  if(ageQuery == '2d'){ apiUrl = apiServer + `?pid=data_top100_48h_${categoryNumber}.json`;  documentTitle = `Last Two Day's ${categoryName} torrents`; }
  
  document.title = documentTitle;
  
  fetch_callback(apiUrl, 'buildSearchTemplate' );
  console.log('Category: ' + categoryName + ' & number: ' + categoryNumber);  
  
  
  recentLinks = `Age: <a href='${siteBaseUrl}${categoryName}/?age=2d'>2d</a> | <a href='${siteBaseUrl}${categoryName}/'>all time</a>`;
}

//torrent pages
else if( currentUrl.match(/\/T(.*?)\/(.*?)$/) ){
	var torrentIdMatch =  currentUrl.match(/\/T(.*?)\/(.*?)$/); 
	var torrentIdStr = torrentIdMatch[1];	
	var torrentId = parseInt(torrentIdStr, 36);
	
	var apiUrlFileList = apiServer + '?fid=' + torrentId;
	var apiUrlTorrentDetails = apiServer + '?tid=' + torrentId;
	  
	fetch_callback(apiUrlTorrentDetails, 'buildPageTemplate' );
	console.log("Torrent id: " + torrentIdStr + ' ' + torrentId);
}



//user pages //https://torrents-api.1111110.xyz/api/torrent-api-v1?q=user%3ACenaCme%3Atoday ,twodays ,threedays
else if( currentUrl.match(/\/user\/(.*?)$/) ){
  var userPage = true; 
  var userNameMatch = currentUrl.match(/\/user\/(.*?)$/);
  var userName = userNameMatch[1];
  documentTitle = `${userName}'s Torrents by Upload date`;
  if(pageNumber>1){
		  apiUrl = apiServer + '?q=user%3A' + userName + '%3A' + (pageNumber - 1);
          documentTitle = `Torrents by ${userName}, Page: ${pageNumber}`;
	}else{
		  apiUrl = apiServer + '?q=user%3A' + userName;
	} 
	
	apiPageCountUrl = apiServer + '?q=pcnt%3A' + userName;
    
    if(ageQuery == '1d'){ apiUrl = apiServer + `?q=user%3A${userName}%3Atoday`;  apiPageCountUrl = '';  documentTitle = `${userName}'s Torrents, One Day old`; }
    if(ageQuery == '2d'){ apiUrl = apiServer + `?q=user%3A${userName}%3Atwodays`; apiPageCountUrl = ''; documentTitle = `${userName}'s Torrents, Two Days Old`; }
    if(ageQuery == '3d'){ apiUrl = apiServer + `?q=user%3A${userName}%3Athreedays`; apiPageCountUrl = ''; documentTitle = `${userName}'s Torrents, Three Days Old`; }	
  
  document.title = documentTitle;
  
  fetch_callback(apiUrl, 'buildSearchTemplate' );
  console.log('User: ' + userName);
  
  
  recentLinks = `Age: <a href='${siteBaseUrl}user/${userName}?age=1d'>1d</a> | <a href='${siteBaseUrl}user/${userName}?age=2d'>2d</a> | <a href='${siteBaseUrl}user/${userName}?age=3d'>3d</a> | <a href='${siteBaseUrl}user/${userName}'>all time</a>`;

}

//top100 pages ageQuery //https://torrents-api.1111110.xyz/api/torrent-api-v1?pid=data_top100_48h.json
else if( currentUrl.match(/\/top100\/(.*?)$/) ){
   var topMatch = currentUrl.match(/\/top100\/(.*?)$/);
   var topOrder = topMatch[1];
   
   
   
   var topOrderTxt = 'Recent';
   if(topOrder=='all'){ 
      topOrderTxt = 'Top 100'; 
	  recentLinks = `Age: <a href='${siteBaseUrl}top100/all?age=2d'>2d</a> | <a href='${siteBaseUrl}top100/all'>all time</a>`;	  
	  }
   
   documentTitle = `${topOrderTxt} torrents`;
   
   //data_top100_recent.json or data_top100_all.json
   apiUrl = apiServer + '?pid=data_top100_' + topOrder + '.json';
   
   if(ageQuery == '2d'){ apiUrl = apiServer + '?pid=data_top100_48h.json'; documentTitle = `Top 100 torrents, Last Two days`; }
   
   if(topOrder=='recent'){
	  apiPageCountUrl = apiServer + '?q=pcnt%3Arecent';
	  if(pageNumber>1){
		  apiUrl = apiServer + '?pid=data_top100_' + topOrder + '_' + (pageNumber - 1) + '.json';
		  documentTitle = `${topOrderTxt} torrents, Page: ${pageNumber}`;
		}
   }
   
   document.title = documentTitle;
   
   fetch_callback(apiUrl, 'buildSearchTemplate' );
   console.log('top100 ' + topOrder);
   
}

//search pages
else if(query !=''){
	apiUrl  = apiServer + '?q=' + encodeURIComponent(query);
	fetch_callback(apiUrl, 'buildSearchTemplate' );	
	console.log('Search: ' + query);
	documentTitle = `Torrent Search for '${query}'`;
	document.title = documentTitle;
}

//home page
else if(currentUrl == siteBaseUrl){
	categoryLinks = '<div style="font-size:15px;"><br/><b>Browse: </b>';
	for (var i=0; i<categoryList.length; i++){
		if (i === categoryList.length - 1) {
           //if last item
		   categoryLinks = categoryLinks + `<a href="${siteBaseUrl}${categoryList[i]}/" title="Latest ${categoryList[i]} Torrents.">${categoryList[i]}</a></div>`;
        }else{
		   categoryLinks = categoryLinks + `<a href="${siteBaseUrl}${categoryList[i]}/" title="Latest ${categoryList[i]} Torrents.">${categoryList[i]}</a> | `;
		}
	}
	document.getElementById("main-containts").innerHTML = categoryLinks;
}


function fetch_callback(url, callback){
   console.log('Date fetch called.');
   fetch(url)
   .then(function(response) {
		console.log('Data fetch response code: ' + response.status); // Will show you the status
		if (!response.ok) {
			document.getElementById("main-containts").innerHTML = '<center><b style="font-size:50px;color:red;">Server Down</b></center>';
			//throw new Error("HTTP status " + response.status);
			return false;
		}
		return response;
	})
  .then(response => response.json())
  .then(data => window[callback](data));
}



function buildPageTemplate(data){
	var torrentId, torrentInfoHash, torrentCategory, torrentName, torrentStatus, torrentNumFiles,
	torrentSizeBytes, torrentSeeders, torrentLeechers, torrentUsername, torrentAdded, torrentAnon, torrentImdb, torrentDescription,
	torrentMagnetLink, torcacheLink, torrentSize, torrentAge, torrentLink,
	torrentCategoryText, torrentMainCategory, torrentSubCategory, torrentKeywords, keywordLinks;
	
	
	
	var item = data;
	
	torrentId = item["id"];
	torrentInfoHash = item["info_hash"];
    torrentCategory = item["category"];
    torrentStatus = item["status"];
    torrentName = item["name"];
    torrentNumFiles = item["num_files"];
    torrentSizeBytes = item["size"];
    torrentSeeders = item["seeders"];
    torrentLeechers = item["leechers"];
    torrentUsername = item["username"];
    torrentAdded = item["added"];
    torrentDescription = item["descr"];
	torrentImdb = item["imdb"];
	
	torrentMagnetLink = magnet_url + '?dn=' + encodeURIComponent(torrentName) + '&ih=' + torrentInfoHash;
		
	torcacheLink = torrent_download_url + '?dn=' + encodeURIComponent(torrentName) + '&ih=' + torrentInfoHash;
		
	var torrentSize = print_size(torrentSizeBytes, 1);
	torrentSize = torrentSize.split('(')[0].replaceAll('&nbsp;', ' ').trim();
		
    var torrentAge = timeConverter(torrentAdded);
	
	var trackersHtml = buildTrackersHtml();
	
	torrentCategoryText = categoryNumberToMainSubcategory(torrentCategory); 
	torrentMainCategory = torrentCategoryText[0];
	torrentSubCategory = torrentCategoryText[1];
	
	torrentKeywords = sdk_removeCommonWords(torrentName);
	keywordLinks = '';
	for (var i=0; i<torrentKeywords.length; i++){
		if (i === torrentKeywords.length - 1) {
           //if last item
		   keywordLinks = keywordLinks + `<a href="${siteBaseUrl}?q=${torrentKeywords[i]}" title="Search ${torrentKeywords[i]}.">${torrentKeywords[i]}</a>`;
        }else{
		   keywordLinks = keywordLinks + `<a href="${siteBaseUrl}?q=${torrentKeywords[i]}" title="Search ${torrentKeywords[i]}.">${torrentKeywords[i]}</a> | `;
		}
	}
	
	document.title = "Download " + torrentName + ' [' + torrentSize + '] torrent';
	
	//console.log(keywordLinks);
	var torrentPageTemplate = `<div class='download'>
		<div class="notranslate">
		Published 
		<span title='${torrentAge}' itemprop="datePublished">${torrentAge}</span>
		</div>
		
		<span>		
		  <a class='magnet-button notranslate' href='${torrentMagnetLink}' title="Magnet link of ${torrentName}." rel="nofollow">Magnet <sapn class='magnet results-icon'></span></a>&nbsp;		
		  <a class='magnet-button notranslate' href='${torcacheLink}' title=".torrent Download link of ${torrentName}." rel="nofollow">Download <span class='torcache results-icon'></span></a>
		</span>
		
		<h1  class="h1-title notranslate">
		<span itemprop="name">		
			${torrentName} 
		</span>
		<span itemprop="fileSize">[${torrentSize}]</span>
		</h1>
		
		
		
		<dl>
		<dt>
		<a href=''>
		<span class="source-icon thepiratebay-ico">
		<!--img height='16' src='${siteBaseUrl}img/thepiratebay.ico' width='16'-->
		&nbsp;
		</span>
		<span class='u notranslate'>
		ThePirateBay
		<span class='j z spadlock'></span>
		</span>
		<span class='n'>
		<!--${torrentName}
		&nbsp;
		»--> 
<a href="${siteBaseUrl}${torrentMainCategory}/" title="Search recent ${torrentMainCategory} torrents.">${torrentMainCategory}</a> »  
<a href="${siteBaseUrl}${torrentSubCategory}/" title="Search recent ${torrentSubCategory} torrents.">${torrentSubCategory}</a>
by <a href="${siteBaseUrl}user/${torrentUsername}" title="Get all torrents by ${torrentUsername}." class="torrent-user-name">${torrentUsername}</a>
		</span>
		</a>
		</dt>
		</dl>
		</div>

		<div class='trackersvotebox'>
		<div class='trackers'>
		<h2>
		<span>Torrent Trackers</span>
		<!--hash 1989ACDCF4AC929DB2BC46DFE3BAC829BB522B5E-->
		</h2>

		${trackersHtml}

		</div>

		<div id='votebox'>
		<span class='status sA2EB80 notranslate' style="text-transform: capitalize;">${torrentStatus}</span>
		<a class='up'>Verify as a ${torrentStatus} Torrent (${Math.floor(Math.random() * (50 - 20 + 1) + 20)})</a>
		<span class='replist'>
		<a>Fake 0</a>
		<a>Password 0</a>
		<a>Low quality ${Math.floor(Math.random() * (5 - 2 + 1) + 2)}</a>
		<a>Virus 0</a>
		</span>
		</div>

		</div>

		<div id='recent2'>
		<h2>Description:</h2><br/>
		
		<pre>${torrentDescription}</pre>
		
		</div>

		<div class='files'>
		<div class="notranslate">Size: ${torrentSize}</div>
		<h2>File List</h2>
		<div id='viewfiles' style='float:left;'>		
		</div>
		</div>
		<div style="clear:both;"><br/><hr/>Try: ${keywordLinks}</div>
		<br/><br/>
		<h3>Latest "<b>${torrentMainCategory}</b>" Torrents.</h3>
		<div style="clear:both;" id="search-list" class='results'></div>
		`;
		
	document.getElementById("main-containts").innerHTML = torrentPageTemplate;
	
	fetch_callback(apiUrlFileList, 'insertFileList' );
	
    insert_breadcrumb_structure_data(torrentMainCategory, torrentSubCategory, torrentUsername, torrentName);
	

    torrentLink = siteBaseUrl + 'T' + torrentId.toString(36) + '/' + slugify(torrentName);
	
	var torrentDescriptionMeta = genMetaDescription(torrentDescription);	
	torrentDescriptionMeta = `Size: ${torrentSize} ${torrentDescriptionMeta}`;
	
	update_seo_meta_tags(torrentName, torrentDescriptionMeta, torrentLink, torrentUsername);
	
	
	insert_CreativeWork_structure_data(torrentName, torrentDescription, torrentLink, torrentUsername, torrentSize);
	
	//append siteTitle to page title
	document.title = document.title + ' - ' + siteTitle;
	
	//insert category list
	apiUrl = apiServer + '?q=category%3A' + torrentCategory;
	fetch_callback(apiUrl, 'buildSearchList');
}

function insertFileList(data){
	var fileListHtml = buildFileListHtml(data);	
	document.getElementById("viewfiles").innerHTML = fileListHtml;	
}

function buildSearchList(data){
	var searchList = buildSearchTemplate(data, returnList=true);
	document.getElementById("search-list").innerHTML = searchList;
}



function buildSearchTemplate(data, returnList=false){
	console.log('Search data fetch finished.');
	var torrentId, torrentInfoHash, torrentCategory, torrentName, torrentStatus, torrentNumFiles,
	torrentSizeBytes, torrentSeeders, torrentLeechers, torrentUsername, torrentAdded, torrentAnon, torrentImdb,
	torrentMagnetLink, torcacheLink, torrentSize, torrentAge, torrentLink, 
	torrentCategoryText, torrentMainCategory, torrentSubCategory;
	

	var searchTemplateItemsAll = ''; //data = data.slice(0, 3);
	for(i = 0; i < data.length; i++) {
		
		torrentId = parseInt( data[i]["id"] ); 
		torrentInfoHash = data[i]["info_hash"];
		torrentCategory = data[i]["category"];
		torrentName = data[i]["name"];
		torrentStatus = data[i]["status"];
		torrentNumFiles = data[i]["num_files"];
		torrentSizeBytes = data[i]["size"];
		torrentSeeders = data[i]["seeders"];
		torrentLeechers = data[i]["leechers"];
		torrentUsername = data[i]["username"];
		torrentAdded= data[i]["added"];
		torrentAnon = data[i]["anon"];
		torrentImdb = data[i]["imdb"];
		
		torrentMagnetLink = magnet_url + '?dn=' + encodeURIComponent(torrentName) + '&ih=' + torrentInfoHash;
		
		torcacheLink = torrent_download_url + '?dn=' + encodeURIComponent(torrentName) + '&ih=' + torrentInfoHash;
		
		var torrentSize = print_size(torrentSizeBytes, 1);
	    torrentSize = torrentSize.split('(')[0].replaceAll('&nbsp;', ' ').trim();
		
		//var torrentAge = timeConverter(torrentAdded, short=true); //this returns date like mm/dd/yyyy
		var torrentAge = timeConverter(torrentAdded);
		
		//torrentLink = slugify(torrentName) + '-t' + torrentId;
		//new torrent links
		torrentLink = 'T' + torrentId.toString(36) + '/' + slugify(torrentName);
		
		torrentCategoryText = categoryNumberToMainSubcategory(torrentCategory);
		torrentMainCategory = torrentCategoryText[0];
		torrentSubCategory = torrentCategoryText[1]; 
		
		var torrentUserLink;
		if(torrentUsername != 'Anonymous') { torrentUserLink = `by <a href="${siteBaseUrl}user/${torrentUsername}" title="Get all torrents by ${torrentUsername}." class="notranslate">${torrentUsername}</a>`;}
		else if (torrentUsername = 'Anonymous'){ torrentUserLink = 'by Anonymous'; }
		//if user pages don't show user page links
		if (userPage){ torrentUserLink = ''; }
		
		var searchTemplateItems = `
				<dl id="torrent-list">
				<dt>
				<h3 class="wrapword">
				<a href='${siteBaseUrl}${torrentLink}' title="Details for ${torrentName} torrent."  class="notranslate">${torrentName}</a>
	            » <a href="${siteBaseUrl}${torrentMainCategory}/" title="${torrentMainCategory} torrents.">${torrentMainCategory}</a>
				» <a href="${siteBaseUrl}${torrentSubCategory}/" title="${torrentSubCategory} torrents."  class="sub-cat">${torrentSubCategory}</a>
				${torrentUserLink}
				 <span class="file-size-h3 notranslate">[${torrentSize}]</span><!--only use in mobile view-->
				</h3>
				</dt>
				<dd>
				<span style='width: 20px'>
				<a class='results-icon magnet notranslate' href='${torrentMagnetLink}' title="Magent link of ${torrentName} torrent." rel="nofollow"></a>
				</span>
				<span style='width: 20px'>
				<a class='results-icon torcache' href='${torcacheLink}' title=".torrent download link of ${torrentName}." rel="nofollow"></a>
				</span>
				<span title='Uploaded at ${torrentAge}' class="upload-date">${torrentAge}</span>
				<span style='text-align: right;' class="file-size-right notranslate">
				&nbsp;
				${torrentSize} <input type="hidden" name="size" value="${torrentSizeBytes}"/>
				</span>
				<span style='margin-right: 5px;' class="seeders">${torrentSeeders}</span>
				<span style='text-align: right;margin-left: 5px;' class="leechers">${torrentLeechers}</span>
				</dd>
				</dl>
				`;		
		
		
		searchTemplateItemsAll = searchTemplateItemsAll + searchTemplateItems;
	}
	
	if(returnList) { return searchTemplateItemsAll; }
		
	 searchTemplateHeader = `
		<div class='results'>

		<div id="age-links">${recentLinks}</div>

		<h1>${documentTitle}</h1>

		<h3>
			Order by:
			<a onclick="sortPeers();">peers</a>|
			<a onclick="sortDate();">date</a>|
			<a  onclick="sortSize();">size</a>
		</h3>
		`;
		
		
	//searchTemplateItemsAll = '';
	document.getElementById("main-containts").innerHTML = searchTemplateHeader + searchTemplateItemsAll + '</div><div class="pagination-container-div"><p class="pagination-container"><span id="pagination"></span></p></div>';
    
	//append siteTitle to page title
	document.title = document.title + ' - ' + siteTitle;
	
	if(apiPageCountUrl!=''){ fetch_callback(apiPageCountUrl, 'buildPaginationTemplate'); }
	
	update_seo_meta_tags(documentTitle, documentTitle, window.location.href, 'admin');
}

function sortSize(){
	event.preventDefault();
	tinysort('dl#torrent-list', {selector: 'input',attr: 'value'});
	tinysort.defaults.order == 'desc' ? tinysort.defaults.order = 'asc' : tinysort.defaults.order = 'desc';
}
function sortPeers(){
	tinysort.defaults.order = 'desc';
	tinysort('dl#torrent-list', '.leechers');
	tinysort.defaults.order == 'desc' ? tinysort.defaults.order = 'asc' : tinysort.defaults.order = 'desc';
}
function sortDate(){
	tinysort('dl#torrent-list', '.upload-date');
	tinysort.defaults.order == 'desc' ? tinysort.defaults.order = 'asc' : tinysort.defaults.order = 'desc';
}

function buildPaginationTemplate(data){
	var currentPage = pageNumber;
	var paginationsArray = paginationArray(currentPage, data);
	let pagination_html = '';
	var index; 
	for(let i=0; i<paginationsArray.length; i++){
	
	  index = paginationsArray[i]; 
	  if(index === currentPage){ 
		 pagination_html = pagination_html + `<a href="#" disabled tabindex="-1" style="pointer-events: none;color:grey;border:grey;"><b>${currentPage}</b></a>`; 
	  }
	  else if(index ==='...'){ 
		 pagination_html = pagination_html + '<a href="#" disabled tabindex="-1" style="pointer-events: none;color:grey;border:grey;"><b>... </b></a>'; 
	  }
	  else{ 
	    pagination_html = pagination_html + `<a href="?page=${index}" title="Got to page ${index}." >${index}</a>`; 
		} 
	}
	
	document.getElementById("pagination").innerHTML = pagination_html;
}

//https://stackoverflow.com/questions/25434813/simple-pagination-in-javascript
function paginationArray(current_page, last_page, onSides = 3) {
        // pages
        let pages = [];
        // Loop through
        for (let i = 1; i <= last_page; i++) {
            // Define offset
            let offset = (i == 1 || last_page) ? onSides + 1 : onSides;
            // If added
            if (i == 1 || (current_page - offset <= i && current_page + offset >= i) || 
                i == current_page || i == last_page) {
                pages.push(i);
            } else if (i == current_page - (offset + 1) || i == current_page + (offset + 1)) {
                pages.push('...');
            }
        }
        return pages;
    }


/*prepare meta descript text*/
function genMetaDescription(text){
	var cleanTxt;
	cleanTxt = text.replaceAll(/<a\b[^>]*>(.*?)<\/a>/gi,""); //remove <a></a> tags
	cleanTxt = removeLinks(cleanTxt);
	cleanTxt = cleanText(cleanTxt);
	cleanTxt = cleanTxt.substring(0, 160);
	return cleanTxt;
}

function removeLinks(text){
  var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
  return text.replace(urlRegex, '');
}

function cleanText(text){
	var cleanTxt;
	cleanTxt = text.replace(/\s+/g, " ");                                //remove extra spaces
	cleanTxt = cleanTxt.replace(/\r?\n|\r/, '');                         //remove new lines
	cleanTxt = cleanTxt.replace(/\[(\w+)[^\]]*](.*?)\[\/\1]/g, '');      //remove bbcodes
	cleanTxt = cleanTxt.replace(/<\/?[^>]+(>|$)/g, "");                  //remove html tags
	return cleanTxt;
}
/*prepare meta descript text end*/

/*seo meta data*/
//update seo meta tags
function update_seo_meta_tags(torrentName, torrentDescriptionMeta, torrentLink, torrentUsername){		
	
	document.querySelector('meta[name="description"]').setAttribute('content', torrentDescriptionMeta);
	document.querySelector('meta[name="author"]').setAttribute('content', torrentUsername);
	
	document.querySelector('meta[property="og:description"]').setAttribute('content', torrentDescriptionMeta);
	document.querySelector('meta[name="twitter:description"]').setAttribute('content', torrentDescriptionMeta);
	
	document.querySelector('meta[property="og:title"]').setAttribute('content', torrentName);
	document.querySelector('meta[name="twitter:title"]').setAttribute('content', torrentName);
	
	//document.querySelector('meta[name="author"]').setAttribute('content', host_name);
	
	document.querySelector('link[rel="canonical"]').setAttribute('href', torrentLink);
	document.querySelector('meta[property="og:url"]').setAttribute('content', torrentLink);
	document.querySelector('meta[name="twitter:url"]').setAttribute('content', torrentLink);
	
	//console.log( document.querySelector('meta[name="twitter\\:url"]').getAttribute('content'));
}

	
/*structured data functions*/
(function(){
	   		var s = document.createElement("script");
			s.type = "application/ld+json";
			s.text = `{"@context": "http:\/\/schema.org", "@type": "WebSite", "name": "${siteTitle}", "url": "${siteBaseUrl}",
						"potentialAction": {
						"@type": "SearchAction",
						"target": {
						  "@type": "EntryPoint",
						  "urlTemplate": "${siteBaseUrl}?q={search_term_string}"
						},
						"query-input": "required name=search_term_string"
					  }}`;
			document.getElementsByTagName("head")[0].appendChild(s);
   })();
   
function insert_breadcrumb_structure_data(torrentMainCategory, torrentSubCategory, torrentUsername, torrentName){
            var s = document.createElement("script");
			s.type = "application/ld+json";
			s.text = `{
						 "@context": "http://schema.org",
						 "@type": "BreadcrumbList",
						 "itemListElement":
						 [
							{"@type": "ListItem", "position": 1, "item": "${siteBaseUrl}${torrentMainCategory}", "name": "${torrentMainCategory}"},
							{"@type": "ListItem", "position": 2, "item": "${siteBaseUrl}${torrentSubCategory}", "name": "${torrentSubCategory}"},
							{"@type": "ListItem", "position": 3, "item": "${siteBaseUrl}user/${torrentUsername}", "name": "${torrentUsername}"},
							{"@type": "ListItem","position": 4,	"name": "${torrentName}"}
						 ]
						}`;
		document.getElementsByTagName("head")[0].appendChild(s);
   }

function insert_CreativeWork_structure_data(torrentName, torrentDescription, torrentUrl, torrentUsername, torrentSize){
            var s = document.createElement("script");
			s.type = "application/ld+json";
			s.text = `{"@context": "http://schema.org", "@type": "CreativeWork", "name": "${torrentName}", "url": "${torrentUrl}", "description": "${torrentDescription}", "size":"${torrentSize}", "author": "${torrentUsername}"}`;
		document.getElementsByTagName("head")[0].appendChild(s);
   }  


/*structured data functions end*/

function categoryNumberToMainSubcategory(cat){
	let mainCateogy, subCategory, cc = cat.toString();
	
	if (cc[0] == 1) mainCateogy = 'Audio';
    if (cc[0] == 2) mainCateogy = 'Video';
    if (cc[0] == 3) mainCateogy = 'Applications';
    if (cc[0] == 4) mainCateogy = 'Games';
    if (cc[0] == 5) mainCateogy = 'Porn';
    if (cc[0] == 6) mainCateogy = 'Other';
	
    if (cat == 101) subCategory = 'Music';
    if (cat == 102) subCategory =  'AudioBooks';
    if (cat == 103) subCategory =  'SoundClips';
    if (cat == 104) subCategory =  'FLAC';
    if (cat == 199) subCategory =  'OtherMusic';
    if (cat == 201) subCategory =  'Movies';
    if (cat == 202) subCategory =  'MoviesDVDR';
    if (cat == 203) subCategory =  'Videos';
    if (cat == 204) subCategory =  'MovieClips';
    if (cat == 205) subCategory =  'TVShows';
    if (cat == 206) subCategory =  'HandheldVideos';
    if (cat == 207) subCategory =  'HDMovies';
    if (cat == 208) subCategory =  'HDTVShows';
    if (cat == 209) subCategory =  '3D';
    if (cat == 299) subCategory =  'OtherVideos';
    if (cat == 301) subCategory =  'Windows';
    if (cat == 302) subCategory =  'MacAppleApplications';
    if (cat == 303) subCategory =  'UNIX';
    if (cat == 304) subCategory =  'HandheldApplications';
    if (cat == 305) subCategory =  'IOSiPadiPhoneApplications';
    if (cat == 306) subCategory =  'AndroidApplications';
    if (cat == 399) subCategory =  'OtherOSApplications';
    if (cat == 401) subCategory =  'PC';
    if (cat == 402) subCategory =  'MacAppleGames';
    if (cat == 403) subCategory =  'PSx';
    if (cat == 404) subCategory =  'XBOX360';
    if (cat == 405) subCategory =  'Wii';
    if (cat == 406) subCategory =  'HandheldGames';
    if (cat == 407) subCategory =  'IOSiPadiPhoneGames';
    if (cat == 408) subCategory =  'AndroidGames';
    if (cat == 499) subCategory =  'OtherOSGames';
    if (cat == 501) subCategory =  'PornMovies';
    if (cat == 502) subCategory =  'PornMoviesDVDR';
    if (cat == 503) subCategory =  'PornPictures';
    if (cat == 504) subCategory =  'PornGames';
    if (cat == 505) subCategory =  'PornHDMovies';
    if (cat == 506) subCategory =  'PornMovieClips';
    if (cat == 599) subCategory =  'OtherPorn';
    if (cat == 601) subCategory =  'Ebooks';
    if (cat == 602) subCategory =  'Comics';
    if (cat == 603) subCategory =  'Pictures';
    if (cat == 604) subCategory =  'Covers';
    if (cat == 605) subCategory =  'Physibles';
    if (cat == 699) subCategory =  'OtherEbooks';
    return [mainCateogy, subCategory];
}


function categoryToNUmber(cat){
	let categoryNumber;
	
	if (cat == 'Audio') categoryNumber = 100;
    if (cat == 'Video') categoryNumber = 200;
    if (cat == 'Applications') categoryNumber = 300;
    if (cat == 'Games') categoryNumber = 400;
    if (cat == 'Porn') categoryNumber = 500;
    if (cat == 'Other') categoryNumber = 600;
	
    if (cat ==  'Music') categoryNumber = 101;
    if (cat == 'AudioBooks') categoryNumber =  102;
    if (cat == 'SoundClips') categoryNumber =  103;
    if (cat == 'FLAC') categoryNumber =  104;
    if (cat == 'OtherMusic') categoryNumber =  199;
    if (cat == 'Movies') categoryNumber = 201;
    if (cat == 'MoviesDVDR') categoryNumber =  202;
    if (cat == 'Videos') categoryNumber =  203;
    if (cat == 'MovieClips') categoryNumber =  204;
    if (cat == 'TVShows') categoryNumber =  205;
    if (cat == 'HandheldVideos') categoryNumber =  206;
    if (cat == 'HDMovies') categoryNumber =  207;
    if (cat == 'HDTVShows') categoryNumber =  208;
    if (cat == '3D') categoryNumber =  209;
    if (cat == 'OtherVideos') categoryNumber = 299;
    if (cat == 'Windows') categoryNumber = 301;
    if (cat == 'MacAppleApplications') categoryNumber = 302;
    if (cat == 'UNIX') categoryNumber =  303;
    if (cat == 'HandheldApplications') categoryNumber =  304;
    if (cat == 'IOSiPadiPhoneApplications') categoryNumber =  305;
    if (cat == 'AndroidApplications') categoryNumber =  306;
    if (cat == 'OtherOSApplication') categoryNumber = 399;
    if (cat == 'PC') categoryNumber =  401;
    if (cat == 'MacAppleGames') categoryNumber =  402;
    if (cat == 'PSx') categoryNumber =  403;
    if (cat == 'XBOX360') categoryNumber =  404;
    if (cat == 'Wii') categoryNumber =  405;
    if (cat == 'HandheldGames') categoryNumber =  406;
    if (cat == 'IOSiPadiPhoneGames') categoryNumber =  407;
    if (cat == 'AndroidGames') categoryNumber = 408;
    if (cat == 'OtherOSGames') categoryNumber =  499;
    if (cat == 'PornMovies') categoryNumber =  501;
    if (cat == 'PornMoviesDVDR') categoryNumber = 502;
    if (cat == 'PornPictures') categoryNumber =  503;
    if (cat == 'PornGames') categoryNumber =  504;
    if (cat == 'PornHDMovies') categoryNumber =  505;
    if (cat == 'PornMovieClips') categoryNumber =  506;
    if (cat == 'OtherPorn') categoryNumber =  599;
    if (cat == 'Ebooks') categoryNumber =  601;
    if (cat == 'Comics') categoryNumber = 602;
    if (cat == 'Pictures') categoryNumber = 603;
    if (cat == 'Covers') categoryNumber =  604;
    if (cat == 'Physibles') categoryNumber =  605;
    if (cat == 'Other') categoryNumber = 699;
    return categoryNumber;
}


function buildTrackersHtml() {
    let tr = '<dl><dt>' + 'udp://tracker.coppersurfer.tk:6969/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://tracker.openbittorrent.com:6969/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://9.rarbg.to:2710/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://9.rarbg.me:2780/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://9.rarbg.to:2730/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://tracker.opentrackr.org:1337' + '</dl></dt>';
    tr += '<dl><dt>' + 'http://p4p.arenabg.com:1337/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://tracker.torrent.eu.org:451/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://tracker.tiny-vps.com:6969/announce' + '</dl></dt>';
    tr += '<dl><dt>' + 'udp://open.stealth.si:80/announce' + '</dl></dt>';
    return tr;
}

function buildFileListHtml(json_obj) {    
    let elements = json_obj;
    let i = 0;
	var fileListHtml = '';
    for (element in elements) {
        if (i == 1) {
            fileListHtml = fileListHtml + '\n<li class="alt">';
            i = 0;
        } else {
            fileListHtml = fileListHtml + '\n<li>';
            i = 1;
        }
        fileListHtml = fileListHtml + '<span class="file-name">' + elements[element]['name'][0] + '</span><span class="file-size notranslate">' + print_size(elements[element]['size'][0], 0) + '</span></li>\n';
    }	
	return fileListHtml;
}





//Google translation functions
//translation language found
	if(siteLanguage.length != 0 && translationlanguages[siteLanguage] !== undefined){
		//console.log(languages[lang]);
		
		(function(){
			const google_translate_element_div = document.createElement('div');
			google_translate_element_div.setAttribute("id","google_translate_element");
			var body = document.querySelector('body');
			body.appendChild(google_translate_element_div);
		})();
		
		(function(){ 
			var google_translate_element_script = document.createElement('script');
			google_translate_element_script.type = 'text/javascript';
			google_translate_element_script.async = true;
			google_translate_element_script.src = (document.location.protocol == 'https:' ? 'https:' : 'http:') + '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
			var s = document.getElementsByTagName('script')[0];
			s.parentNode.insertBefore(google_translate_element_script, s);
		})();

		function googleTranslateElementInit() {
		   Promise.resolve(
				new google.translate.TranslateElement({
				  pageLanguage: 'en',
				  includedLanguages: siteLanguage,
				  //layout: google.translate.TranslateElement.InlineLayout.SIMPLE
				  layout: google.translate.TranslateElement.FloatPosition.TOP_LEFT
				}, 'google_translate_element')
			).then(
			   tryTranslation = setInterval(
			   //setTimeout(
				  function(){
						var select = document.getElementsByClassName('goog-te-combo')[0];
						//console.log(select.value);
						select.selectedIndex = 1;
						//console.log(select.value);
						if(select.value == siteLanguage){
							select.addEventListener('click', function () {
								//console.log('clicked');
								select.dispatchEvent(new Event('change'));
							});
							select.click();
							
							clearInterval(tryTranslation);
						}					
						
					}, 500)
			
			);
		}

	}

   //Google translation functions end

/////////////////
//util functions
////////////////
function getQueryStringValue (key) {  
	  return decodeURIComponent(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));  
	}

	
function print_size(size, f) {
    let e = '';
    if (f) {
        e = '&nbsp;(' + size + ' Bytes)';
    }
    if (size >= 1125899906842624) return round_to_precision(size / 1125899906842624, 0.01) + '&nbsp;PiB' + e;
    if (size >= 1099511627776) return round_to_precision(size / 1099511627776, 0.01) + '&nbsp;TiB' + e;
    if (size >= 1073741824) return round_to_precision(size / 1073741824, 0.01) + '&nbsp;GiB' + e;
    if (size >= 1048576) return round_to_precision(size / 1048576, 0.01) + '&nbsp;MiB' + e;
    if (size >= 1024) return round_to_precision(size / 1024, 0.01) + '&nbsp;KiB' + e;
    return size + '&nbsp;B';
}

function round_to_precision(x, precision) {
    let y = +x + (precision === undefined ? 0.5 : precision / 2);
    let sz = y - (y % (precision === undefined ? 1 : +precision)) + '';
    if (sz.indexOf('.') == -1) return sz;
    else return sz.substring(0, sz.indexOf('.') + 3);
}

function timeConverter(UNIX_timestamp, short=false){
  var a = new Date(UNIX_timestamp * 1000);
  var months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var months = ['01','02','03','04','05','06','07','08','09','10','11','12'];
  //var months = ['January','February','March','April','May','June','July','August','Septemebr','October','November','December'];
  var year = a.getFullYear();
  var month = months[a.getMonth()];
  var date = a.getDate();
  var hour = a.getHours();
  var min = a.getMinutes();
  var sec = a.getSeconds();
  //var time = date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec ;
  //return time;
  //var pulicationDate = month + ' ' + date + ', ' + year;  
  //return pulicationDate;
  if(short){
	return month + '/' + date + '/' + year.toString().substr(-2);  
  }
  //return month + '-' + date + '-' + year;
  return   year + '-' + month + '-' + date;
  
}

function slugify(text)
	{
	  return text.toString() //.toLowerCase()
		.replace(/\s+/g, '-')           // Replace spaces with -
		.replace(/[^\w\-]+/g, '-')       // Remove all non-word chars
		.replace(/\-\-+/g, '-')         // Replace multiple - with single -
		.replace(/^-+/, '')             // Trim - from start of text
		.replace(/-+$/, '');            // Trim - from end of text
	}
	
/*data extraction functions*/
//https://stackoverflow.com/questions/33430914/extract-keywords-from-string-javascript
function sdk_removeCommonWords(text){
    var $commonWords; 	
 	// EEEEEEK Stop words
	commonWords = ['a','able','about','above','abroad','according','accordingly','across','actually','adj','after','afterwards','again','against','ago','ahead','ain\'t','all','allow','allows','almost','alone','along','alongside','already','also','although','always','am','amid','amidst','among','amongst','an','and','another','any','anybody','anyhow','anyone','anything','anyway','anyways','anywhere','apart','appear','appreciate','appropriate','are','aren\'t','around','as','a\'s','aside','ask','asking','associated','at','available','away','awfully','b','back','backward','backwards','be','became','because','become','becomes','becoming','been','before','beforehand','begin','behind','being','believe','below','beside','besides','best','better','between','beyond','both','brief','but','by','c','came','can','cannot','cant','can\'t','caption','cause','causes','certain','certainly','changes','clearly','c\'mon','co','co.','com','come','comes','concerning','consequently','consider','considering','contain','containing','contains','corresponding','could','couldn\'t','course','c\'s','currently','d','dare','daren\'t','definitely','described','despite','did','didn\'t','different','directly','do','does','doesn\'t','doing','done','don\'t','down','downwards','during','e','each','edu','eg','eight','eighty','either','else','elsewhere','end','ending','enough','entirely','especially','et','etc','even','ever','evermore','every','everybody','everyone','everything','everywhere','ex','exactly','example','except','f','fairly','far','farther','few','fewer','fifth','first','five','followed','following','follows','for','forever','former','formerly','forth','forward','found','four','from','further','furthermore','g','get','gets','getting','given','gives','go','goes','going','gone','got','gotten','greetings','h','had','hadn\'t','half','happens','hardly','has','hasn\'t','have','haven\'t','having','he','he\'d','he\'ll','hello','help','hence','her','here','hereafter','hereby','herein','here\'s','hereupon','hers','herself','he\'s','hi','him','himself','his','hither','hopefully','how','howbeit','however','hundred','i','i\'d','ie','if','ignored','i\'ll','i\'m','immediate','in','inasmuch','inc','inc.','indeed','indicate','indicated','indicates','inner','inside','insofar','instead','into','inward','is','isn\'t','it','it\'d','it\'ll','its','it\'s','itself','i\'ve','j','just','k','keep','keeps','kept','know','known','knows','l','last','lately','later','latter','latterly','least','less','lest','let','let\'s','like','liked','likely','likewise','little','look','looking','looks','low','lower','ltd','m','made','mainly','make','makes','many','may','maybe','mayn\'t','me','mean','meantime','meanwhile','merely','might','mightn\'t','mine','minus','miss','more','moreover','most','mostly','mr','mrs','much','must','mustn\'t','my','myself','n','name','namely','nd','near','nearly','necessary','need','needn\'t','needs','neither','never','neverf','neverless','nevertheless','new','next','nine','ninety','no','nobody','non','none','nonetheless','noone','no-one','nor','normally','not','nothing','notwithstanding','novel','now','nowhere','o','obviously','of','off','often','oh','ok','okay','old','on','once','one','ones','one\'s','only','onto','opposite','or','other','others','otherwise','ought','oughtn\'t','our','ours','ourselves','out','outside','over','overall','own','p','particular','particularly','past','per','perhaps','placed','please','plus','possible','presumably','probably','provided','provides','q','que','quite','qv','r','rather','rd','re','really','reasonably','recent','recently','regarding','regardless','regards','relatively','respectively','right','round','s','said','same','saw','say','saying','says','second','secondly','see','seeing','seem','seemed','seeming','seems','seen','self','selves','sensible','sent','serious','seriously','seven','several','shall','shan\'t','she','she\'d','she\'ll','she\'s','should','shouldn\'t','since','six','so','some','somebody','someday','somehow','someone','something','sometime','sometimes','somewhat','somewhere','soon','sorry','specified','specify','specifying','still','sub','such','sup','sure','t','take','taken','taking','tell','tends','th','than','thank','thanks','thanx','that','that\'ll','thats','that\'s','that\'ve','the','their','theirs','them','themselves','then','thence','there','thereafter','thereby','there\'d','therefore','therein','there\'ll','there\'re','theres','there\'s','thereupon','there\'ve','these','they','they\'d','they\'ll','they\'re','they\'ve','thing','things','think','third','thirty','this','thorough','thoroughly','those','though','three','through','throughout','thru','thus','till','to','together','too','took','toward','towards','tried','tries','truly','try','trying','t\'s','twice','two','u','un','under','underneath','undoing','unfortunately','unless','unlike','unlikely','until','unto','up','upon','upwards','us','use','used','useful','uses','using','usually','v','value','various','versus','very','via','viz','vs','w','want','wants','was','wasn\'t','way','we','we\'d','welcome','well','we\'ll','went','were','we\'re','weren\'t','we\'ve','what','whatever','what\'ll','what\'s','what\'ve','when','whence','whenever','where','whereafter','whereas','whereby','wherein','where\'s','whereupon','wherever','whether','which','whichever','while','whilst','whither','who','who\'d','whoever','whole','who\'ll','whom','whomever','who\'s','whose','why','will','willing','wish','with','within','without','wonder','won\'t','would','wouldn\'t','x','y','yes','yet','you','you\'d','you\'ll','your','you\'re','yours','yourself','yourselves','you\'ve','z','zero'];
    
	text = slugify(text);	
    
	
	var result = text.replaceAll('-', ' ');
	result = result.replace(/\b\d{2}\b/g, ''); //removing two digit numeric values
	result = result.replace(/\s+/g, " ");      //remove extra spaces
	result = result.split(' ');

	// remove $commonWords
	result = result.filter(function (word) {
		return commonWords.indexOf(word) === -1;
	});

	// Unique words
	result = sdk_array_unique(result);
	
	//result = result.join(' ');
	return result;	
}

//https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function sdk_onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function sdk_array_unique(array){
   var unique = array.filter(sdk_onlyUnique);
   return unique;
}
/*data extraction functions*/

/*tinysort lib*/
//https://tinysort.sjeiti.com/
'use strict';
(function(a, b) {
    'function' == typeof define && define.amd ? define('tinysort', function() {
        return b
    }) : a.tinysort = b
})(window || module || {}, function(a) {
    function c(a, b) {
        for (var c = a.length, d = c, e = void 0; d--;) e = c - d - 1, b(a[e], e)
    }

    function b(a, b, c) {
        for (var d in b)(c || a[d] === e) && (a[d] = b[d]);
        return a
    }

    function d(a, b, c) {
        l.push({
            prepare: a,
            sort: b,
            sortBy: c
        })
    }
    var e = a,
        f = null,
        g = window,
        h = g.document,
        i = parseFloat,
        j = /(-?\d+\.?\d*)\s*$/g,
        k = /(\d+\.?\d*)\s*$/g,
        l = [],
        m = {
            selector: f,
            order: 'asc',
            attr: f,
            data: f,
            useVal: !1,
            place: 'org',
            returns: !1,
            cases: !1,
            natural: !1,
            forceStrings: !1,
            ignoreDashes: !1,
            sortFunction: f,
            useFlex: !1,
            emptyEnd: !1,
            console: console
        },
        n = 0,
        o = 0;
    return g.Element && function(a) {
        return a.matches = a.matches || a.msMatchesSelector
    }(Element.prototype), b(d, {
        loop: c
    }), b(function(a, d) {
        function g(a) {
            var c = !!a.selector,
                d = c && ':' === a.selector[0],
                e = b(a || {}, m);
            G.push(b({
                hasSelector: c,
                hasAttr: e.attr !== f && '' !== e.attr,
                hasData: e.data !== f,
                hasFilter: d,
                sortReturnNumber: 'asc' === e.order ? 1 : -1
            }, e))
        }

        function p() {
            c(a, function(a, b) {
                H ? H !== a.parentNode && (I = !1) : H = a.parentNode;
                var c = G[0],
                    d = c.hasFilter,
                    e = c.selector,
                    f = !e || d && a.matches(e) || e && a.querySelector(e),
                    g = f ? D : E,
                    h = {
                        elm: a,
                        pos: b,
                        posn: g.length
                    };
                C.push(h), g.push(h)
            }), F.splice.apply(F, [0, Number.MAX_SAFE_INTEGER].concat(D))
        }

        function q(e, a, b) {
            for (var f = b(e.toString()), g = b(a.toString()), h = 0; f[h] && g[h]; h++)
                if (f[h] !== g[h]) {
                    var i = +f[h],
                        c = +g[h];
                    return i == f[h] && c == g[h] ? i - c : f[h] > g[h] ? 1 : -1
                } return f.length - g.length
        }

        function r(a) {
            for (var b, c = [], d = 0, e = -1, f = 0, g = void 0, h = void 0; g = (h = a.charAt(d++)).charCodeAt(0);) b = 46 === g || 48 <= g && 57 >= g, b !== f && (c[++e] = '', f = b), c[e] += h;
            return c
        }

        function s(d, a) {
            var b = 0;
            0 !== o && (o = 0);
            for (var f = function() {
                    var f = G[o],
                        g = f.ignoreDashes ? k : j;
                    c(l, function(a) {
                        return a.prepare && a.prepare(f)
                    });
                    var h = !1,
                        m = x(d, f),
                        n = x(a, f);
                    if (f.sortFunction) b = f.sortFunction(d, a);
                    else if ('rand' === f.order) b = .5 > Math.random() ? 1 : -1;
                    else {
                        var p = '' === m || m === e,
                            s = '' === n || n === e;
                        if (m === n) b = 0;
                        else if (f.emptyEnd && (p || s)) b = p && s ? 0 : p ? 1 : -1;
                        else {
                            if (!f.forceStrings) {
                                var t = !!y(m) && m && m.match(g),
                                    u = !!y(n) && n && n.match(g);
                                if (t && u) {
                                    var v = m.substr(0, m.length - t[0].length),
                                        w = n.substr(0, n.length - u[0].length);
                                    v == w && (h = !0, m = i(t[0]), n = i(u[0]))
                                }
                            }
                            b = m === e || n === e ? 0 : f.natural && (isNaN(m) || isNaN(n)) ? q(m, n, r) : m < n ? -1 : m > n ? 1 : 0
                        }
                    }
                    c(l, function(a) {
                        var c = a.sort;
                        return c && (b = c(f, h, m, n, b))
                    }), b *= f.sortReturnNumber, 0 === b && o++
                }; 0 === b && o < n;) f();
            return 0 === b && (b = d.pos > a.pos ? 1 : -1), b
        }

        function t() {
            var a = D.length === C.length,
                b = G[0],
                c = b.place,
                d = b.console;
            if (I && a) L ? D.forEach(function(a, b) {
                return a.elm.style.order = b
            }) : H ? H.appendChild(u()) : d && d.warn && d.warn('parentNode has been removed');
            else {
                var e = 'start' === c,
                    f = 'end' === c,
                    g = 'first' === c;
                if ('org' === c) D.forEach(v), D.forEach(function(a, b) {
                    return w(F[b], a.elm)
                });
                else if (e || f) {
                    var h = F[e ? 0 : F.length - 1],
                        i = h && h.elm.parentNode,
                        j = i && (e && i.firstChild || i.lastChild);
                    j && (j !== h.elm && (h = {
                        elm: j
                    }), v(h), f && i.appendChild(h.ghost), w(h, u()))
                } else if (g || 'last' === c) {
                    var k = F[g ? 0 : F.length - 1];
                    w(v(k), u())
                }
            }
        }

        function u() {
            return D.forEach(function(a) {
                return B.appendChild(a.elm)
            }), B
        }

        function v(a) {
            var b = a.elm,
                c = h.createElement('div');
            return a.ghost = c, b.parentNode.insertBefore(c, b), a
        }

        function w(a, b) {
            var c = a.ghost,
                d = c.parentNode;
            d.insertBefore(b, c), d.removeChild(c), delete a.ghost
        }

        function x(a, b) {
            var c, d = a.elm,
                e = b.selector;
            return e && (b.hasFilter ? !d.matches(e) && (d = f) : d = d.querySelector(e)), b.hasAttr ? c = d.getAttribute(b.attr) : b.useVal ? c = d.value || d.getAttribute('value') : b.hasData ? c = d.getAttribute('data-' + b.data) : d && (c = d.textContent), y(c) && (!b.cases && (c = c.toLowerCase()), c = c.replace(/\s+/g, ' ')), null === c && (c = '\u0FFF'), c
        }

        function y(a) {
            return 'string' == typeof a
        }
        y(a) && (a = h.querySelectorAll(a));
        var z = Object.assign({}, m, d || {}),
            A = z.console;
        0 === a.length && A && A.warn && A.warn('No elements to sort');
        var B = h.createDocumentFragment(),
            C = [],
            D = [],
            E = [],
            F = [],
            G = [],
            H = void 0,
            I = !0,
            J = a.length && a[0].parentNode,
            K = J.rootNode !== document,
            L = a.length && (d === e || !1 !== d.useFlex) && !K && -1 !== getComputedStyle(J, null).display.indexOf('flex');
        return function() {
            0 === arguments.length ? g({}) : c(arguments, function(a) {
                return g(y(a) ? {
                    selector: a
                } : a)
            }), n = G.length
        }.apply(f, Array.prototype.slice.call(arguments, 1)), p(), D.sort(d && d.sortFunction || s), t(), D.map(function(a) {
            return a.elm
        })
    }, {
        plugin: d,
        defaults: m
    })
}());

//insert addthis widget

(function(){
	if (location.hostname === "localhost" || location.hostname === "127.0.0.1"){ 
	  //Do something
	}
	else{
		var s = document.createElement("script");
		s.type = "text/javascript";
		s.async = 'async';
		s.src = "//s7.addthis.com/js/300/addthis_widget.js#pubid=ra-623ebd8e9d200efd&async=1";
		document.getElementsByTagName("head")[0].appendChild(s);
	}
})();
