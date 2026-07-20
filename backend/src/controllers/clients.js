const pool = require('../config/database');

// Get all clients
const getAllClients = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT c.*, 
             COUNT(DISTINCT co.id) as contact_count,
             COUNT(DISTINCT d.id) as deal_count
      FROM clients c
      LEFT JOIN contacts co ON c.id = co.client_id
      LEFT JOIN deals d ON c.id = d.client_id
      GROUP BY c.id
      ORDER BY c.created_at DESC
    `);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch clients'
    });
  }
};

// Get client by ID with details
const getClientById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [clients] = await connection.query('SELECT * FROM clients WHERE id = ?', [id]);
    const [contacts] = await connection.query('SELECT * FROM contacts WHERE client_id = ? ORDER BY is_primary DESC', [id]);
    const [deals] = await connection.query(`
      SELECT d.*, ds.name as stage_name, ds.color as stage_color
      FROM deals d
      LEFT JOIN deal_stages ds ON d.stage_id = ds.id
      WHERE d.client_id = ?
      ORDER BY d.created_at DESC
    `, [id]);
    
    connection.release();

    if (clients.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Client not found'
      });
    }

    res.json({
      status: 'success',
      data: {
        ...clients[0],
        contacts,
        deals
      }
    });
  } catch (error) {
    console.error('Error fetching client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch client'
    });
  }
};

// Create client
const createClient = async (req, res) => {
  try {
    const { company_id, name, industry, country, city, address, phone, email, website, description, annual_revenue, employee_count, potential_value } = req.body;

    if (!company_id || !name) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID and client name are required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO clients (company_id, name, industry, country, city, address, phone, email, website, description, annual_revenue, employee_count, potential_value) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [company_id, name, industry, country, city, address, phone, email, website, description, annual_revenue, employee_count, potential_value]
    );
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Client created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create client'
    });
  }
};

// Update client
const updateClient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, industry, country, city, address, phone, email, website, description, annual_revenue, employee_count, potential_value } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE clients SET name = ?, industry = ?, country = ?, city = ?, address = ?, phone = ?, email = ?, website = ?, description = ?, annual_revenue = ?, employee_count = ?, potential_value = ? WHERE id = ?',
      [name, industry, country, city, address, phone, email, website, description, annual_revenue, employee_count, potential_value, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Client not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Client updated successfully'
    });
  } catch (error) {
    console.error('Error updating client:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update client'
    });
  }
};

module.exports = {
  getAllClients,
  getClientById,
  createClient,
  updateClient
};
