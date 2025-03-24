const { PythonShell } = require('python-shell');
const path = require('path');

/**
 * Convert media using Python script
 * @param {string} url - URL of the media to convert
 * @param {string} source - Source platform (youtube, soundcloud)
 * @param {string} format - Output format (mp3, mp4)
 * @param {string} conversionId - Unique ID for the conversion
 * @returns {Promise<Object>} - Result of the conversion
 */
const convertMedia = (url, source, format, conversionId) => {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonPath: process.env.PYTHON_PATH || 'python3',
      pythonOptions: ['-u'], // unbuffered output
      scriptPath: path.join(__dirname, '../../python'),
      args: [url, format, conversionId]
    };
    
    PythonShell.run('converter.py', options, (err, results) => {
      if (err) {
        console.error('Python error:', err);
        return reject(err);
      }
      
      try {
        // Parse the JSON output from Python
        const result = JSON.parse(results[0]);
        resolve(result);
      } catch (error) {
        console.error('Error parsing Python result:', error);
        reject(new Error('Failed to parse conversion result'));
      }
    });
  });
};

module.exports = {
  convertMedia
};