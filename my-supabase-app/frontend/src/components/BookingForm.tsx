import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const BookingForm = () => {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase.from('services').select('*').eq('active', true);
      if (error) console.error('Error fetching services:', error);
      else setServices(data);
    };

    fetchServices();
  }, []);

  const handleServiceChange = async (serviceId) => {
    setSelectedService(serviceId);
    if (appointmentDate) {
      await fetchAvailableSlots(serviceId, appointmentDate);
    }
  };

  const fetchAvailableSlots = async (serviceId, date) => {
    const { data, error } = await supabase.rpc('available_slots', {
      p_service_id: serviceId,
      p_date: date,
    });
    if (error) console.error('Error fetching available slots:', error);
    else setAvailableSlots(data);
  };

  const handleDateChange = (e) => {
    const date = e.target.value;
    setAppointmentDate(date);
    if (selectedService) {
      fetchAvailableSlots(selectedService, date);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data, error } = await supabase.rpc('book_appointment', {
      p_customer_name: customerName,
      p_customer_email: customerEmail,
      p_customer_phone: customerPhone,
      p_service_id: selectedService,
      p_date: appointmentDate,
      p_start_time: startTime,
    });
    if (error) {
      console.error('Error booking appointment:', error);
    } else {
      alert('Appointment booked successfully!');
      // Reset form
      setCustomerName('');
      setCustomerEmail('');
      setCustomerPhone('');
      setAppointmentDate('');
      setStartTime('');
      setAvailableSlots([]);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Book an Appointment</h2>
      <label>
        Service:
        <select value={selectedService} onChange={(e) => handleServiceChange(e.target.value)}>
          <option value="">Select a service</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Name:
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          required
        />
      </label>
      <label>
        Email:
        <input
          type="email"
          value={customerEmail}
          onChange={(e) => setCustomerEmail(e.target.value)}
          required
        />
      </label>
      <label>
        Phone:
        <input
          type="tel"
          value={customerPhone}
          onChange={(e) => setCustomerPhone(e.target.value)}
        />
      </label>
      <label>
        Appointment Date:
        <input
          type="date"
          value={appointmentDate}
          onChange={handleDateChange}
          required
        />
      </label>
      <label>
        Start Time:
        <select value={startTime} onChange={(e) => setStartTime(e.target.value)} required>
          <option value="">Select a time</option>
          {availableSlots.map((slot) => (
            <option key={slot.start_time} value={slot.start_time}>
              {slot.start_time} - {slot.end_time}
            </option>
          ))}
        </select>
      </label>
      <button type="submit">Book Appointment</button>
    </form>
  );
};

export default BookingForm;