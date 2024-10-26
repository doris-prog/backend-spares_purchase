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
app.use(express.urlencoded({ extended: false }));

let connection;

async function main() {

  connection = await createConnection({
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'database': process.env.DB_NAME,
    'password': process.env.DB_PASSWORD
  });

  app.get('/', (req,res) => {
    res.send('Hello, World!');
  });

}

main();

app.listen(3000, () => {
  console.log('Server has started')
});
