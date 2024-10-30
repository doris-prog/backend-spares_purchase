const express = require('express');
const app = express();
const hbs = require('hbs');
const wax = require('wax-on');
wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');

const helpers = require('handlebars-helpers');
helpers({
  'handlebars': hbs.handlebars
})

require('dotenv').config();

const { createConnection } = require('mysql2/promise');

app.set('view engine', 'hbs');
app.use(express.urlencoded({ extended: true }));

let connection;

async function main() {

  connection = await createConnection({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'database': process.env.DB_NAME,
    'password': process.env.DB_PASSWORD
  });

  function formatDate(date) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(date).toLocaleDateString('en-GB', options); // 'en-GB' for dd/mm/yyyy format
  }
  // app.get('/', (req, res) => {
  //   res.send('Hello, World!');
  // });

  app.get('/', async (req, res) => {
    const [company] = await connection.execute('SELECT * FROM company');
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN company ON customer.company_id = company.company_id ORDER BY customer.customer_id ASC');
    res.render('layouts/base', {
      company,
      customer
    })
  });

  // app.get('/', async (req, res) => {
  //   const [inventory] = await connection.execute('SELECT * FROM inventory INNER JOIN quotation ON inventory.product_id = quotation.product_id');
  //   const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN quotation ON customer.customer_id = quotation.customer_id ORDER BY customer.customer_id ASC');
  //   const [quotation] = await connection.execute('SELECT * FROM quotation');

  //   const formattedQuotation = quotation.map(quote => ({
  //     ...quote,
  //     quoted_date: formatDate(quote.quoted_date),
  //     validity_date: formatDate(quote.validity_date)
  //   }));
  //   res.render('layouts/base', {
  //     inventory,
  //     customer,
  //     quotation: formattedQuotation
  //   });
  // });

  app.get('/company', async (req, res) => {
    const [company] = await connection.execute('SELECT * FROM company');
    res.render('company', { company });
  });

  app.get('/customer', async (req, res) => {
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN company ON customer.company_id = company.company_id ORDER BY first_name ASC');
    res.render('customer', {
      customer
    })
  });

  app.get('/quotation', async (req, res) => {
    const [quotation] = await connection.execute('SELECT * FROM quotation INNER JOIN customer ON customer.customer_id = quotation.customer_id ORDER BY quotation.quote_id ASC');
    const formattedQuotation = quotation.map(quote => ({
      ...quote,
      quoted_date: formatDate(quote.quoted_date),
      validity_date: formatDate(quote.validity_date)
    }));
    res.render('quotation', {
      quotation: formattedQuotation
    });
  });

  app.get('/confirmed_orders', async (req, res) => {
    try {
      const [confirmedOrders] = await connection.execute(`
        SELECT * FROM confirmed_orders INNER JOIN quotation ON confirmed_orders.quote_id = quotation.quote_id ORDER BY confirmed_orders.order_id ASC
      `);
      
      const formattedConfirmedOrders = confirmedOrders.map(order => ({ ...order,
        fulfillment_date: formatDate(order.fulfillment_date),
        required_date: formatDate(order.required_date),
      }));
  
      const formattedQuotation = confirmedOrders.map(order => ({
        ...order,
        quoted_date: formatDate(order.quoted_date),
        validity_date: formatDate(order.validity_date),
      }));
  
      res.render('quotation', {
        confirmed_orders: formattedConfirmedOrders,
        quotation: formattedQuotation
      });
    } catch (error) {
      console.error('Error fetching confirmed orders:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  app.get('/company/create', async (req, res) => {
    const [company] = await connection.execute(`SELECT * FROM company`);
    res.render('company/create', {
      company,
    })
  });

  app.get('/customer/create', async (req, res) => {
    const [company] = await connection.execute(`SELECT * FROM company`);
    const [customer] = await connection.execute(`SELECT * FROM customer`);
    res.render('customer/create', {
      company,
      customer
    })
  });

  app.get('/quotation/create', async (req, res) => {
    const [inventory] = await connection.execute(`SELECT * FROM inventory`);
    const [quotation] = await connection.execute(`SELECT * FROM quotation`);
    const [customer] = await connection.execute(`SELECT * FROM customer`);
    res.render('quotation/create', {
      inventory,
      quotation,
      customer
    });
  });

  app.get('/confirmed_orders/create', async (req, res) => {
    const [confirmed_orders] = await connection.execute(`SELECT * FROM confirmed_orders`);
    const [quotation] = await connection.execute(`SELECT * FROM quotation`);
    res.render('confirmed_orders/create', {
      confirmed_orders,
      quotation,
    });
  });

  app.post('/company/create', async (req, res) => {
    const { company_name, company_address, postal_code, office_number } = req.body;
    const query = 'INSERT INTO company (company_name, company_address, postal_code, office_number) VALUES (?, ?, ?, ?)';
    const bindings = [company_name, company_address, postal_code, office_number];
    await connection.execute(query, bindings);
    res.redirect('/company');
  });

  app.post('/customer/create', async (req, res) => {
    const { first_name, last_name, email, contact_number, company_id } = req.body;
    const query = 'INSERT INTO customer (first_name, last_name, email, contact_number, company_id) VALUES (?, ?, ?, ?, ?)';
    const bindings = [first_name, last_name, email, contact_number, company_id];
    await connection.execute(query, bindings);
    res.redirect('/customer');
  });

  app.post('/quotation/create', async (req, res) => {
    const { quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id } = req.body;
    const query = 'INSERT INTO quotation (quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id) VALUES (?, ?, ?, ?, ?, ?)';
    const bindings = [quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id];
    await connection.execute(query, bindings);
    res.redirect('/quotation');
  });

  app.post('/confirmed_orders/create', async (req, res) => {
    const { fulfillment_date, ordered_amount, quote_id, required_date, delivery_mode } = req.body;
    const query = 'INSERT INTO confirmed_orders (fulfillment_date, ordered_amount, quote_id, required_date, delivery_mode) VALUES (?, ?, ?, ?, ?)';
    const bindings = [fulfillment_date, ordered_amount, quote_id, required_date, delivery_mode];
    await connection.execute(query, bindings);
    res.redirect('/confirmed_orders');
  });

  app.get('/company/:company_id/edit', async (req, res) => {
    const [companies] = await connection.execute('SELECT * from company WHERE company_id=?', [req.params.company_id]);
    const company = companies[0];
    res.render('company/edit', {
      company
    });
  });

  app.get('/customer/:customer_id/edit', async (req, res) => {
    const [customers] = await connection.execute('SELECT * from customer WHERE customer_id=?', [req.params.customer_id]);
    const [company] = await connection.execute('SELECT * from company');
    const customer = customers[0];
    res.render('customer/edit', {
      customer,
      company
    });
  });

  app.get('/quotation/:quote_id/edit', async (req, res) => {
    const [quotations] = await connection.execute('SELECT * from quotation WHERE quote_id=?', [req.params.quote_id]);
    const [customer] = await connection.execute('SELECT * from customer');
    const quotation = quotations[0];
    const formattedQuotation = quotation.map(quote => ({
      ...quote,
      quoted_date: formatDate(quote.quoted_date),
      validity_date: formatDate(quote.validity_date)
    }));
    res.render('quotation/edit', {
      customer,
      quotation: formattedQuotation
    })
  });

  app.get('/confirmed_orders/:order_id/edit', async (req, res) => {
      const [confirmedOrders] = await connection.execute('SELECT * from confirmed_orders WHERE order_id=?', [req.params.order_id]);
      const [quotation] = await connection.execute('SELECT * from quotation');
      const formattedConfirmedOrders = confirmedOrders.map(order => ({ ...order,
        fulfillment_date: formatDate(order.fulfillment_date),
        required_date: formatDate(order.required_date),
      }));
  
      const formattedQuotation = confirmedOrders.map(order => ({
        quoted_date: formatDate(order.quoted_date),
        validity_date: formatDate(order.validity_date),
      }));
  
      res.render('confirmed_orders/edit', {
        confirmed_orders: formattedConfirmedOrders,
        quotation: formattedQuotation
      });
  });

  app.post('/company/:company_id/edit', async (req, res) => {
    const { company_name, company_address, postal_code, office_number } = req.body;
    const query = 'UPDATE company SET company_name=?, company_address=?, postal_code=?, office_number=? WHERE company_id=?';
    const bindings = [company_name, company_address, postal_code, office_number, req.params.company_id];

    await connection.execute(query, bindings);
    res.redirect('/company');
  });

  app.post('/customer/:customer_id/edit', async (req, res) => {
    const { first_name, last_name, email, contact_number, company_id } = req.body;

    // Log the received company_id for debugging
    // console.log("Received company_id:", company_id);

    // Convert company_id to a number if it's coming as a string
    const parsedCompanyId = Number(company_id);

    // Check if parsedCompanyId is a valid number
    if (isNaN(parsedCompanyId)) {
      return res.status(400).send('company_id must be a valid integer');
    }

    const query = 'UPDATE customer SET first_name=?, last_name=?, email=?, contact_number=?, company_id=? WHERE customer_id=?';
    const bindings = [first_name, last_name, email, contact_number, parsedCompanyId, req.params.customer_id];

    try {
      await connection.execute(query, bindings);
      res.redirect('/customer');
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send('An error occurred while updating the customer');
    }
  });

  app.post('/quotation /:quote_id/edit', async (req, res) => {
    const { quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id } = req.body;

    const parsedQuoteId = Number(quote_id);

    if (isNaN(parsedQuoteId)) {
      return res.status(400).send('quote_id must be a valid integer');
    }
    const query = 'UPDATE quotation SET quoted_date=?, validity_date=?, quoted_amount=?, quoted_quantity=?, customer_id, product_id WHERE quote_id=?';
    const bindings = [quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id, req.params.quote_id];

    try {
      await connection.execute(query, bindings);
      res.redirect('/quotation');
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send('An error occurred while updating the quotation');
    }
  });

  app.get('/company/:company_id/delete', async (req, res) => {
    const [companies] = await connection.execute("SELECT * FROM company WHERE company_id = ?", [req.params.company_id]);
    const company = companies[0];
    res.render('company/delete', {
      company
    })
  });

  app.get('/customer/:customer_id/delete', async (req, res) => {
    const [customers] = await connection.execute("SELECT * FROM customer WHERE customer_id = ?", [req.params.customer_id]);
    const customer = customers[0];
    res.render('customer/delete', {
      customer
    })
  });

  app.get('/quotation/:quote_id/delete', async (req, res) => {
    const [quotations] = await connection.execute("SELECT * FROM quotation WHERE quote_id = ?", [req.params.quote_id]);
    const quotation = quotations[0];
    res.render('quotation/delete', {
      quotation
    })
  });

  app.get('/confirmed_orders/:order_id/delete', async (req, res) => {
    const [confirmedOrders] = await connection.execute("SELECT * FROM confirmed_orders WHERE order_id = ?", [req.params.order_id]);
    const confirmed_orders = confirmedOrders[0];
    res.render('confirmed_orders/delete', {
      confirmed_orders
    })
  });

  app.post('/company/:company_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM company WHERE company_id = ?`, [req.params.company_id]);
    res.redirect('/company');
  });

  app.post('/customer/:customer_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM customer WHERE customer_id = ?`, [req.params.customer_id]);
    res.redirect('/customer');
  });

  app.post('/quotation/:quote_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM quotation WHERE quote_id = ?`, [req.params.quote_id]);
    res.redirect('/quotation');
  });

  app.post('/confirmed_orders/:order_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM confirmed_orders WHERE order_id = ?`, [req.params.order_id]);
    res.redirect('/confirmed_orders');
  });
}

main();

app.listen(3000, () => {
  console.log('Server has started')
});
