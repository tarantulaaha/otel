<?php
	/**
	 * Created by PhpStorm.
	 * User: tarantul
	 * Date: 03.11.18
	 * Time: 17:55
	 */
	ini_set('error_reporting', E_ALL);
	ini_set('display_errors', 1);
	ini_set('display_startup_errors', 1);
	if(!file_exists('ip')){
		file_put_contents('ip', 'localhost??????');
	}
	$ip=file_get_contents('ip');
	if(isset($_REQUEST['weber']['cmd'])){
		$cmd=$_REQUEST['weber']['cmd'];
		if($cmd=='update_ip'){
			if($_REQUEST['weber']['ip']){
				$ip=$_REQUEST['weber']['ip'];
				file_put_contents('ip', $ip);
			}
		}
	}else{
		header("HTTP/1.1 301 Moved Permanently");
		header("Location: http://".$ip);
		exit();
	}