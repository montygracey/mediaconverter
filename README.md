# Media Converter Application

A MERN stack application for converting YouTube videos to MP3/MP4 and SoundCloud tracks to MP3.

## Features

- User authentication with JWT
- YouTube to MP3/MP4 conversion
- SoundCloud to MP3 conversion
- Conversion history tracking
- GraphQL API
- Responsive React UI

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

If you're having issues with yt-dlp installation, you can install it directly:
```
pip install yt-dlp
```

5. Install FFmpeg (platform-dependent):
   - For Ubuntu: `apt-get install ffmpeg`
   - For macOS: `brew install ffmpeg`
   - For Windows: Download from [FFmpeg website](https://ffmpeg.org/download.html)

## Running the Application Locally

1. Start the development server:
```
npm run dev
```

This will start both the backend server (on port 5000) and the frontend development server (on port 3000).

## Deploying to Render

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Use the following settings:
   - **Environment**: Node
   - **Build Command**: `npm install && npm run install-server && npm run install-client && npm run build`
   - **Start Command**: `npm start`

4. Add the following environment variables:
   - `PORT`: 8080 (Render's default port)
   - `MONGO_URI`: Your MongoDB connection string (e.g., MongoDB Atlas)
   - `JWT_SECRET`: A strong secret key for JWT
   - `NODE_ENV`: production
   - `PYTHON_PATH`: python3

5. Under the "Advanced" settings:
   - Add the following packages to install:
     - `python3`
     - `python3-pip`
     - `ffmpeg`
   - Add a custom build command: `pip install yt-dlp`

6. Deploy the service

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

frontend && npm install -D vite @vitejs/plugin-react
npm install -D vitest jsdom @testing-library/react