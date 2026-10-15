CREATE DATABASE IF NOT EXISTS lab5;

CREATE USER IF NOT EXISTS 'lab5_writer'@'%' IDENTIFIED BY 'change_me_writer';
GRANT CREATE, INSERT ON lab5.* TO 'lab5_writer'@'%';

CREATE USER IF NOT EXISTS 'lab5_reader'@'%' IDENTIFIED BY 'change_me_reader';
GRANT SELECT ON lab5.* TO 'lab5_reader'@'%';

FLUSH PRIVILEGES;
