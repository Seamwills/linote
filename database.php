<?php
class Database {
    private $sql;
    private $mysqli;

    public function init() {
        $this->mysqli = new mysqli("localhost", "root", "", "linote");
        mysqli_query($this->mysqli, "SET NAMES 'utf8'");
        if (mysqli_connect_errno()) {
            printf("Connect failed: %s\n", mysqli_connect_error());
            exit();
        }
    }
    public function get($sql) {
        $this->init();
        $return = Array();
        if ($result = $this->mysqli->query($sql)) {
            while ($arr = $result->fetch_assoc()) {
                array_push($return, $arr);
            }
            return $return;
        }
        return null;
    }
    public function set($sql) {
        $this->init();
        if ($result = $this->mysqli->query($sql)) {
            return $this->mysqli->insert_id;
        }
        throw new Exception("Error set query");
    }
}
