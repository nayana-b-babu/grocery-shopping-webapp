const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Set your own MySQL credentials here
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'mysqlroot@123',           // Put your MySQL password here if any
  database: 'grocery_store' // <-- Change this to your DB name
});

// Connect to database
db.connect((err) => {
  if (err) {
    console.error('❌ Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to MySQL database');
});

// ✅ GET all products
app.get('/api/products', (req, res) => {
  const query = 'SELECT * FROM products';
  db.query(query, (err, results) => {
    if (err) {
      console.error('❌ Failed to fetch products:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(results);
  });
});

app.post('/api/products', (req, res) => {
  const { name, price, category } = req.body;

  // Step 1: Insert product
  const insertProductQuery = `
    INSERT INTO products (product_id,name, uom_id,price_per_unit)
    VALUES (?, ?, ?,?)
  `;
  db.query(insertProductQuery, [product_id,name , uom_id,price_per_unit ], (err, productResult) => {
    if (err) {
      console.error('❌ Error inserting product:', err);
      return res.status(500).json({ error: 'Failed to add product' });
    }

    const productId = productResult.insertId;

    // Step 2: Create a new order (auto-filled)
    const insertOrderQuery = `
      INSERT INTO \`order\` (customer_name, total, datetime)
      VALUES (?, ?, NOW())
    `;
    db.query(insertOrderQuery, ['Auto-Created', price], (err, orderResult) => {
      if (err) {
        console.error('❌ Error inserting order:', err);
        return res.status(500).json({ error: 'Failed to add order' });
      }

      const orderId = orderResult.insertId;

      // Step 3: Add product to orderdetails
      const insertOrderDetailsQuery = `
        INSERT INTO orderdetails (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
      `;
      db.query(insertOrderDetailsQuery, [orderId, productId, 1, price], (err) => {
        if (err) {
          console.error('❌ Error inserting orderdetails:', err);
          return res.status(500).json({ error: 'Failed to add order details' });
        }

        res.json({
          success: true,
          product_id: productId,
          order_id: orderId,
          message: 'Product added and auto-linked to new order'
        });
      });
    });
  });
});
