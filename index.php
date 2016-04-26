<?php
session_start();
require_once('inc.php');

if (isset($_REQUEST['logout'])) {
    $_SESSION = array();
    session_destroy();
}
if (!isset($_SESSION['id'])) {
    echo "<script>location.assign('login.php');</script>";
    return false;
} else {
    $userid = $_SESSION['id'];
    $users = new Users();
    $user = $users->getUserInfo($userid);
    $username = $user['username'];
    $email = $user['email'];
}
$notes = new Notes();
$div = $notes->fmtNotes( $notes->getNotes($userid) );
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" 
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"> 
<html> 
<head> 
<title>Linote</title> 
<meta http-equiv="content-type" content="text/html; charset=utf-8"> 
<link rel="stylesheet" type="text/css" href="stylesheets/screen.css" />
<body>

<div class="container">
    <div id="sideslip">
        <div class="head">
            <div><span class="icon"><a id="icon-back" title="返回">返回</a></span></div>
            <ul>
                <li><span id="settings" class="menu" href="#">设置</span></li>
                <li><span id="export" class="menu" href="#">导出</span></li>
                <li><span id="trash" class="menu" href="#">回收站</span></li>
            </ul>
        </div>
        <div class="body">
            <div class="settings">设置</div>
            <div class="export">导出</div>
            <div class="trash">
                <div id="trashlist">
                    <ul>
                    </ul>
                </div>
                <div id="shortcut">
                    <ul>
                        <li id="restoreAll">全部还原</li>
                        <li id="emptyTrash">清空回收站</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>

    <div id="menubar">
        <div class="top">
            <div class="left">
                <ul>
                    <li><span class="icon"><a id="icon-menu" title="菜单" href="#">Side Menu</a></span></li>
                    <li><span class="icon last"><a id="icon-add" title="添加笔记" href="#">Add Note</a></span></li>
                </ul>
            </div>

            <div class="right">
                <ul>
                    <li><span class="icon"><a id="icon-delete" title="删除笔记" href="#">Delete Note</a></span></li>
                    <li><span class="icon"><a id="icon-info" title="笔记信息" href="#">Note Info</a></span></li>
                    <li><span class="last"><a id="icon-user" href="#"><?php echo $email .'(' .$username .')'; ?></a></span></li>
                </ul>
            </div>
        </div>

        <div class="bottom">
            <div class="left">
                <ul>
                    <li><input class="searchbox" type="text"></li>
                    <li><a id="icon-tag" href="#">标签</a></li>
                </ul>
                <div class="taglist">
                    <?php echo $notes->getTaglist($userid); ?>
                </div>
            </div>

            <div class="right">
                <ul id="tag-line">
                    <li><input type="text" placeholder="添加标签..."></li>
                </ul>
            </div>
        </div>
    </div>

    <div id="notelist">
        <?php echo $div; ?>
    </div>

    <div id="notebody">
        <textarea></textarea>
    </div>
</div>

<script src="javascript/jquery-1.12.2.min.js"></script>
<script src="javascript/linote.js"></script>
</body>
</html>
