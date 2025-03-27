import React, { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import ConverterForm from '../components/ConverterForm';
import ConversionHistory from '../components/ConversionHistory';
import { useAuth } from '../context/authContext';

const GET_USER = gql`
  query GetUser {
    getUser {
      id
      username
      email
      createdAt
      conversionCount
    }
  }
`;

function Dashboard() {
  const { user } = useAuth();
  const [latestConversion, setLatestConversion] = useState(null);
  const { loading, error, data } = useQuery(GET_USER);

  const handleConversionComplete = (conversion) => {
    setLatestConversion(conversion);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {data.getUser.username}!</h1>
        <div>
          <p>Total Conversions: {data.getUser.conversionCount}</p>
        </div>
      </div>

      <ConverterForm onConversionComplete={handleConversionComplete} />

      {latestConversion && (
        <div className="card mb-2">
          <h3>Conversion Status: {latestConversion.status}</h3>
          {latestConversion.status === 'completed' && (
            <div>
              <p><strong>Title:</strong> {latestConversion.title || 'Untitled'}</p>
              <p><strong>Format:</strong> {latestConversion.format.toUpperCase()}</p>
              {latestConversion.filename && (
                <a 
                  href="#" 
                  className="btn btn-success" 
                  onClick={(e) => {
                    e.preventDefault();
                    // Check if file exists first
                    fetch(`/api/checkfile/${latestConversion.filename}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.exists) {
                          // If file exists, create a link and download
                          const downloadUrl = `/api/download/${latestConversion.filename}`;
                          
                          // Create an invisible link and click it to trigger download
                          const link = document.createElement('a');
                          link.href = downloadUrl;
                          link.setAttribute('download', latestConversion.filename); 
                          link.setAttribute('target', '_blank'); 
                          document.body.appendChild(link);
                          link.click();
                          setTimeout(() => {
                            document.body.removeChild(link);
                          }, 100);
                        } else {
                          alert('File not available yet. Please try again in a moment.');
                        }
                      })
                      .catch(err => {
                        console.error('Error checking file:', err);
                        alert('Error checking file availability.');
                      });
                  }}
                >
                  Download File
                </a>
              )}
            </div>
          )}
          {latestConversion.status === 'failed' && (
            <p className="text-danger">Conversion failed. Please try again.</p>
          )}
          {latestConversion.status === 'processing' && (
            <p>Your conversion is processing. This may take a moment...</p>
          )}
        </div>
      )}

      <ConversionHistory />
    </div>
  );
}

export default Dashboard;