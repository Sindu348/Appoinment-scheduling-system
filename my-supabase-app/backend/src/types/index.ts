export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price_cents: number;
  active: boolean;
}

export interface AvailabilityRule {
  id: string;
  weekday: number;
  start_time: string; // ISO 8601 time format
  end_time: string;   // ISO 8601 time format
  slot_minutes: number;
  active: boolean;
}

export interface Appointment {
  id: string;
  service_id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  appointment_date: string; // ISO 8601 date format
  start_time: string;       // ISO 8601 time format
  end_time: string;         // ISO 8601 time format
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  created_at: string;       // ISO 8601 timestamp format
}