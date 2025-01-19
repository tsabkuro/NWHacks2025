import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import api from '../api'; // Your Axios instance

function ReceiptUpload() {
  const [file, setFile] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function handleUpload(e) {
    e.preventDefault();
    if (!file) {
      setErrorMessage('Please select a file before uploading.');
      return;
    }
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post('/transactions/upload-receipt/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setSuccessMessage(response.data.message);
    } catch (error) {
      console.error('Upload error:', error);
      setErrorMessage('Failed to upload receipt.');
    }
  }

  return (
    <div className="mt-4">
      <h4>Upload a Receipt</h4>
      {errorMessage && <Alert variant="danger">{errorMessage}</Alert>}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Form onSubmit={handleUpload}>
        <Form.Group controlId="formFile" className="mb-3">
          <Form.Label>Select a receipt image</Form.Label>
          <Form.Control
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            accept="image/*"
          />
        </Form.Group>
        <Button type="submit" variant="primary">
          Upload
        </Button>
      </Form>
    </div>
  );
}

export default ReceiptUpload;