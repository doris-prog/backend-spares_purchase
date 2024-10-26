USE spares_purchase;

INSERT INTO company (company_id, company_name, company_address, postal_code, office_number)
VALUES 
(1001, 'Olson Pte Ltd', '328 North Bridge Rd #03-09 Raffles Shopping Arcade', '188719', '+65 6747 6002'),
(1002, 'Howe and Sons Pte Ltd', '21 Senoko South Road Woodlands East', '758079', '+65 6454 5277'),
(1003, 'Dickinson Pte Ltd', '11 Biopolis Way #01-09', '138667', '+65 6338 8954'),
(1004, 'Skiles Pte Ltd', 'Millenia Walk 9 Raffles Boulevard #02-00', '039596', '+65 8365 0238'),
(1005, 'Roob and Sons Pte Ltd', '111 North Bridge Road Peninsula Plaza', '179098', '+65 6836 7000'),
(1006, 'Powlowski Pte Ltd', '8 Boon Lay Way #03-08 8 @ Tradehub 21', '609964', '+65 6336 6152');

INSERT INTO customer (customer_id, first_name, last_name, email, contact_number, company_id)
VALUES 
(2001, 'John', 'Doe', 'johndoe@olson.com', '+65 8365 0238', 1001),
(2002, 'Sarah', 'Lee', 'sarahlee@howeandsons.com', '+65 9162 1145', 1002),
(2003, 'David', 'Kim', 'davidkim@olson.com', '+65 8763 4648', 1001),
(2004, 'Emily', 'Chen', 'emilychen@skiles.com', '+65 8334 5811', 1003),
(2005, 'Daniel', 'Park', 'danielpark@howeandsons.com', '+65 8899 9802', 1002),
(2006, 'Olivia', 'Lee', 'olivialee@powlowski.com', '+65 8823 3412', 1004);

INSERT INTO inventory (product_id, product_name, instock, product_weight, product_size)
VALUES 
(5001, 'Product A', 10, 1.0, '35.6 x 24.8 x 2.2'),
(5002, 'Product B', 50, 0.2, '15.5 x 7.5 x 0.8'),
(5003, 'Product C', 10, 1.5, '37.0 x 30.0 x 3.0'),
(5004, 'Product D', 20, 2.5, '120.0 x 80.0 x 30.0'),
(5005, 'Product E', 50, 0.5, '20.0 x 8.0 x 2.0'),
(5006, 'Product F', 10, 3.0, '100.0 x 60.0 x 40.0');

INSERT INTO quotation (quote_id, quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id)
VALUES 
(6001, '2024-10-19', '2024-11-19', 150.00, 10, 2001, 5002),
(6002, '2024-05-12', '2024-06-12', 900.00, 5, 2002, 5001),
(6003, '2024-02-01', '2024-03-01', 125.00, 20, 2001, 5002),
(6004, '2024-07-22', '2024-08-22', 450.00, 50, 2003, 5003),
(6005, '2024-04-01', '2024-05-01', 2500.00, 2, 2002, 5004),
(6006, '2024-05-01', '2024-06-01', 1000.00, 100, 2004, 5005);

INSERT INTO confirmed_orders (order_id, fulfillment_date, ordered_amount, quote_id, required_date, delivery_mode)
VALUES 
(4001, '2024-11-10', 1500.00, 6001, '2024-11-15', 'DHL'),
(4002, '2024-05-15', 4200.00, 6002, '2024-05-20', 'UPS'),
(4003, '2024-02-05', 1250.00, 6003, '2024-02-20', 'Fedex'),
(4004, '2024-03-15', 235.00, 6004, '2024-03-10', 'Self-collection'),
(4005, '2024-04-15', 5435.00, 6005, '2024-04-20', 'Fedex'),
(4006, '2024-05-20', 862.00, 6006, '2024-05-25', 'Standard');

INSERT INTO ordered_list (ordered_list_id, ordered_quantity, unit_price, order_id, product_id) 
VALUES
(7001, 10, 12.00, 4001, 5002),
(7002, 3, 172.00, 4002, 5001),
(7003, 15, 22.50, 4001, 5002),
(7004, 40, 8.90, 4003, 5003),
(7005, 50, 1220.00, 4002, 5004),
(7006, 60, 9.50, 4004, 5005);

-- Update client information
-- UPDATE client_data
-- SET first_name = 'Jane', last_name = 'Doe'
-- WHERE client_id = 1;

-- Update quotation amount
-- UPDATE quotation
-- SET quoted_amount = 1200.00
-- WHERE quotation_id = 1;

-- Update confirmed order delivery mode
-- UPDATE confirmed_orders
-- SET delivery_mode = 'Express'
-- WHERE orders_id = 1;

-- Update inventory item quantity
-- UPDATE inventory
-- SET item_quantity = 15
-- WHERE inventory_id = 1;

-- Delete a client
-- DELETE FROM client_data
-- WHERE client_id = 2;

-- Delete a quotation
-- DELETE FROM quotation
-- WHERE quotation_id = 2;

-- Delete a confirmed order
-- DELETE FROM confirmed_orders
-- WHERE orders_id = 2;

-- Delete an inventory item
-- DELETE FROM inventory
-- WHERE inventory_id = 2;