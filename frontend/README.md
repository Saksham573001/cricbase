# CricBase Frontend

React frontend for the CricBase cricket social platform.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the frontend directory:
```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
REACT_APP_API_URL=http://localhost:8000
```

3. Start the development server:
```bash
npm start
```

The app will be available at `http://localhost:3000`

## Features

- **Matches Screen**: Browse live, upcoming, and completed matches
- **Feed Screen**: View recent deliveries with comment counts
- **Stats Screen**: View player and team statistics
- **Profile Screen**: User profile and settings
- **Delivery Detail**: View delivery details and Reddit-style comment threads

## Project Structure

```
src/
├── components/      # Reusable UI components
├── screens/         # Main application screens
├── types/           # TypeScript type definitions
├── theme/           # Theme configuration
└── config/          # API and Supabase configuration
```

