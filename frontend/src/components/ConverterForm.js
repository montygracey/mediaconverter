import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';

const CREATE_CONVERSION = gql`
  mutation CreateConversion($url: String!, $source: String!, $format: String!) {
    createConversion(conversionInput: { url: $url, source: $source, format: $format }) {
      id
      url
      source
      format
      title
      filename
      status
      createdAt
    }
  }
`;

function ConverterForm({ onConversionComplete }) {
  const [url, setUrl] = useState('');
  const [source, setSource] = useState('youtube');
  const [format, setFormat] = useState('mp3');  // Only MP3 is supported now
  const [errors, setErrors] = useState({});

  const [createConversion, { loading }] = useMutation(CREATE_CONVERSION, {
    onCompleted: (data) => {
      setUrl('');
      if (onConversionComplete) {
        onConversionComplete(data.createConversion);
      }
    },
    onError: (err) => {
      setErrors({ general: err.message });
    }
  });

  const validateForm = () => {
    const newErrors = {};
    if (!url.trim()) {
      newErrors.url = 'URL is required';
    } else if (source === 'youtube' && !url.includes('youtube.com') && !url.includes('youtu.be')) {
      newErrors.url = 'Not a valid YouTube URL';
    } else if (source === 'soundcloud' && !url.includes('soundcloud.com')) {
      newErrors.url = 'Not a valid SoundCloud URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      createConversion({
        variables: {
          url,
          source,
          format
        }
      });
    }
  };

  const detectSource = (inputUrl) => {
    setUrl(inputUrl);
    if (inputUrl.includes('youtube.com') || inputUrl.includes('youtu.be')) {
      setSource('youtube');
    } else if (inputUrl.includes('soundcloud.com')) {
      setSource('soundcloud');
    }
  };

  return (
    <div className="card converter-card">
      <h2>Convert Media</h2>
      {errors.general && (
        <div className="alert alert-danger">{errors.general}</div>
      )}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="url">Media URL</label>
          <input
            type="url"
            id="url"
            placeholder="Enter YouTube or SoundCloud URL"
            value={url}
            onChange={(e) => detectSource(e.target.value)}
            className={errors.url ? 'is-invalid' : ''}
          />
          {errors.url && <small className="form-text text-danger">{errors.url}</small>}
        </div>
        
        <div className="form-group">
          <label htmlFor="source">Source</label>
          <select
            id="source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
          >
            <option value="youtube">YouTube</option>
            <option value="soundcloud">SoundCloud</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="format">Format</label>
          <select
            id="format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
          >
            <option value="mp3">MP3</option>
          </select>
        </div>
        
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Converting...' : 'Convert'}
        </button>
      </form>
    </div>
  );
}

export default ConverterForm;