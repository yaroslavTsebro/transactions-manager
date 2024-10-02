DROP DATABASE IF EXISTS TransactionsManager;
DROP USER IF EXISTS serverUser;
CREATE USER serverUser WITH PASSWORD 'somepass';
CREATE DATABASE TransactionsManager OWNER serverUser;