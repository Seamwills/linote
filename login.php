<?php
session_start();
require_once('inc.php');
if (isset($_REQUEST['username']) && isset($_REQUEST['password'])) {
    $username = $_REQUEST['username'];
    $password = $_REQUEST['password'];
    $users = new Users();
    $user = $users->auth($username, $password);

    if ($user != null) {
        $_SESSION['id'] = $user['id'];
        echo "<script>location.assign('index.php');</script>";
        return false;
    }
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> 
<html> 
<head> 
<title>Linote - 用户登陆</title> 
<meta http-equiv="content-type" content="text/html; charset=utf-8"> 
<link rel="stylesheet" type="text/css" href="stylesheets/screen.css" /> 
</head> 
<body>
<div class="login">
    <form method="post" action="login.php">
        <h3>用户登陆</h3>
        <fieldset>
            <label for="username">用户名</label>
            <input type="text" class="text" name="username" id="username">
            <label for="password">密码</label>
            <input type="password" class="text" name="password" id="password">
        </fieldset>

        <input type="submit" class="submit" name="submit" value="登陆">
    </form>
    <div class="utils">
        <ul>
            <li><a href="register.php">用户注册</a></li>
            <li><a href="reset.php">找回密码</a></li>
        </ul>
    </div>
</div>
<script src="javascript/jquery-1.12.2.min.js"></script>
<script src="javascript/validate.js"></script>
</body>
</html>
