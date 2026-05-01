-- Create database
CREATE DATABASE IF NOT EXISTS grocery_inventory;

-- Select database
USE grocery_inventory;

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  price DECIMAL(10, 2) NOT NULL DEFAULT 0.00
);
