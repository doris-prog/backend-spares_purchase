SELECT * FROM
 confirmed_orders JOIN ordered_list
 ON confirmed_orders.order_id = ordered_list.order_id
 JOIN inventory
 ON ordered_list.product_id = inventory.product_id
 JOIN quotation
 ON inventory.product_id = quotation.product_id;