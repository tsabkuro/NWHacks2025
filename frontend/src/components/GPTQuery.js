import React, { useState } from "react";
import { Button, Form, Spinner, Alert } from "react-bootstrap";

function GPTQuery({ token }) {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleQuery() {
    setLoading(true);
    setResponse("");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/transactions/gpt-query/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) {
        setResponse(`Error: ${data.error || "Unknown error"}`);
      } else {
        setResponse(data.result || JSON.stringify(data, null, 2));
      }
    } catch (err) {
      setResponse(`Network error: ${err.message}`);
    }
    setLoading(false);
  }

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto" }}>
      <h3>Ask our AI bot about your spendings</h3>
      <Form.Group className="mb-3">
        <Form.Label>Query</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="How much did I spend on groceries this month?"
        />
      </Form.Group>
      <Button variant="primary" onClick={handleQuery} disabled={loading}>
        {loading ? <Spinner animation="border" size="sm" /> : "Ask"}
      </Button>
      {response && (
        <Alert variant="info" className="mt-3" style={{ whiteSpace: "pre-wrap" }}>
          {response}
        </Alert>
      )}
    </div>
  );
}

export default GPTQuery;