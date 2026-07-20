const pool = require('../config/database');

// Get all deals with stage info
const getAllDeals = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, 
             ds.name as stage_name, 
             ds.color as stage_color,
             ds.sequence as stage_sequence,
             cl.name as client_name,
             c.name as company_name
      FROM deals d
      LEFT JOIN deal_stages ds ON d.stage_id = ds.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN companies c ON d.company_id = c.id
      ORDER BY ds.sequence ASC, d.created_at DESC
    `);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deals'
    });
  }
};

// Get deal by ID with full details
const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const connection = await pool.getConnection();
    
    const [deals] = await connection.query(`
      SELECT d.*, 
             ds.name as stage_name, 
             ds.color as stage_color,
             cl.name as client_name,
             c.name as company_name
      FROM deals d
      LEFT JOIN deal_stages ds ON d.stage_id = ds.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      LEFT JOIN companies c ON d.company_id = c.id
      WHERE d.id = ?
    `, [id]);
    
    if (deals.length === 0) {
      connection.release();
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found'
      });
    }

    const [activities] = await connection.query(`
      SELECT a.*, at.name as activity_type_name, at.icon as activity_icon
      FROM activities a
      LEFT JOIN activity_types at ON a.type_id = at.id
      WHERE a.deal_id = ?
      ORDER BY a.activity_date DESC
    `, [id]);
    
    const [history] = await connection.query(`
      SELECT dh.*, 
             ds_old.name as old_stage_name,
             ds_new.name as new_stage_name
      FROM deal_history dh
      LEFT JOIN deal_stages ds_old ON dh.old_stage_id = ds_old.id
      LEFT JOIN deal_stages ds_new ON dh.new_stage_id = ds_new.id
      WHERE dh.deal_id = ?
      ORDER BY dh.changed_at DESC
    `, [id]);
    
    connection.release();

    res.json({
      status: 'success',
      data: {
        ...deals[0],
        activities,
        history
      }
    });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deal'
    });
  }
};

// Create deal
const createDeal = async (req, res) => {
  try {
    const { company_id, client_id, title, description, value, stage_id, probability_percent, expected_close_date } = req.body;

    if (!company_id || !client_id || !title || !value || !stage_id) {
      return res.status(400).json({
        status: 'error',
        message: 'Company ID, client ID, title, value, and stage ID are required'
      });
    }

    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO deals (company_id, client_id, title, description, value, stage_id, probability_percent, expected_close_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [company_id, client_id, title, description, value, stage_id, probability_percent || 0, expected_close_date]
    );
    connection.release();

    res.status(201).json({
      status: 'success',
      message: 'Deal created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create deal'
    });
  }
};

// Update deal
const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, value, stage_id, probability_percent, expected_close_date, actual_close_date, won_lost_reason } = req.body;

    const connection = await pool.getConnection();
    
    // Get old values for history
    const [oldDeal] = await connection.query('SELECT stage_id, value FROM deals WHERE id = ?', [id]);
    
    const [result] = await connection.query(
      'UPDATE deals SET title = ?, description = ?, value = ?, stage_id = ?, probability_percent = ?, expected_close_date = ?, actual_close_date = ?, won_lost_reason = ? WHERE id = ?',
      [title, description, value, stage_id, probability_percent, expected_close_date, actual_close_date, won_lost_reason, id]
    );

    // Record history if stage changed
    if (oldDeal.length > 0 && (oldDeal[0].stage_id !== stage_id || oldDeal[0].value !== value)) {
      await connection.query(
        'INSERT INTO deal_history (deal_id, old_stage_id, new_stage_id, old_value, new_value) VALUES (?, ?, ?, ?, ?)',
        [id, oldDeal[0].stage_id, stage_id, oldDeal[0].value, value]
      );
    }

    connection.release();

    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Deal not found'
      });
    }

    res.json({
      status: 'success',
      message: 'Deal updated successfully'
    });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update deal'
    });
  }
};

// Get deals by stage
const getDealsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(`
      SELECT d.*, 
             ds.name as stage_name, 
             ds.color as stage_color,
             cl.name as client_name
      FROM deals d
      LEFT JOIN deal_stages ds ON d.stage_id = ds.id
      LEFT JOIN clients cl ON d.client_id = cl.id
      WHERE d.stage_id = ?
      ORDER BY d.created_at DESC
    `, [stageId]);
    connection.release();

    res.json({
      status: 'success',
      data: rows
    });
  } catch (error) {
    console.error('Error fetching deals by stage:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch deals'
    });
  }
};

module.exports = {
  getAllDeals,
  getDealById,
  createDeal,
  updateDeal,
  getDealsByStage
};
