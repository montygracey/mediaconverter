import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

function Home() {
  const { user } = useAuth();

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1>AnyMP3</h1>
        <p className="lead">
          Convert YouTube videos and SoundCloud tracks to MP3 format with ease.
        </p>
        {user ? (
          <Link to="/dashboard" className="btn btn-primary">
            Go to Dashboard
          </Link>
        ) : (
          <div>
            <Link to="/register" className="btn btn-primary">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>
              Login
            </Link>
          </div>
        )}
      </div>

      <div className="features">
        <div className="feature-card">
          <h3>YouTube to MP3</h3>
          <p>
            Convert YouTube videos to high quality MP3 audio files
            for offline listening.
          </p>
        </div>
        <div className="feature-card">
          <h3>SoundCloud to MP3</h3>
          <p>
            Download your favorite SoundCloud tracks as MP3 files to enjoy
            offline or add to your personal music collection.
          </p>
        </div>
        <div className="feature-card">
          <h3>Conversion History</h3>
          <p>
            Keep track of all your converted media with our convenient
            conversion history feature.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Home;