import React, { useState } from 'react';
import { Table, Button, Modal, Form } from 'react-bootstrap';

function Categories({ categories, addCategory, updateCategory, deleteCategory }) {
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentCategory, setCurrentCategory] = useState(null);
  const [name, setName] = useState('');
  const [parent, setParent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  function handleShow(category = null) {
    setErrorMessage('');
    setShowModal(true);
    if (category) {
      // If editing, set fields with the selected category's data
      setIsEditing(true);
      setCurrentCategory(category);
      setName(category.name);
      setParent(category.parent || null);
    } else {
      // If creating, reset fields
      setIsEditing(false);
      setCurrentCategory(null);
      setName('');
      setParent(null);
    }
  }

  function handleClose() {
    setShowModal(false);
    setName('');
    setParent(null);
    setIsEditing(false);
    setCurrentCategory(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (isEditing && currentCategory) {
        // Update an existing category
        await updateCategory(currentCategory.id, { name, parent });
      } else {
        // Create a new category
        await addCategory(name, parent);
      }
      handleClose();
    } catch (error) {
      console.error('Category save error:', error);
      let errorMessages = 'Failed to save category.';
      if (error.response && error.response.data) {
        const data = error.response.data;
        if (typeof data === 'object') {
          errorMessages = Object.values(data)
            .flat()
            .map((msg) => msg.slice(0, 100))
            .join('\n');
        } else if (typeof data === 'string') {
          errorMessages = data.slice(0, 100);
        }
      } else if (error.message) {
        errorMessages = error.message.slice(0, 100);
      }
      setErrorMessage(errorMessages);
    }
  }

  async function handleDelete(categoryId) {
    try {
      await deleteCategory(categoryId);
    } catch (error) {
      console.error('Delete category error:', error);
      setErrorMessage('Failed to delete category.');
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.parent_name || '--'}</td>
              <td>
                <Button
                  variant="primary"
                  size="sm"
                  className="me-2"
                  onClick={() => handleShow(cat)}
                >
                  Edit
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleDelete(cat.id)}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Button variant="success" onClick={() => handleShow()}>
        Add Category
      </Button>

      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditing ? 'Edit Category' : 'Add New Category'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {errorMessage && <div className="text-danger mb-3">{errorMessage}</div>}
          <Form onSubmit={handleSave}>
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
              {isEditing ? 'Save Changes' : 'Create'}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Categories;