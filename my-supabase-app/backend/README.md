# Backend Application

This is the backend part of the My Supabase App project. It is built using Node.js and Express, and it connects to a Supabase database for managing appointments and services.

## Getting Started

To get started with the backend, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd my-supabase-app/backend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then, run the following command to install the required packages:
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the backend directory by copying the example:
   ```bash
   cp .env.example .env
   ```
   Update the `.env` file with your Supabase credentials and any other necessary environment variables.

4. **Run the Server**
   Start the backend server using:
   ```bash
   npm start
   ```
   The server will run on the specified port (default is 3000).

## API Endpoints

The backend exposes the following API endpoints:

- **POST /api/bookings**: Create a new appointment.
- **GET /api/bookings**: Retrieve a list of appointments.
- **GET /api/bookings/:id**: Retrieve a specific appointment by ID.
- **PUT /api/bookings/:id**: Update an existing appointment.
- **DELETE /api/bookings/:id**: Cancel an appointment.

## Database Schema

The backend interacts with a Supabase database defined in `supabase/schema.sql`. Make sure to run the SQL schema to set up the necessary tables and functions.

## Contributing

If you would like to contribute to the project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.