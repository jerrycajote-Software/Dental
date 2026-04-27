const db = require('../config/db');

const getAnalyticsSummary = async (req, res) => {
  try {
    const { period = 'week' } = req.query;
    
    let dateFilter;
    switch (period) {
      case 'day':
        dateFilter = "CURRENT_DATE";
        break;
      case 'week':
        dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "CURRENT_DATE - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
    }

    const appointmentResult = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
       FROM appointments
       WHERE appointment_date >= ${dateFilter}`
    );

    const patientResult = await db.query(
      `SELECT COUNT(DISTINCT client_id) as unique_patients
       FROM appointments
       WHERE appointment_date >= ${dateFilter}`
    );

    const serviceResult = await db.query(
      `SELECT s.name, COUNT(*) as count
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       WHERE a.appointment_date >= ${dateFilter}
       GROUP BY s.id, s.name
       ORDER BY count DESC
       LIMIT 5`
    );

    const doctorResult = await db.query(
      `SELECT u.name, COUNT(*) as appointment_count
       FROM appointments a
       JOIN users u ON a.dentist_id = u.id
       WHERE a.appointment_date >= ${dateFilter}
       GROUP BY u.id, u.name
       ORDER BY appointment_count DESC
       LIMIT 5`
    );

    const chartResult = await db.query(
      `SELECT 
        appointment_date as date,
        COUNT(*) as count
       FROM appointments
       WHERE appointment_date >= ${dateFilter}
       GROUP BY appointment_date
       ORDER BY appointment_date`
    );

    const peakHoursResult = await db.query(
      `SELECT 
        EXTRACT(HOUR FROM appointment_time) as hour,
        COUNT(*) as count
       FROM appointments
       WHERE appointment_date >= ${dateFilter}
       GROUP BY EXTRACT(HOUR FROM appointment_time)
       ORDER BY hour`
    );

    res.json({
      summary: appointmentResult.rows[0],
      uniquePatients: parseInt(patientResult.rows[0]?.unique_patients) || 0,
      topServices: serviceResult.rows,
      topDoctors: doctorResult.rows,
      chartData: chartResult.rows,
      peakHours: peakHoursResult.rows,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getDailyBreakdown = async (req, res) => {
  try {
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        appointment_date as date,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
        COUNT(*) FILTER (WHERE status = 'completed') as completed,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
      FROM appointments
    `;
    
    const params = [];
    if (start_date && end_date) {
      query += ' WHERE appointment_date BETWEEN $1 AND $2';
      params.push(start_date, end_date);
    } else {
      query += ' WHERE appointment_date >= CURRENT_DATE - INTERVAL \'30 days\'';
    }
    
    query += ' GROUP BY appointment_date ORDER BY appointment_date';

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getCancellationRate = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter;
    switch (period) {
      case 'week':
        dateFilter = "CURRENT_DATE - INTERVAL '7 days'";
        break;
      case 'month':
        dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
        break;
      case 'year':
        dateFilter = "CURRENT_DATE - INTERVAL '365 days'";
        break;
      default:
        dateFilter = "CURRENT_DATE - INTERVAL '30 days'";
    }

    const result = await db.query(
      `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'cancelled') as cancelled,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'cancelled')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as cancellation_rate_percentage
       FROM appointments
       WHERE appointment_date >= ${dateFilter}`
    );

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getAnalyticsSummary,
  getDailyBreakdown,
  getCancellationRate,
};