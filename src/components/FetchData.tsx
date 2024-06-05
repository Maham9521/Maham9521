import React, { useState, useEffect } from 'react';
import axios from 'axios';

const FetchData: React.FC = () => {
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    axios.get('http://localhost:5000/api')
      .then(response => {
        setMessage(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div>
      <h1>{message}</h1>
    </div>
  );
};

export default FetchData;
