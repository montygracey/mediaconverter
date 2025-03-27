require('dotenv').config();
const express = require('express');
const { ApolloServer } = require('@apollo/server');
const { expressMiddleware } = require('@apollo/server/express4');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');
const auth = require('./middleware/auth');

async function startServer() {
  const app = express();

  // Connect to MongoDB
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  }

  // Setup Apollo Server
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  await server.start();

  // Enable CORS for all routes - should come before other middleware
  app.use(cors({
    origin: '*', // Allow all origins for testing
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));

  // Add body parsing middleware
  app.use(express.json());
  
  // Auth middleware
  app.use(auth);

  // Static files middleware - serve the downloads folder
  const downloadsPath = path.join(__dirname, '../python/downloads');
  console.log(`Serving static files from: ${downloadsPath}`);
  
  // Log the contents of the downloads directory
  try {
    const files = require('fs').readdirSync(downloadsPath);
    console.log('Files in downloads directory:', files);
  } catch (err) {
    console.error('Error reading downloads directory:', err);
  }
  
  // Set up static file serving with explicit content disposition header
  app.use(express.static(downloadsPath, {
    setHeaders: (res, filePath) => {
      // Set content disposition to attachment to force download
      const filename = path.basename(filePath);
      const encodedFilename = encodeURIComponent(filename);
      res.set('Content-Disposition', `attachment; filename=${encodedFilename}`);
      
      // Set appropriate content type based on extension
      if (path.extname(filePath) === '.mp3') {
        res.set('Content-Type', 'audio/mpeg');
      } else if (path.extname(filePath) === '.mp4') {
        res.set('Content-Type', 'video/mp4');
      } else {
        res.set('Content-Type', 'application/octet-stream');
      }
    }
  }));
  
  // Add a route to check for file existence
  app.get('/api/checkfile/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsPath, filename);
    
    console.log(`Checking if file exists: ${filePath}`);
    
    try {
      if (require('fs').existsSync(filePath)) {
        console.log(`File exists: ${filePath}`);
        res.json({ exists: true, path: filePath });
      } else {
        console.log(`File does not exist: ${filePath}`);
        res.json({ exists: false });
      }
    } catch (err) {
      console.error(`Error checking file ${filename}:`, err);
      res.status(500).json({ error: err.message });
    }
  });
  
  // Add a dedicated download endpoint for better control
  app.get('/api/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(downloadsPath, filename);
    
    console.log(`Download request for: ${filePath}`);
    
    try {
      if (require('fs').existsSync(filePath)) {
        console.log(`Sending file: ${filePath}`);
        
        // Use res.download which properly handles Content-Disposition
        res.download(filePath, filename, (err) => {
          if (err) {
            console.error(`Error during download: ${err}`);
            // If headers already sent, we can't send a JSON response here
            if (!res.headersSent) {
              res.status(500).json({ error: 'Download failed' });
            }
          }
        });
      } else {
        console.log(`File not found: ${filePath}`);
        res.status(404).json({ error: 'File not found' });
      }
    } catch (err) {
      console.error(`Error downloading file ${filename}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  // Apply middleware for GraphQL
  app.use(
    '/graphql',
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ req })
    })
  );

  // Serve static assets in production
  if (process.env.NODE_ENV === 'production') {
    // Try multiple possible paths where the build might be located
    const possiblePaths = [
      
      path.join(__dirname, '../frontend/dist'),
      path.join(__dirname, '../build'),
      path.join(__dirname, '../dist')
    ];
    
    let clientPath = null;
    
    // Find the first path that exists and contains an index.html
    for (const testPath of possiblePaths) {
      console.log('Checking for build at:', testPath);
      try {
        if (require('fs').existsSync(testPath)) {
          const files = require('fs').readdirSync(testPath);
          console.log(`Files in ${testPath}:`, files);
          
          if (files.includes('index.html')) {
            clientPath = testPath;
            console.log('Found build directory with index.html at:', clientPath);
            break;
          }
        }
      } catch (err) {
        console.error(`Error reading directory ${testPath}:`, err);
      }
    }
    
    if (!clientPath) {
      console.error('Could not find any build directory with index.html');
      clientPath = path.join(__dirname, '../frontend/build'); // Fallback to the expected path
    }
    
    console.log('Serving static files from:', clientPath);
    app.use(express.static(clientPath));

    app.get('*', (req, res) => {
      const indexPath = path.join(clientPath, 'index.html');
      console.log('Trying to serve:', indexPath);
      
      if (require('fs').existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        console.error('index.html not found at', indexPath);
        res.status(404).send('Build file not found - deployment issue. Please check server logs.');
      }
    });
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`GraphQL endpoint: http://localhost:${PORT}/graphql`);
  });
}

startServer().catch(err => {
  console.error('Server startup error:', err);
  process.exit(1);
});