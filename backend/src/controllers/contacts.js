const pool = require('../config/database');

// Get all contacts
const getAllContacts = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, cl.name as client_name
      FROM contacts c
      LEFT JOIN clients cl ON c.client_id = cl.id
      ORDER BY c.is_primary DESC, c.created_at DESC
    `);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contacts'
    });
  }
};

// Get contacts by client ID
const getContactsByClientId = async (req, res) => {
  try {
    const { clientId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      'SELECT * FROM contacts WHERE client_id = ? ORDER BY is_primary DESC, created_at DESC',
      [clientId]
    );
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching contacts:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch contacts'
    });
  }
};

// Create contact
const createContact = async (req, res) => {
  try {
    const { client_id, first_name, last_name, title, email, phone, mobile, department, notes, is_primary } = req.body;

    if (!client_id || !first_name || !last_name) {
      return res.status(400).json({
        status: 'error',
        message: 'Client ID, first name, and last name are required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO contacts (client_id, first_name, last_name, title, email, phone, mobile, department, notes, is_primary) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [client_id, first_name, last_name, title, email, phone, mobile, department, notes, is_primary || false]
    );
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Contact created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create contact'
    });
  }
};

// Update contact
const updateContact = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, title, email, phone, mobile, department, notes, is_primary } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE contacts SET first_name = ?, last_name = ?, title = ?, email = ?, phone = ?, mobile = ?, department = ?, notes = ?, is_primary = ? WHERE id = ?',
      [first_name, last_name, title, email, phone, mobile, department, notes, is_primary, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Contact not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Contact updated successfully'
    });
  } catch (error) {
    console.error('Error updating contact:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update contact'
    });
  }
};

module.exports = {
  getAllContacts,
  getContactsByClientId,
  createContact,
  updateContact
};
