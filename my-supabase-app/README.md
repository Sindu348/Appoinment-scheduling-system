# My Supabase App

This project is a web application that integrates a frontend built with React and a backend using Node.js, along with a Supabase database for managing appointments and services.

## Project Structure

```
my-supabase-app
├── frontend          # Frontend application
│   ├── src          # Source files for the frontend
│   ├── .env.example  # Example environment variables for the frontend
│   ├── package.json  # Frontend dependencies and scripts
│   ├── tsconfig.json # TypeScript configuration for the frontend
│   └── README.md     # Frontend documentation
├── backend           # Backend application
│   ├── src          # Source files for the backend
│   ├── .env.example  # Example environment variables for the backend
│   ├── package.json  # Backend dependencies and scripts
│   ├── tsconfig.json # TypeScript configuration for the backend
│   └── README.md     # Backend documentation
├── supabase          # Supabase configuration and schema
│   ├── schema.sql    # SQL schema for the Supabase database
│   └── config.toml   # Supabase configuration settings
├── .gitignore        # Files to ignore in Git
└── package.json      # Root-level npm configuration
```

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Supabase account

### Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd my-supabase-app
   ```

2. **Install dependencies:**

   For the frontend:

   ```bash
   cd frontend
   npm install
   ```

   For the backend:

   ```bash
   cd ../backend
   npm install
   ```

3. **Configure environment variables:**

   Copy the example environment files and fill in your Supabase credentials.

   For the frontend:

   ```bash
   cp .env.example .env
   ```

   For the backend:

   ```bash
   cp .env.example .env
   ```

4. **Run the application:**

   Start the backend server:

   ```bash
   cd backend
   npm start
   ```

   Start the frontend application:

   ```bash
   cd ../frontend
   npm start
   ```

### Usage

- Access the frontend application in your browser at `http://localhost:3000`.
- The backend API will be available at `http://localhost:5000`.

### Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

### License

This project is licensed under the MIT License. See the LICENSE file for more details.