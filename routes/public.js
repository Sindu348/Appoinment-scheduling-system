const express = require('express');
const supabase = require('../supabase');

const router = express.Router();

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value;
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') {
    return '';
  }

  return value.trim().slice(0, maxLength);
}

// GET /api/services
router.get('/services', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('id,name,description,duration_minutes,price_cents')
      .eq('active', true)
      .order('name');

    if (error) {
      throw error;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// GET /api/availability?serviceId=UUID&date=YYYY-MM-DD
router.get('/availability', async (req, res, next) => {
  try {
    const serviceId = cleanText(req.query.serviceId, 50);
    const date = cleanText(req.query.date, 10);

    if (!UUID_PATTERN.test(serviceId) || !isValidDate(date)) {
      return res.status(400).json({
        error: 'Provide a valid service and date.',
      });
    }

    const { data, error } = await supabase.rpc('available_slots', {
      p_service_id: serviceId,
      p_date: date,
    });

    if (error) {
      throw error;
    }

    res.json({ data });
  } catch (error) {
    next(error);
  }
});

// POST /api/appointments
router.post('/appointments', async (req, res, next) => {
  try {
    const customerName = cleanText(req.body.customerName, 100);
    const customerEmail = cleanText(req.body.customerEmail, 254).toLowerCase();
    const customerPhone = cleanText(req.body.customerPhone, 30);
    const serviceId = cleanText(req.body.serviceId, 50);
    const date = cleanText(req.body.date, 10);
    const startTime = cleanText(req.body.startTime, 5);

    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail);
    const validTime = /^([01]\d|2[0-3]):[0-5]\d$/.test(startTime);

    if (
      customerName.length < 2 ||
      !validEmail ||
      !UUID_PATTERN.test(serviceId) ||
      !isValidDate(date) ||
      !validTime
    ) {
      return res.status(400).json({
        error: 'Enter a valid name, email, service, date, and time.',
      });
    }

    const { data, error } = await supabase.rpc('book_appointment', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone || null,
      p_service_id: serviceId,
      p_date: date,
      p_start_time: startTime,
    });

    if (error) {
      if (error.message?.includes('SLOT_UNAVAILABLE')) {
        return res.status(409).json({
          error: 'That time is no longer available. Please choose another slot.',
        });
      }

      if (error.message?.includes('SERVICE_UNAVAILABLE')) {
        return res.status(400).json({
          error: 'That service is currently unavailable.',
        });
      }

      throw error;
    }

    const appointment = Array.isArray(data) ? data[0] : data;

    res.status(201).json({
      data: appointment,
      message: 'Your appointment has been booked.',
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;