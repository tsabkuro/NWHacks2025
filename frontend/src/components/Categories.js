import React, { useState } from 'react';
import { Button, Modal, Form, Alert, Dropdown, DropdownButton } from 'react-bootstrap';

function Categories({ categories, addCategory, updateCategory, deleteCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [parent, setParent] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteCategoryId, setDeleteCategoryId] = useState(null);

  function handleShow(category = null) {
    setErrorMessage('');
    setShowModal(true);
    if (category) {
      setIsEditing(true);
      setSelectedCategory(category);
      setName(category.name);
      setParent(category.parent || null);
    } else {
      setIsEditing(false);
      setSelectedCategory(null);
      setName('');
      setParent(null);
    }
  }

  function handleClose() {
    setShowModal(false);
    setName('');
    setParent(null);
    setIsEditing(false);
    setSelectedCategory(null);
  }

  async function handleSave(e) {
    e.preventDefault();
    try {
      if (isEditing && selectedCategory) {
        await updateCategory(selectedCategory.id, { name, parent });
        setSuccessMessage('Category updated successfully.');
      } else {
        await addCategory(name, parent);
        setSuccessMessage('Category created successfully.');
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

  function confirmDelete(categoryId) {
    setShowDeleteModal(true);
    setDeleteCategoryId(categoryId);
  }

  async function handleDelete() {
    try {
      await deleteCategory(deleteCategoryId);
      setSuccessMessage('Category deleted successfully.');
      setShowDeleteModal(false);
      setDeleteCategoryId(null);
    } catch (error) {
      console.error('Delete category error:', error);
      setErrorMessage('Failed to delete category.');
    }
  }

  return (
    <div>
      <h2>Categories</h2>

      {/* Success Alert */}
      {successMessage && (
        <Alert
          variant="success"
          onClose={() => setSuccessMessage('')}
          dismissible
          className="mb-3"
        >
          {successMessage}
        </Alert>
      )}

      {/* Error Alert */}
      {errorMessage && (
        <Alert
          variant="danger"
          onClose={() => setErrorMessage('')}
          dismissible
          className="mb-3"
        >
          {errorMessage}
        </Alert>
      )}

      <DropdownButton
        id="category-dropdown"
        title={selectedCategory ? selectedCategory.name : 'Select a Category'}
        className="mb-3"
      >
        {categories.map((cat) => (
          <Dropdown.Item key={cat.id} onClick={() => setSelectedCategory(cat)}>
            {cat.name}
          </Dropdown.Item>
        ))}
      </DropdownButton>

      {selectedCategory && (
        <div className="category-details mb-2">
          <p>
            <strong>Category:</strong> {selectedCategory.name}
          </p>
          <p>
            <strong>Parent:</strong> {selectedCategory.parent_name || '--'}
          </p>
          <Button
            variant="primary"
            size="sm"
            className="me-2"
            onClick={() => handleShow(selectedCategory)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => confirmDelete(selectedCategory.id)}
          >
            Delete
          </Button>
        </div>
      )}

      <Button variant="success" onClick={() => handleShow()}>
        Add Category
      </Button>

      {/* Add/Edit Category Modal */}
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

      {/* Confirm Delete Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        backdrop="static"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this category? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Categories;