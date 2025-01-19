import React, { useEffect, useState } from 'react';
import { Table, Button, Form, Alert } from 'react-bootstrap';
import api from '../api'; // Your axios instance

const ITEMS_PER_PAGE = 50;

function SpendingsTable() {
  // State for all spendings
  const [spendings, setSpendings] = useState([]);
  // State for categories to populate dropdowns
  const [categories, setCategories] = useState([]);
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  // Error message state (for display in a Bootstrap Alert)
  const [errorMessage, setErrorMessage] = useState('');

  // New Spending Form State
  const [newSpending, setNewSpending] = useState({
    name: '',
    amount: '',
    date: '',
    category: null,
  });

  // Track which spending is being edited
  // If editSpendingId === sp.id, that row is in "edit mode."
  const [editSpendingId, setEditSpendingId] = useState(null);
  // Editable fields for the spending in edit mode
  const [editFormData, setEditFormData] = useState({
    name: '',
    amount: '',
    date: '',
    category: null,
  });

  // Fetch categories & spendings on mount
  useEffect(() => {
    fetchCategories();
    fetchSpendings();
  }, []);

  // --- API Calls ---
  async function fetchCategories() {
    try {
      const response = await api.get('/transactions/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
      setErrorMessage('Failed to load categories.');
    }
  }

  async function fetchSpendings() {
    try {
      const response = await api.get('/transactions/spendings/');
      setSpendings(response.data);
    } catch (error) {
      console.error('Fetch spendings error:', error);
      setErrorMessage('Failed to load spendings.');
    }
  }

  // --- Create Spending ---
  async function handleCreateSpending(e) {
    e.preventDefault();
    setErrorMessage(''); // Clear any old error

    try {
      await api.post('/transactions/spendings/', {
        ...newSpending,
        // if category is empty string or null, ensure we send null
        category: newSpending.category || null,
      });
      // Clear the new form
      setNewSpending({ name: '', amount: '', date: '', category: null });
      // Refresh the list
      fetchSpendings();
    } catch (error) {
      console.error('Create spending error:', error);
      setErrorMessage(extractErrorMessage(error, 'Failed to create spending.'));
    }
  }

  // --- Edit Spending ---
  function startEditing(spending) {
    setEditSpendingId(spending.id);
    setEditFormData({
      name: spending.name,
      amount: spending.amount,
      date: spending.date,
      category: spending.category || null, // if null, no category
    });
    setErrorMessage('');
  }

  function cancelEditing() {
    setEditSpendingId(null);
    setEditFormData({ name: '', amount: '', date: '', category: null });
  }

  async function saveEditing(spendingId) {
    setErrorMessage('');
    try {
      await api.patch(`/transactions/spendings/${spendingId}/`, {
        ...editFormData,
        category: editFormData.category || null,
      });
      setEditSpendingId(null);
      // Refresh list
      fetchSpendings();
    } catch (error) {
      console.error('Update spending error:', error);
      setErrorMessage(extractErrorMessage(error, 'Failed to update spending.'));
    }
  }

  // --- Helpers ---
  // Simple function to extract multiple possible errors from the API
  function extractErrorMessage(error, fallback) {
    let msg = fallback;
    if (error.response && error.response.data) {
      const data = error.response.data;
      if (typeof data === 'object') {
        // Flatten all field errors
        msg = Object.values(data)
          .flat()
          .map((m) => m.slice(0, 80)) // up to 80 chars if you prefer
          .join('\n');
      } else if (typeof data === 'string') {
        msg = data.slice(0, 80);
      }
    } else if (error.message) {
      msg = error.message.slice(0, 80);
    }
    return msg;
  }

  // Pagination logic
  const totalItems = spendings.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);

  // Get the spendings for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentSpendingSlice = spendings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  function goToPreviousPage() {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }

  function goToNextPage() {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  }

  return (
    <div className="container mt-4">
      <h2>Spendings</h2>

      {errorMessage && (
        <Alert variant="danger" style={{ whiteSpace: 'pre-wrap' }}>
          {errorMessage}
        </Alert>
      )}

      {/* Spendings Table */}
      <Table bordered hover>
        <thead>
          <tr>
            <th>Name</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Category</th>
            <th style={{ width: '130px' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentSpendingSlice.map((sp) => {
            const isEditing = editSpendingId === sp.id;
            if (isEditing) {
              // Edit mode row
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
                      onChange={(e) =>
                        setEditFormData({
                          ...editFormData,
                          category: e.target.value || null,
                        })
                      }
                    >
                      <option value="">-- None --</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </Form.Select>
                  </td>
                  <td>
                    <Button
                      variant="success"
                      size="sm"
                      className="me-2"
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
            } else {
              // Read-only row
              return (
                <tr key={sp.id}>
                  <td>{sp.name}</td>
                  <td>${sp.amount}</td>
                  <td>{sp.date}</td>
                  <td>
                    {sp.category_name ? sp.category_name : <em>Uncategorized</em>}
                  </td>
                  <td>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => startEditing(sp)}
                    >
                      Edit
                    </Button>
                  </td>
                </tr>
              );
            }
          })}

          {/* Row for Adding a New Spending */}
          <tr>
            <td>
              <Form.Control
                type="text"
                placeholder="Name"
                value={newSpending.name}
                onChange={(e) =>
                  setNewSpending({ ...newSpending, name: e.target.value })
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
                onChange={(e) =>
                  setNewSpending({ ...newSpending, date: e.target.value })
                }
              />
            </td>
            <td>
              <Form.Select
                value={newSpending.category || ''}
                onChange={(e) =>
                  setNewSpending({
                    ...newSpending,
                    category: e.target.value || null,
                  })
                }
              >
                <option value="">-- None --</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
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
    </div>
  );
}

export default SpendingsTable;