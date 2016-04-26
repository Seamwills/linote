<?php
session_start();
require_once('database.php');
require_once('notes.php');
$n = new Notes();
$type = $_REQUEST['type'];
if (isset($_SESSION['id'])) {
    $userid = $_SESSION['id'];
}

switch ($type) {
case 'getNote':
    $id = $_REQUEST['value'];
    $note = $n->getNote($userid, $id);
    $note['title'] = htmlspecialchars_decode($note['title'], ENT_QUOTES);
    $note['tag'] = htmlspecialchars_decode($note['tag'], ENT_QUOTES);
    $note['text'] = htmlspecialchars_decode($note['text'], ENT_QUOTES);
    echo json_encode($note);
    break;
case 'getNotes':
    $key = $_REQUEST['key'];
    $value = htmlspecialchars($_REQUEST['value'], ENT_QUOTES);

    switch ($key) {
    case 'tag':
        $notes = $n->fmtNotes($n->getNotesFromTag($userid, $value));
        break;
    case 'keyword':
        $notes = $n->fmtNotes($n->searchNotes($userid, $value));
        break;
    case 'trash':
        $notes = $n->fmtNotes($n->getNotesFromTrash($userid));
        break;
    default:
        $notes = $n->fmtNotes($n->getNotes($userid));
    }
    echo $notes;
    break;
case 'saveNote':
    $note = json_decode($_REQUEST['note']);
    $note->title = addslashes(htmlspecialchars($note->title, ENT_QUOTES));
    $note->tag = addslashes(htmlspecialchars($note->tag, ENT_QUOTES));
    $note->text = addslashes(htmlspecialchars($note->text, ENT_QUOTES));
    $id = $n->saveNote($userid, $note);
    echo $id;
    break;
case 'deleteNotes':
    $ids = $_REQUEST['value'];
    $n->deleteNotes($userid, $ids);
    break;
case 'permanentDelete':
    $ids = $_REQUEST['value'];
    $n->permanentDelete($userid, $ids);
    break;
case 'restoreNotes':
    $ids = $_REQUEST['value'];
    $n->restoreNotes($userid, $ids);
    break;
case 'getTaglist':
    $taglist = $n->getTagList($userid);
    echo $taglist;
    break;
case 'queryUser':
    $username = $_REQUEST['value'];
    $users = new Users();
    $user = $users->queryUser($username);
    if ($user != null) {
        echo $user['username'];
    }
    break;
case 'login':
    $users = new Users();
    $user = json_decode($_REQUEST['user']);
    $user = $users->auth($user->username, $user->password);
    if ($user != null) {
        echo 1;
    } else {
        echo 0;
    }
    break;
case 'export':
    $n->exportNotes($userid);
    break;
}
?>
