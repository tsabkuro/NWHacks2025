// src/components/Categories.js
import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import api from '../api';

function Categories({ categories, addCategory }) {
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [parent, setParent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  function handleShow() {
    setErrorMessage('');
    setShowModal(true);
  }

  function handleClose() {
    setShowModal(false);
    setName('');
    setParent(null);
  }

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await addCategory(name, parent);
      handleClose();
    } catch (error) {
      console.error('Create category error:', error);
  
      // Extract and format the error messages
      let errorMessages = 'Failed to create category.';
      if (error.response && error.response.data) {
        const data = error.response.data;
  
        // Check if the response contains field-specific errors
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat() // Flatten nested arrays
            .map((msg) => msg.slice(0, 100)) // Truncate messages to 100 characters
            .join('\n'); // Join messages with newlines
        } else if (typeof data === 'string') {
          errorMessages = data.slice(0, 100); // Truncate string errors
        }
      } else if (error.message) {
        errorMessages = error.message.slice(0, 100); // Fallback to generic error
      }
  
      setErrorMessage(errorMessages); // Display the extracted messages
    }
  }

  return (
    <div>
      <h2>Categories</h2>
      <Table bordered hover>
        <thead>
          <tr>
            <th>Category Name</th>
            <th>Parent</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.parent_name || '--'}</td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={handleShow}>
        Add Category
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && (
            <div className="text-danger mb-3">{errorMessage}</div>
          )}
          <Form onSubmit={handleCreate}>
            <Form.Group className="mb-3">
              <Form.Label>Category Name</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Parent ID (optional)</Form.Label>
              <Form.Control
                type="number"
                value={parent || ''}
                onChange={(e) =>
                  setParent(e.target.value ? parseInt(e.target.value, 10) : null)
                }
              />
            </Form.Group>
            <Button
              type="submit"
              style={{ backgroundColor: '#4caf50', border: 'none' }}
            >
              Create
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Categories;