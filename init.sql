DROP TABLE IF EXISTS `notes`;

CREATE TABLE `notes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userid` INTEGER NOT NULL,
    -- Create time stamp
    `time` INTEGER UNSIGNED NOT NULL,
    -- Space seperated tags
    `tag` VARCHAR(120),
    -- No more than 200 Chinese characters
    `title` VARCHAR(200),
    -- No more than 65535 characters, about 20000 Chinese characters
    `text` TEXT,
    -- TRUE means in trash
    `mask` BOOL DEFAULT FALSE,
    PRIMARY KEY (id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;

DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(20) NOT NULL,
    `password` VARCHAR(40) NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    PRIMARY KEY (id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8;
