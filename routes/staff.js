const express = require('express');
const supabase = require('../supabase');
const { requireAdmin } = require('../middleware/admin');

const router = express.Router();

// Every route in this file requires the staff admin token.
router.use(requireAdmin);

// GET /api/staff/appointments?date=YYYY-MM-DD&status=pending
router.get('/appointments', async (req, res, next) => {
  try {
    let query = supabase
      .from('appointments')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        appointment_date,
        start_time,
        end_time,
        status,
        created_at,
        services(name)
      `)
      .order('appointment_date')
      .order('start_time')
      .limit(250);

    if (req.query.date) {
      query = query.eq('appointment_date', req.query.date);
    }

    if (req.query.status) {
      const allowedStatuses = [
        'pending',
        'confirmed',
        'cancelled',
        'completed',
      ];

      if (!allowedStatuses.includes(req.query.status)) {
        return res.status(400).json({
          error: 'Invalid appointment status filter.',
        });
      }

      query = query.eq('status', req.query.status);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/staff/appointments/:id/status
router.patch('/appointments/:id/status', async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['confirmed', 'cancelled', 'completed'];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        error: 'Status must be confirmed, cancelled, or completed.',
      });
    }

    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', req.params.id)
      .select('id,status')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: 'Appointment not found.',
      });
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /api/staff/availability-rules
router.get('/availability-rules', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('availability_rules')
      .select('id,weekday,start_time,end_time,slot_minutes,active')
      .order('weekday')
      .order('start_time');

    if (error) {
      throw error;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// PUT /api/staff/availability-rules/:id
// Request body: { "active": true } or { "active": false }
router.put('/availability-rules/:id', async (req, res, next) => {
  try {
    if (typeof req.body.active !== 'boolean') {
      return res.status(400).json({
        error: 'active must be true or false.',
      });
    }

    const { data, error } = await supabase
      .from('availability_rules')
      .update({ active: req.body.active })
      .eq('id', req.params.id)
      .select('id,weekday,start_time,end_time,slot_minutes,active')
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return res.status(404).json({
        error: 'Availability rule not found.',
      });
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

module.exports = router;