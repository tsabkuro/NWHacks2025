import React, { useEffect, useState } from 'react';
import api from '../api';

function Spendings() {
  const [spendings, setSpendings] = useState([]);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState(null);

  async function fetchSpendings() {
    try {
      const response = await api.get('/transactions/spendings/');
      setSpendings(response.data);
    } catch (error) {
      console.error('Fetch spendings error:', error);
    }
  }

  useEffect(() => {
    fetchSpendings();
  }, []);

  async function handleCreate(e) {
    e.preventDefault();
    try {
      await api.post('/transactions/spendings/', {
        name,
        amount,
        date,
        category,
      });
      setName('');
      setAmount('');
      setDate('');
      setCategory(null);
      fetchSpendings();
    } catch (error) {
      console.error('Create spending error:', error);
      alert('Failed to create spending');
    }
  }

  return (
    <div>
      <h2>Spendings</h2>
      <ul>
        {spendings.map(sp => (
          <li key={sp.id}>
            {sp.name} - ${sp.amount} on {sp.date} 
            {sp.category_name ? ` (Category: ${sp.category_name})` : ' (Uncategorized)'}
          </li>
        ))}
      </ul>

      <h3>Create a new spending</h3>
      <form onSubmit={handleCreate}>
        <div>
          <label>Name:</label>
          <input 
            value={name}
            onChange={e => setName(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Amount:</label>
          <input 
            type="number"
            step="0.01"
            value={amount}
            onChange={e => setAmount(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Date:</label>
          <input 
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)} 
            required
          />
        </div>
        <div>
          <label>Category ID (optional):</label>
          <input 
            type="number"
            value={category || ''}
            onChange={e => setCategory(e.target.value ? parseInt(e.target.value, 10) : null)}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
}

export default Spendings;