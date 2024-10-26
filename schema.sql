
-- SQL Schema for Engineering Company
CREATE DATABASE spares_purchase;

USE spares_purchase;

-- Create tables
CREATE TABLE company (
    company_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(100) NOT NULL,
    company_address VARCHAR(300),
    postal_code VARCHAR(20),
    office_number VARCHAR(30)
);

CREATE TABLE customer (
    customer_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR (255) NOT NULL,
    last_name VARCHAR (255) NOT NULL,
    email VARCHAR (200),
    contact_number VARCHAR (30),
    company_id INT UNSIGNED,
    FOREIGN KEY (company_id) REFERENCES company(company_id)
);

CREATE TABLE inventory (
    product_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_name VARCHAR (45) NOT NULL,
    instock INT UNSIGNED,
    product_weight DECIMAL (5,2),
    product_size VARCHAR (45)
);

CREATE TABLE quotation (
    quote_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    quoted_date DATE,
    validity_date DATE,
    quoted_amount DECIMAL(10,2),
    quoted_quantity INT UNSIGNED,
    customer_id INT UNSIGNED,
    product_id INT UNSIGNED,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id),
    FOREIGN KEY (product_id) REFERENCES inventory(product_id)
);

CREATE TABLE confirmed_orders (
    order_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    fulfillment_date DATE,
    ordered_amount DECIMAL (10,2),
    quote_id INT UNSIGNED,
    required_date DATE,
    delivery_mode VARCHAR(45),
    FOREIGN KEY (quote_id) REFERENCES quotation(quote_id)
);

CREATE TABLE ordered_list (
    ordered_list_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ordered_quantity INT UNSIGNED,
    unit_price DECIMAL (10,2),
    order_id INT UNSIGNED,
    product_id INT UNSIGNED,
    FOREIGN KEY (order_id) REFERENCES confirmed_orders(order_id),
    FOREIGN KEY (product_id) REFERENCES inventory(product_id)
);

