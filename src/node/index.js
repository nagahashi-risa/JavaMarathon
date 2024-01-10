const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: true }));

const port = 3514;

const cors = require("cors");
app.use(cors());

const { Pool } = require("pg");
const pool = new Pool({
  user: "user_3514", // PostgreSQLのユーザー名に置き換えてください
  host: "db",
  database: "crm_3514", // PostgreSQLのデータベース名に置き換えてください
  password: "pass_3514", // PostgreSQLのパスワードに置き換えてください
  port: 5432,
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.get("/customers", async (req, res) => {
  try {
    const customerData = await pool.query("SELECT * FROM customers");
    res.send(customerData.rows);
  } catch (err) {
    console.error(err);
    res.send("Error " + err);
  }
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.post("/add-customer", async (req, res) => {
  try {
    const { companyName, industry, contact, location } = req.body;
    const newCustomer = await pool.query(
      "INSERT INTO customers (company_name, industry, contact, location) VALUES ($1, $2, $3, $4) RETURNING *",
      [companyName, industry, contact, location]
    );
    res.json({ success: true, customer: newCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

//顧客詳細情報の表示
app.get("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const customerData = await pool.query("SELECT * FROM customers WHERE customer_id = $1", [customerId]);
    res.json(customerData.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(404).json({ error: "Customer not found" });
  }
});

//顧客情報の削除
app.delete("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    await pool.query("DELETE FROM customers WHERE customer_id = $1", [customerId]);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

//顧客情報の更新
app.put("/customers/:id", async (req, res) => {
  try {
    const customerId = req.params.id;
    const { companyName, industry, contact, location } = req.body;
    const updateCustomer = await pool.query(
      "UPDATE customers SET company_name = $1, industry = $2, contact = $3, location = $4, updated_date = NOW() WHERE customer_id = $5 RETURNING *",
      [companyName, industry, contact, location, customerId]
    );
    res.json({ success: true, customer: updateCustomer.rows[0] });
  } catch (err) {
    console.error(err);
    res.json({ success: false });
  }
});

app.use(express.static("public"));
