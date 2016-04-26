<?php
session_start();
require_once('inc.php');
if (isset($_REQUEST['type'])) {
    $type = $_REQUEST['type'];
    if ($type == 'register') {
        $username = $_REQUEST['username'];
        $password = $_REQUEST['password'];
        $email = $_REQUEST['email'];

        $users = new Users();
        $id = $users->register($username, $password, $email);

        if ($id != null) {
            $_SESSION['id'] = $id;
            echo "注册成功!";
            echo "<script>location.assign('index.php');</script>";
            return false;
        } else {
            echo "注册失败!";
        }
    }
}
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> 
<html> 
<head> 
<title>Linote - 用户注册</title> 
<meta http-equiv="content-type" content="text/html; charset=utf-8"> 
<link rel="stylesheet" type="text/css" href="stylesheets/screen.css" /> 
</head> 
<body>
<div class="register">
    <form method="post" action="register.php">
        <h3>用户注册</h3>
        <fieldset>
            <label for="username">用户名</label>
            <input type="text" class="text" id="username" name="username">
            <label for="password">密码</label>
            <input type="password" class="text" id="password" name="password">
            <label for="confirm">确认密码</label>
            <input type="password" class="text" id="confirm" name="password">
        </fieldset>
        <fieldset>
            <label for="email">邮箱</label>
            <input type="text" class="text" id="email" name="email">
            <input style="display: none" type="text" class="text" name="type" value="register">
        </fieldset>

        <input type="submit" class="submit" value="注册">
    </form>
    <div class="utils">
        <ul>
            <li><a href="login.php">直接登陆</a></li>
            <li><a href="reset.php">找回密码</a></li>
        </ul>
    </div>
</div>
<script src="javascript/jquery-1.12.2.min.js"></script>
<script src="javascript/validate.js"></script>
</body>
</html>
