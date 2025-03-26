const { PythonShell } = require('python-shell');
const path = require('path');

/**
 * Convert media using Python script
 * @param {string} url - URL of the media to convert
 * @param {string} source - Source platform (youtube, soundcloud)
 * @param {string} format - Output format (mp3)
 * @param {string} conversionId - Unique ID for the conversion
 * @returns {Promise<Object>} - Result of the conversion
 */
const convertMedia = (url, source, format, conversionId) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: process.env.PYTHON_PATH || 'python', // Try 'python' instead of 'python3'
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.join(__dirname, '../../python'),
      args: [url, format, conversionId],
      // Increase timeout to allow for larger files
      stderrParser: (line) => {
        console.log('Python stderr:', line);
        return line;
      }
    };
    
    console.log(`Starting conversion for ${url} to ${format} with ID: ${conversionId}`);
    console.log(`Using Python path: ${options.pythonPath}`);
    
    // Start the Python process
    const pyshell = new PythonShell('converter.py', options);
    
    // Handle output line by line
    let resultData = '';
    
    pyshell.on('message', (message) => {
      console.log('Python output:', message);
      // Only process lines that look like JSON
      if (message.trim().startsWith('{') && message.trim().endsWith('}')) {
        resultData = message;
      }
    });
    
    pyshell.on('error', (err) => {
      console.error('Python error:', err);
      reject(err);
    });
    
    pyshell.on('close', () => {
      console.log('Python process closed');
      try {
        // Check if we have valid JSON data
        if (resultData && resultData.trim()) {
          // Parse the JSON output from Python
          const result = JSON.parse(resultData);
          console.log('Parsed result from Python:', result);
          resolve(result);
        } else {
          // If no valid JSON was received, create a fallback result
          console.error('No valid JSON result received from Python');
          const fallbackResult = {
            success: false,
            title: 'Unknown',
            filename: null,
            error: 'No valid result received from Python script'
          };
          resolve(fallbackResult);
        }
      } catch (error) {
        console.error('Error parsing Python result:', error, 'Raw data:', resultData);
        reject(new Error('Failed to parse conversion result'));
      }
    });
  });
};

module.exports = {
  convertMedia
};