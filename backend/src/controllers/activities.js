const pool = require('../config/database');

// Get all activities
const getAllActivities = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT a.*, 
             at.name as activity_type_name,
             at.icon as activity_icon,
             d.title as deal_title,
             cl.name as client_name,
             c.first_name, c.last_name
      FROM activities a
      LEFT JOIN activity_types at ON a.type_id = at.id
      LEFT JOIN deals d ON a.deal_id = d.id
      LEFT JOIN clients cl ON a.client_id = cl.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      ORDER BY a.activity_date DESC
      LIMIT 100
    `);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activities'
    });
  }
};

// Get activities by deal ID
const getActivitiesByDealId = async (req, res) => {
  try {
    const { dealId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT a.*, 
             at.name as activity_type_name,
             at.icon as activity_icon,
             c.first_name, c.last_name
      FROM activities a
      LEFT JOIN activity_types at ON a.type_id = at.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      WHERE a.deal_id = ?
      ORDER BY a.activity_date DESC
    `, [dealId]);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch activities'
    });
  }
};

// Create activity
const createActivity = async (req, res) => {
  try {
    const { deal_id, client_id, contact_id, type_id, title, description, activity_date, duration_minutes, notes } = req.body;

    if (!type_id || !title) {
      return res.status(400).json({
        status: 'error',
        message: 'Activity type and title are required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO activities (deal_id, client_id, contact_id, type_id, title, description, activity_date, duration_minutes, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [deal_id || null, client_id || null, contact_id || null, type_id, title, description, activity_date, duration_minutes, notes]
    );
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Activity created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create activity'
    });
  }
};

// Update activity
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, activity_date, duration_minutes, notes } = req.body;

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'UPDATE activities SET title = ?, description = ?, activity_date = ?, duration_minutes = ?, notes = ? WHERE id = ?',
      [title, description, activity_date, duration_minutes, notes, id]
    );
    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Activity not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Activity updated successfully'
    });
  } catch (error) {
    console.error('Error updating activity:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update activity'
    });
  }
};

module.exports = {
  getAllActivities,
  getActivitiesByDealId,
  createActivity,
  updateActivity
};
