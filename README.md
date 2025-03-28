# Media Converter

 This MERN stack application converts YouTube videos and SoundCloud tracks to downloadable audio files.

# Live Site 

https://anymp3.onrender.com/ 

(Note that downloading youtube videos puts my account at risk of being banned, so only soundcloud links are able to be converted for now. Running this application locally will allow both youtube and soundcloud files to be safely converted.)

## Features

- User authentication with JWT
- YouTube to MP3 conversion
- SoundCloud to MP3 conversion
- Conversion history tracking
- GraphQL API
- Black & white UI 

## Project Structure

```
mediaconverter/
│
├── frontend/               # React frontend
│   ├── public/             # Static files
│   └── src/                # React source code
│       ├── components/     # Reusable components
│       ├── pages/          # Page components
│       └── context/        # React context
│
├── server/                 # Express.js backend
│   ├── graphql/            # GraphQL schema and resolvers
│   ├── middleware/         # Express middleware
│   ├── models/             # Mongoose models
│   └── utils/              # Utility functions
│
└── python/                 # Python conversion scripts
    └── downloads/          # Downloaded media files
```

## Prerequisites

- Node.js (v14+)
- Python (v3.6+)
- MongoDB
- FFmpeg
- yt-dlp

## Installation

1. Clone the repository:
```
git clone <repository-url>
cd mediaconverter
```

2. Install dependencies:
```
npm run install-all
```

3. Set up environment variables:
   - Create a `.env` file in the server directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/mediaconverter
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=development
   PYTHON_PATH=python3
   ```

4. Install Python dependencies:
```
pip install -r python/requirements.txt
```

5. Install FFmpeg 

## Running the Application Locally

1. Start the development server:
```
npm run dev
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).


## API Documentation

The application uses GraphQL for API requests. The GraphQL endpoint is available at `/graphql` when the server is running. The main queries and mutations are:

- `getUser`: Get the current authenticated user
- `getConversions`: Get all conversions for the current user
- `getConversion(id)`: Get a specific conversion by ID
- `register(username, email, password)`: Register a new user
- `login(email, password)`: Login a user
- `createConversion(url, source, format)`: Create a new conversion
- `deleteConversion(id)`: Delete a conversion

## License

MIT

