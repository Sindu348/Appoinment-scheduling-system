import express from 'express';
import cors from 'cors';
import bookingsRouter from './routes/bookings';
import { config } from 'dotenv';

config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/bookings', bookingsRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});