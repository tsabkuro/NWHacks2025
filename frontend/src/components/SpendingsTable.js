import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Alert, Modal } from 'react-bootstrap';
import api from '../api'; // Your Axios instance

const ITEMS_PER_PAGE = 50;

function SpendingsTable({ categories, addCategory }) {
  const [spendings, setSpendings] = useState([]);
  const [newSpending, setNewSpending] = useState({
    name: '',
    description: '',
    amount: '',
    date: '',
    category: null,
  });

  const [editSpendingId, setEditSpendingId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    amount: '',
    date: '',
    category: null,
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  // Fetch spendings on component mount
  useEffect(() => {
    fetchSpendings();
  }, []);

  async function fetchSpendings() {
    try {
      const response = await api.get('/transactions/spendings/');
      setSpendings(response.data);
    } catch (error) {
      console.error('Error fetching spendings:', error);
      setErrorMessage('Failed to fetch spendings.');
    }
  }

  // Create a new spending entry
  async function handleCreateSpending(e) {
    e.preventDefault();
    setErrorMessage('');
    try {
      await api.post('/transactions/spendings/', {
        ...newSpending,
        category: newSpending.category || null,
      });
      setNewSpending({ name: '', description: '', amount: '', date: '', category: null });
      fetchSpendings(); // Refresh spending list
    } catch (error) {
      console.error('Create spending error:', error);
      setErrorMessage('Failed to create spending.');
    }
  }

  // Start editing a spending entry
  function startEditing(spending) {
    setEditSpendingId(spending.id);
    setEditFormData({
      name: spending.name,
      description: spending.description || '',
      amount: spending.amount,
      date: spending.date,
      category: spending.category,
    });
  }

  // Cancel editing
  function cancelEditing() {
    setEditSpendingId(null);
    setEditFormData({ name: '', description: '', amount: '', date: '', category: null });
  }

  // Save edited spending entry
  async function saveEditing(spendingId) {
    setErrorMessage('');
    try {
      await api.patch(`/transactions/spendings/${spendingId}/`, {
        ...editFormData,
        category: editFormData.category || null,
      });
      setEditSpendingId(null);
      fetchSpendings();
    } catch (error) {
      console.error('Update spending error:', error);
      setErrorMessage('Failed to update spending.');
    }
  }

  // Handle category selection in the dropdown
  function handleSelectCategory(value, isEditMode = false) {
    if (value === 'ADD_CATEGORY') {
      setShowAddCategoryModal(true);
      return;
    }
    if (isEditMode) {
      setEditFormData({ ...editFormData, category: value || null });
    } else {
      setNewSpending({ ...newSpending, category: value || null });
    }
  }

    // Handle adding a new category
    async function handleAddCategory() {
        setErrorMessage('');
        try {
        await addCategory(newCategoryName, null);
        setNewCategoryName('');
        setShowAddCategoryModal(false);
        } catch (error) {
        console.error('Create category error:', error);
    
        // Extract and format the error messages
        let errorMessages = 'Failed to add category.';
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

  // Pagination logic
  const totalItems = spendings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  const currentSpendingSlice = spendings.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  function goToPreviousPage() {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  }

  function goToNextPage() {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  }

  return (
    <div className="container mt-4">
      <h2>Spendings</h2>

      {errorMessage && (
        <Alert variant="danger" style={{ whiteSpace: 'pre-wrap' }}>
          {errorMessage}
        </Alert>
      )}

      <Table bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentSpendingSlice.map((sp) => {
            const isEditing = editSpendingId === sp.id;
            if (isEditing) {
              return (
                <tr key={sp.id}>
                  <td>
                    <Form.Control
                      type="text"
                      value={editFormData.name}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, name: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="text"
                      value={editFormData.description}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, description: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={editFormData.amount}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, amount: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <Form.Control
                      type="date"
                      value={editFormData.date}
                      onChange={(e) =>
                        setEditFormData({ ...editFormData, date: e.target.value })
                      }
                    />
                  </td>
                  <td>
                    <Form.Select
                      value={editFormData.category || ''}
                      onChange={(e) => handleSelectCategory(e.target.value, true)}
                    >
                      <option value="">-- None --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                      <option value="ADD_CATEGORY">Add category...</option>
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      onClick={() => saveEditing(sp.id)}
                    >
                      Save
                    </Button>
                    <Button variant="secondary" size="sm" onClick={cancelEditing}>
                      Cancel
                    </Button>
                  </td>
                </tr>
              );
            }
            return (
              <tr key={sp.id}>
                <td>{sp.name}</td>
                <td>{sp.description}</td>
                <td>${sp.amount}</td>
                <td>{sp.date}</td>
                <td>{sp.category_name || <em>Uncategorized</em>}</td>
                <td>
                  <Button variant="primary" size="sm" onClick={() => startEditing(sp)}>
                    Edit
                  </Button>
                </td>
              </tr>
            );
          })}

          {/* Add new spending */}
          <tr>
            <td>
              <Form.Control
                type="text"
                placeholder="Name"
                value={newSpending.name}
                onChange={(e) => setNewSpending({ ...newSpending, name: e.target.value })}
              />
            </td>
            <td>
              <Form.Control
                type="text"
                placeholder="Description"
                value={newSpending.description}
                onChange={(e) =>
                  setNewSpending({ ...newSpending, description: e.target.value })
                }
              />
            </td>
            <td>
              <Form.Control
                type="number"
                step="0.01"
                placeholder="Amount"
                value={newSpending.amount}
                onChange={(e) =>
                  setNewSpending({ ...newSpending, amount: e.target.value })
                }
              />
            </td>
            <td>
              <Form.Control
                type="date"
                value={newSpending.date}
                onChange={(e) => setNewSpending({ ...newSpending, date: e.target.value })}
              />
            </td>
            <td>
              <Form.Select
                value={newSpending.category || ''}
                onChange={(e) => handleSelectCategory(e.target.value)}
              >
                <option value="">-- None --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
                <option value="ADD_CATEGORY">Add category...</option>
              </Form.Select>
            </td>
            <td>
              <Button variant="success" size="sm" onClick={handleCreateSpending}>
                Add
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="d-flex justify-content-between align-items-center">
          <Button
            variant="outline-primary"
            disabled={currentPage === 1}
            onClick={goToPreviousPage}
          >
            Previous
          </Button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline-primary"
            disabled={currentPage === totalPages}
            onClick={goToNextPage}
          >
            Next
          </Button>
        </div>
      )}

      {/* Add Category Modal */}
      <Modal show={showAddCategoryModal} onHide={() => setShowAddCategoryModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New Category</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Category Name</Form.Label>
            <Form.Control
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Food, Groceries..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddCategoryModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAddCategory}>
            Add Category
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default SpendingsTable;