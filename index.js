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

  // app.get('/', (req, res) => {
  //   res.send('Hello, World!');
  // });

  app.get('/', async (req, res) => {
    const [company] = await connection.execute('SELECT * FROM company');
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN company ON customer.company_id = company.company_id ORDER BY first_name ASC');
    res.render('layouts/base', {
      company,
      customer
    })
  });

  app.get('/', async (req, res) => {
    const [quotation] = await connection.execute('SELECT * FROM quotation');
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN quotation ON customer.customer_id = quotation.customer_id ORDER BY customer.customer_id ASC');
    res.render('layouts/base', {
      quotation,
      customer
    })
  });

  app.get('/customer', async (req, res) => {
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN company ON customer.company_id = company.company_id ORDER BY first_name ASC');
    res.render('customer', {
      customer
    })
  });

  app.get('/quotation', async (req, res) => {
    const [quotation] = await connection.execute('SELECT * FROM quotation INNER JOIN customer ON customer.customer_id = quotation.customer_id ORDER BY customer.customer_id ASC');
    res.render('quotation', {
      quotation
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
    const [quotation] = await connection.execute(`SELECT * FROM quotation`);
    const [customer] = await connection.execute(`SELECT * FROM customer`);
    res.render('quotation/create', {
      quotation,
      customer
    })
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
    const [quotations] = await connection.execute('SELECT * from quotation WHERE customer_id=?', [req.params.customer_id]);
    const [customer] = await connection.execute('SELECT * from customer');
    const quotation = quotations[0];
    res.render('quotation/edit', {
      customer,
      quotation
    })
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

  app.post('/quotation /:customer_id/edit', async (req, res) => {
    const { quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id } = req.body;

    // Convert company_id to a number if it's coming as a string
    const parsedCustomerId = Number(customer_id);

    // Check if parsedCompanyId is a valid number
    if (isNaN(parsedCustomerId)) {
      return res.status(400).send('quote_id must be a valid integer');
    }

    const query = 'UPDATE quotation SET quoted_date=?, validity_date=?, quoted_amount=?, quoted_quantity=?, customer_id, product_id WHERE customer_id=?';
    const bindings = [quoted_date, validity_date, quoted_amount, quoted_quantity, customer_id, product_id, req.params.customer_id];

    try {
      await connection.execute(query, bindings);
      res.redirect('/customer');
    } catch (error) {
      console.error("Database error:", error);
      res.status(500).send('An error occurred while updating the customer');
    }
  });

  // app.post('/customer/:customer_id/edit', async (req, res) => {
  //     const { first_name, last_name, email, contact_number, company_id } = req.body;

  //     // Ensure company_id is a valid integer if it's coming as a JSON string
  //     let parsedCompanyId;
  //     try {
  //         parsedCompanyId = JSON.parse(company_id)[0]; // Assuming company_id might be in the format '["2007"]'
  //     } catch (error) {
  //         return res.status(400).send('Invalid company_id format');
  //     }

  //     // Check if parsedCompanyId is a valid number
  //     if (isNaN(parsedCompanyId)) {
  //         return res.status(400).send('company_id must be a valid integer');
  //     }

  //     const query = 'UPDATE customer SET first_name=?, last_name=?, email=?, contact_number=?, company_id=? WHERE customer_id=?';
  //     const bindings = [first_name, last_name, email, contact_number, parsedCompanyId, req.params.customer_id];

  //     await connection.execute(query, bindings);
  //     res.redirect('/customer');
  // });

  // app.get('/customer/:customer_id/edit', async (req, res) => {
  //   const [customers] = await connection.execute('SELECT * from customer WHERE customer_id=?', [req.params.customer_id]);
  //   const [company] = await connection.execute('SELECT * from company');
  //   const customer = customers[0];
  //   res.render('customer/edit', {
  //     customer,
  //     company
  //   })
  // });

  // app.post('/customer/:customer_id/edit', async (req, res) => {
  //   const { first_name, last_name, email, contact_number, company_id } = req.body;
  //   // console.log("edit body >>> ", req.body);
  //   // console.log("customer id >>> ", req.params.customer_id);
  //   const query = 'UPDATE customer SET first_name=?, last_name=?, email=?, contact_number=?, company_id=? WHERE customer_id=?';
  //   const bindings = [first_name, last_name, email, contact_number, company_id, [req.params.customer_id]];
  //   await connection.execute(query, bindings);
  //   res.redirect('/customer');
  // });

  app.get('/customer/:customer_id/delete', async (req, res) => {
    const [customers] = await connection.execute("SELECT * FROM customer WHERE customer_id = ?", [req.params.customer_id]);
    const customer = customers[0];
    res.render('customer/delete', {
      customer
    })
  });

  app.get('/quotation/:customer_id/delete', async (req, res) => {
    const [quotations] = await connection.execute("SELECT * FROM quotation WHERE customer_id = ?", [req.params.customer_id]);
    const quotation = quotations[0];
    res.render('quotation/delete', {
      quotation
    })
  });

  app.post('/customer/:customer_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM customer WHERE customer_id = ?`, [req.params.customer_id]);
    res.redirect('/customer');
  });

  app.post('/quotation/:customer_id/delete', async (req, res) => {
    await connection.execute(`DELETE FROM quotation WHERE customer_id = ?`, [req.params.customer_id]);
    res.redirect('/quotation');
  });

}

main();

app.listen(3000, () => {
  console.log('Server has started')
});
