import React from 'react';
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
  const { loading, error, data, refetch } = useQuery(GET_CONVERSIONS);
  
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

  if (loading) return <p>Loading conversion history...</p>;
  if (error) return <p>Error loading conversion history: {error.message}</p>;

  return (
    <div className="conversion-history">
      <h2>Conversion History</h2>
      
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
                  </span>
                </p>
              </div>
              <div className="history-item-actions">
                {conversion.status === 'completed' && conversion.filename && (
                  <a 
                    href={`http://localhost:5000/${conversion.filename}`} 
                    className="btn btn-success" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download
                  >
                    Download
                  </a>
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