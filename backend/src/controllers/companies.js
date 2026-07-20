const pool = require('../config/database');

// Get all companies
const getAllCompanies = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM companies');
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch companies'
    });
  }
};

// Get company by ID
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query('SELECT * FROM companies WHERE id = ?', [id]);
    connection.release();

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Company not found'
      });
    }

    res.json({
      status: 'success',
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch company'
    });
  }
};

// Create company
const createCompany = async (req, res) => {
  try {
    const { name, industry, country, city, address, phone, email, website, description, established_year, annual_revenue } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'error',
        message: 'Company name is required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO companies (name, industry, country, city, address, phone, email, website, description, established_year, annual_revenue) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, industry, country, city, address, phone, email, website, description, established_year, annual_revenue]
    );
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Company created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create company'
    });
  }
};

module.exports = {
  getAllCompanies,
  getCompanyById,
  createCompany
};
