import React, { useState } from 'react';
import { useQuery, useMutation, gql } from '@apollo/client';

const GET_CONVERSIONS = gql`
  query GetConversions {
    getConversions {
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

const DELETE_CONVERSION = gql`
  mutation DeleteConversion($id: ID!) {
    deleteConversion(id: $id)
  }
`;

function ConversionHistory() {
  const { loading, error, data, refetch } = useQuery(GET_CONVERSIONS, {
    pollInterval: 3000, // Poll every 3 seconds to update status
    fetchPolicy: 'network-only', // Always get fresh data
    onCompleted: (data) => {
      console.log('Received updated conversion data:', data);
    }
  });
  
  const [deleteConversion] = useMutation(DELETE_CONVERSION, {
    onCompleted: () => {
      refetch();
    }
  });

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this conversion?')) {
      deleteConversion({
        variables: { id }
      });
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'status-completed';
      case 'processing':
        return 'status-processing';
      case 'failed':
        return 'status-failed';
      default:
        return '';
    }
  };

  const [refreshing, setRefreshing] = useState(false);

  if (loading) return <p>Loading conversion history...</p>;
  if (error) return <p>Error loading conversion history: {error.message}</p>;

  const handleManualRefresh = () => {
    setRefreshing(true);
    refetch().then(() => {
      setTimeout(() => setRefreshing(false), 500);
    });
  };

  return (
    <div className="conversion-history">
      <div className="history-header">
        <h2>Conversion History</h2>
        <button 
          className={`btn btn-primary refresh-btn ${refreshing ? 'refreshing' : ''}`}
          onClick={handleManualRefresh}
          disabled={refreshing}
        >
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>
      
      {data.getConversions.length === 0 ? (
        <p>No conversions yet.</p>
      ) : (
        <div className="history-list">
          {data.getConversions.map((conversion) => (
            <div key={conversion.id} className="history-item">
              <div className="history-item-details">
                <h3>{conversion.title || 'Untitled'}</h3>
                <p>
                  <strong>Source:</strong> {conversion.source.charAt(0).toUpperCase() + conversion.source.slice(1)} | 
                  <strong> Format:</strong> {conversion.format.toUpperCase()} | 
                  <strong> Date:</strong> {formatDate(conversion.createdAt)}
                </p>
                <p>
                  <strong>Status:</strong> 
                  <span className={`status-badge ${getStatusClass(conversion.status)}`}>
                    {conversion.status}
                    {conversion.status === 'processing' && 
                      <span className="loading-spinner"></span>
                    }
                  </span>
                </p>
              </div>
              <div className="history-item-actions">
                {conversion.status === 'completed' && conversion.filename && (
                  <a 
                    href={`/api/download/${conversion.filename}`} 
                    className="btn btn-success" 
                    download
                    onClick={(e) => {
                      // Check if file exists before trying to download
                      e.preventDefault();
                      console.log('Checking file existence for:', conversion.filename);
                      fetch(`/api/checkfile/${conversion.filename}`)
                        .then(res => {
                          console.log('File check response status:', res.status);
                          return res.json();
                        })
                        .then(data => {
                          console.log('File check data:', data);
                          if (data.exists) {
                            // If file exists, create a link and download
                            console.log('File exists, creating download link');
                            const downloadUrl = `/api/download/${conversion.filename}`;
                            
                            // Create an invisible link and click it to trigger download
                            const link = document.createElement('a');
                            link.href = downloadUrl;
                            link.setAttribute('download', conversion.filename);
                            link.setAttribute('target', '_blank');
                            document.body.appendChild(link);
                            link.click();
                            setTimeout(() => {
                              document.body.removeChild(link);
                            }, 100);
                          } else {
                            // If file doesn't exist, show error and refresh
                            console.log('File does not exist');
                            alert('File not available. The conversion may have completed but the file is not accessible.');
                            refetch();
                          }
                        })
                        .catch(err => {
                          console.error('Error checking file:', err);
                          alert('Error checking file availability: ' + err.message);
                        });
                    }}
                  >
                    Download
                  </a>
                )}
                {conversion.status === 'processing' && (
                  <button className="btn btn-secondary" disabled>
                    Processing...
                  </button>
                )}
                <button 
                  className="btn btn-danger" 
                  onClick={() => handleDelete(conversion.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConversionHistory;