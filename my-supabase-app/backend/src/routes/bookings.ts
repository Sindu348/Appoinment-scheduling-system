import { Router } from 'express';
import { createAppointment, getAppointments } from '../lib/supabase';

const router = Router();

// Route to create a new appointment
router.post('/appointments', async (req, res) => {
  const { customer_name, customer_email, customer_phone, service_id, date, start_time } = req.body;

  try {
    const appointment = await createAppointment(customer_name, customer_email, customer_phone, service_id, date, start_time);
    res.status(201).json(appointment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route to get all appointments
router.get('/appointments', async (req, res) => {
  try {
    const appointments = await getAppointments();
    res.status(200).json(appointments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;