<?php

$useragent = $_SERVER['HTTP_USER_AGENT'];

$ch = curl_init();

 /**
 * Set the URL of the page or file to download.
 */
//curl_setopt($ch, CURLOPT_USERAGENT, $useragent);
curl_setopt($ch, CURLOPT_URL, 'http://www.nytimes.com/pages/national/index.html');


 /**
 * Ask cURL to return the contents in a variable instead of simply echoing them to  the browser.
 */
 curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

 /**
 * Execute the cURL session
 */
 $contents = curl_exec($ch);

 /**
 * Close cURL session
 */
 curl_close ($ch);

$headClosePos = stripos($contents, "</head>");
$styleInsert = "<link rel=\"stylesheet\" href=\"style.css\" type=\"text/css\" media=\"screen\" />";
$contents = substr_replace($contents, $styleInsert, $headClosePos, 0);

$bodyClosePos = stripos($contents, "</body>");
$scriptInsert = "<script type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js\"></script><script type=\"text/javascript\" src=\"https://ajax.googleapis.com/ajax/libs/jqueryui/1.8.16/jquery-ui.min.js\"></script><script type=\"text/javascript\">jQSegment = $.noConflict(true);</script><script type=\"text/javascript\" src=\"rearrange.js\"></script>";

$contents = substr_replace($contents, $scriptInsert, $bodyClosePos, 0);

echo $contents;

?>