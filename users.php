<?php
require_once('inc.php');
class Users {
    public function auth($username, $password) {
        $db = new Database();
        $password = sha1($password);
        $sql = "SELECT * FROM users WHERE username = '$username' AND password = '$password'";

        $users = $db->get($sql);
        return $users[0];
    }
    public function register($username, $password, $email) {
        $db = new Database();
        $password = sha1($password);
        $sql = "INSERT INTO users (username, password, email) VALUES ('$username', '$password',
            '$email')";

        $id = $db->set($sql);
        return $id;
    }
    public function getUserInfo($id) {
        $db = new Database();
        $sql = "SELECT * FROM users WHERE id = $id";

        $users = $db->get($sql);
        return $users[0];
    }
    public function queryUser($username) {
        $db = new Database();
        $sql = "SELECT * FROM users WHERE username = '$username'";

        $users = $db->get($sql);
        return $users[0];
    }
}
