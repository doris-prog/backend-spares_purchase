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

  app.get('/', (req, res) => {
    res.send('Hello, World!');
  });

  app.get('/test', async (req, res) => {
    const [company] = await connection.execute('SELECT * FROM company');
    res.send(company);
  })

  // show all customers in a table 
  app.get('/customer', async (req, res) => {
    const [customer] = await connection.execute('SELECT * FROM customer INNER JOIN company ON customer.company_id = company.company_id ORDER BY first_name ASC');
    res.render('customer', {
      customer
    })
  });

  //   app.get('/quotation', async (req, res) => {
  //     const [quotation] = await connection.execute('SELECT * FROM quotation INNER JOIN customer ON quotation.customer_id = customer.customer_id');
  //     res.render('quotation/index', {
  //     quotation
  //     })
  //   });

  app.get('/customer/create', async (req, res) => {
    const [company] = await connection.execute(`SELECT * FROM company`);
    // const [customer] = await connection.execute(`SELECT * FROM customer`);
    res.render('customer/create', {
      company,
      // customer
    })
  });

  app.post('customer/create', async (req, res) => {
    const { first_name, last_name, email, contact_number, company_id } = req.body;
    const query = 'INSERT INTO customer (first_name, last_name, email, contact_number, company_id) VALUES (?, ?, ?, ?, ?)';
    const bindings = [first_name, last_name, email, contact_number, company_id];
    await connection.execute(query, bindings);
    res.redirect('/customer');
  })

  app.get('/customer/:customer_id/edit', async (req, res) => {
    const [customers] = await connection.execute('SELECT * from customer WHERE customer_id = ?', [req.params.customer_id]);
    const [company] = await connection.execute('SELECT * from company');
    const customer = customers[0];
    res.render('customer/edit', {
      customer,
      company
    })
  })

  app.post('/customer/:customer_id/edit', async (req, res) => {
    const { first_name, last_name, email, contact_number, company_id } = req.body;
    const query = 'UPDATE Customers SET first_name=?, last_name=?, email=?, contact_number=?, company_id=? WHERE customer_id=?';
    const bindings = [first_name, last_name, email, contact_number, company_id, req.params.customer_id];
    await connection.execute(query, bindings);
    res.redirect('/customer');
  })

  app.get('/customer/:customer_id/delete', async (req, res) => {
    const [customers] = await connection.execute("SELECT * FROM customer WHERE customer_id = ?", [req.params.customer_id]);
    const customer = customers[0];
    res.render('customer/delete', {
      customer
    })
  });

  app.post('/customer/:customer_id/delete', async function (req, res) {
    await connection.execute(`DELETE FROM customer WHERE customer_id = ?`, [req.params.customer_id]);
    res.redirect('/customers');
  })

  //   app.get('/customer/create', async (req, res) => {
  //     const [company] = await connection.execute(`SELECT * FROM company`);
  //     res.render('customer/create', {
  //       company
  //     })
  //   });

  //   app.get('/customer/create', async (req, res) =>  {
  //     const [customer] = await connection.execute(`SELECT * FROM customer`);
  //     res.render('customer/create', {
  //       customer
  //     })
  //   });

  //   app.get('/inventory/create', async (req, res) =>  {
  //     const [inventory] = await connection.execute(`SELECT * FROM inventory`);
  //     res.render('inventory/create', {
  //       inventory
  //     })
  //   });

  //   app.get('/confirmed_orders/create', async (req, res) =>  {
  //     const [confirmed_orders] = await connection.execute(`SELECT * FROM confirmed_orders`);
  //     res.render('confirmed_orders/create', {
  //       confirmed_orders
  //     })
  //   });

  //   app.get('/ordered_list/create', async (req, res) =>  {
  //     const [ordered_list] = await connection.execute(`SELECT * FROM ordered_list`);
  //     res.render('ordered_list/create', {
  //       ordered_list
  //     })
  //   });
}

main();

app.listen(3000, () => {
  console.log('Server has started')
});
