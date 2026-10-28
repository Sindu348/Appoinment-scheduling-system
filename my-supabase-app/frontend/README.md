# Frontend Application

This is the frontend part of the My Supabase App project. It is built using React and TypeScript, and it connects to a Supabase backend for managing appointments.

## Getting Started

To get started with the frontend application, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd my-supabase-app/frontend
   ```

2. **Install Dependencies**
   Make sure you have Node.js installed. Then, run the following command to install the necessary dependencies:
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   Copy the `.env.example` file to `.env` and fill in the required environment variables for connecting to Supabase.

4. **Run the Development Server**
   Start the development server with:
   ```bash
   npm run dev
   ```
   The application should now be running on `http://localhost:3000`.

## Project Structure

- `src/app/page.tsx`: Main entry point for the application.
- `src/components/BookingForm.tsx`: Component for the booking form UI.
- `src/lib/supabase.ts`: Initializes and exports the Supabase client.
- `src/styles/globals.css`: Contains global CSS styles.

## Usage

- Navigate to the main page to view the booking form.
- Fill in the required details and submit to create an appointment.

## Contributing

If you would like to contribute to this project, please fork the repository and submit a pull request with your changes.

## License

This project is licensed under the MIT License. See the LICENSE file for details.