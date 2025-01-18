import React, { useEffect, useState } from 'react';
import api from '../api';

function Categories() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState('');
  const [parent, setParent] = useState(null);

  async function fetchCategories() {
    try {
      const response = await api.get('/transactions/categories/');
      setCategories(response.data);
    } catch (error) {
      console.error('Fetch categories error:', error);
    }
  }

  useEffect(() => {
    fetchCategories();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/transactions/categories/', {
        name,
        parent, // if parent is null or a number
      });
      setName('');
      setParent(null);
      // re-fetch the list
      fetchCategories();
    } catch (error) {
      console.error('Create category error:', error);
      alert('Failed to create category');
    }
  }

  return (
    <div>
      <h2>Categories</h2>
      <ul>
        {categories.map(cat => (
          <li key={cat.id}>
            {cat.name} {cat.parent_name && <span> (sub of {cat.parent_name})</span>}
          </li>
        ))}
      </ul>

      <h3>Create a new category</h3>
      <form onSubmit={handleCreate}>
        <div>
          <label>Name:</label>
          <input 
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label>Parent ID (optional):</label>
          <input 
            type="number"
            value={parent || ''}
            onChange={e => setParent(e.target.value ? parseInt(e.target.value, 10) : null)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default Categories;