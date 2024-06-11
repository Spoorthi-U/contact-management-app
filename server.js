const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql');

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Use your MySQL username
    password: '', // Use your MySQL password
    database: 'contact_app'
});

db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

// Create a new contact
app.post('/contacts', (req, res) => {
    const { name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country } = req.body;
    const query = 'INSERT INTO contacts (name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: result.insertId, name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country });
    });
});

// Get all contacts
app.get('/contacts', (req, res) => {
    db.query('SELECT * FROM contacts', (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

// Update a contact
app.put('/contacts/:id', (req, res) => {
    const { id } = req.params;
    const { name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country } = req.body;
    const query = 'UPDATE contacts SET name = ?, phone = ?, gender = ?, email = ?, streetAddress = ?, city = ?, stateProvince = ?, postalCode = ?, country = ? WHERE id = ?';
    db.query(query, [name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country, id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.json({ id, name, phone, gender, email, streetAddress, city, stateProvince, postalCode, country });
    });
});

// Delete a contact
app.delete('/contacts/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM contacts WHERE id = ?', [id], (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        res.status(204).send();
    });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
