<?php
require_once('inc.php');
class Notes {
    public function getNotes($userid, $ids=[], $mask=0) {
        $notes = array();
        $db = new Database();

        $sql = "SELECT * FROM notes WHERE userid = $userid AND mask = $mask ORDER BY time DESC";
        if ( !empty($ids) ) {
            $sql = "SELECT * FROM notes WHERE userid = $userid AND mask = $mask AND id IN (" .implode(",", $ids). ") ORDER BY time DESC";
        }

        $notes = $db->get($sql);
        return $notes;
    }

    public function getNote($userid, $id, $mask=0) {
        $db = new Database();

        $sql = "SELECT * FROM notes WHERE userid = $userid AND id = {$id} AND mask = $mask";
        $note = $db->get($sql);
        return $note[0];
    }

    public function saveNote($userid, $note) {
        $db = new Database();

        $sql = "INSERT INTO notes (userid, time, tag, title, text) VALUES ($userid, {$note->time}, \"{$note->tag}\",
            \"{$note->title}\", \"{$note->text}\")";

        if ( !empty($note->id) ) {
            $sql = "UPDATE notes SET id = {$note->id}, tag = \"{$note->tag}\", title = \"{$note->title}\",
                text = \"{$note->text}\" WHERE userid = $userid AND id = {$note->id}";
        }
        echo $id = $db->set($sql);
    }

    public function deleteNotes($userid, $ids) {
        $db = new Database();
        $sql = "UPDATE notes set mask = TRUE WHERE userid = $userid AND id in ($ids)";

        $db->set($sql);
    }

    public function getNotesFromTag($userid, $tag, $mask=0) {
        $db = new Database();
        $ids = Array();

        $sql = "SELECT id FROM notes WHERE userid = $userid AND tag REGEXP '[[:<:]]{$tag}[[:>:]]' AND mask = $mask";
        $result = $db->get($sql);
        if ($result != null) {
            while (($node = array_shift($result)) != null) {
                array_push($ids, $node['id']);
            }
        }
        $notes = $this->getNotes($userid, $ids);
        return $notes;
    }

    public function getNotesFromTrash($userid) {
        return $this->getNotes($userid, '', 1);
    }

    public function getTagList($userid, $mask=0) {
        $notes = Array();
        $taglist = Array();
        $db = new Database();

        $sql = "SELECT tag FROM notes WHERE userid = $userid AND mask = $mask ORDER BY time DESC";
        if ( !empty($ids) ) {
            $sql = "SELECT * FROM notes WHERE userid = $userid AND mask = $mask AND id IN (" .implode(",", $ids). ")";
        }

        $notes = $db->get($sql);
        $cnt = count($notes);
        $div = "<li class='head'><span class='tagname'>全部</span><span class='tagnum'>{$cnt}</span></li>";
        if ($notes != null) {
            while ( $note = array_shift($notes) ) {
                $tags = explode(' ', $note['tag']);
                foreach ($tags as $tag) {
                    if ($tag == '') {
                        continue;
                    }
                    $found = false;
                    foreach($taglist as &$arr) {
                        if ($arr['tag'] == $tag) {
                            $arr['num']++;
                            $found = true;
                            break;
                        }
                    }
                    if (!$found) {
                        array_push($taglist, ['tag'=> $tag, 'num' => 1]);
                    }
                }
            }
            usort($taglist, "tagCompare");

            if ($taglist != null) {
                while ($tag = array_shift($taglist)) {
                    $tagname = $tag['tag'];
                    $tagnum = $tag['num'];

                    $div .= "<li><span class='tagname'>{$tagname}</span><span class='tagnum'>{$tagnum}</span></li>";
                }

            }
        }
        return "<ul>" .$div. "</ul>";
    }

    public function searchNotes($userid, $keyword, $mask=0) {
        $notes = Array();
        $db = new Database();

        $sql = "SELECT *, 1 AS t FROM notes WHERE userid = $userid AND mask = $mask AND title LIKE '%$keyword%' UNION SELECT *, 0 AS t FROM notes WHERE userid = $userid AND mask = $mask AND text LIKE '%$keyword%' AND title NOT LIKE '%$keyword%' ORDER BY t DESC, time DESC";
        $notes = $db->get($sql);
        return $notes;
    }
    public function permanentDelete($userid, $ids) {
        $db = new Database();
        $sql = "DELETE from notes WHERE userid = $userid AND id in ($ids)";

        $db->set($sql);
    }
    public function restoreNotes($userid, $ids) {
        $db = new Database();
        $sql = "UPDATE notes set mask = FALSE WHERE userid = $userid AND id in ($ids)";

        $db->set($sql);
    }
    public function exportNotes($userid) {
        $notes = $this->getNotes($userid);
        $contents = '';
        $separater = "------------------------------------------------------";
        if ($notes != null) {
            while ($note = array_shift($notes)) {
                $contents .= "{$note['title']}\n{$note['text']}\n\n$separater\n\n";
            }
        }
        $tmpfile = tempnam("/tmp", "linote.txt");

        $handle = fopen($tmpfile, "w");
        fwrite($handle, $contents);
        fclose($handle);

        if (file_exists($tmpfile)) {
            header('Content-Description: File Transfer');
            header('Content-Type: application/octet-stream');
            header('Content-Disposition: attachment; filename="linote.txt"');
            header('Expires: 0');
            header('Cache-Control: must-revalidate');
            header('Pragma: public');
            header('Content-Length: ' . filesize($tmpfile));
            readfile($tmpfile);
            exit;
        }
        unlink($tmpfile);
    }
    public function fmtNotes($notes) {
        $div = "";
        if ($notes != null) {
            while ($note = array_shift($notes)) {
                $title = mb_substr($note['title'], 0, 120, "UTF-8");
                $text = explode("\n", trim($note['text']))[0];
                $time = $note['time'];
                $id = $note['id'];

                $div .= "<li id='{$id}'><div class='note'>
                    <p class='title'>{$title}</p>
                    <p class='text'>{$text}</p>
                    <p class='time'>{$time}</p>
                    </div></li>";
            }

        }
        return "<ul>" .$div. "</ul>";
    }
}
function tagCompare ($a, $b) {
    return $b['num'] - $a['num'];
}
