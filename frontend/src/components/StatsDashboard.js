import React, { useMemo, useState } from "react";
import { Card, Row, Col, Container, Form, Button } from "react-bootstrap";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  Title,
  CategoryScale,
  LinearScale,
  BarElement
);

function StatsDashboard({ spendings }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedMonth, setSelectedMonth] = useState("All");
  const [showPie, setShowPie] = useState(true);
  const [showBar, setShowBar] = useState(true);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(["All"]);
    spendings.forEach((sp) => {
      cats.add(sp.category_name || "Uncategorized");
    });
    return [...cats];
  }, [spendings]);

  // Get unique months
  const months = useMemo(() => {
    const m = new Set(["All"]);
    spendings.forEach((sp) => {
      const month = new Date(sp.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      m.add(month);
    });
    return [...m];
  }, [spendings]);

  // Filter spendings based on user selection
  const filteredSpendings = useMemo(() => {
    return spendings.filter((sp) => {
      // Filter category
      const catName = sp.category_name || "Uncategorized";
      if (selectedCategory !== "All" && catName !== selectedCategory) {
        return false;
      }
      // Filter month
      const month = new Date(sp.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (selectedMonth !== "All" && month !== selectedMonth) {
        return false;
      }
      return true;
    });
  }, [spendings, selectedCategory, selectedMonth]);

  // 1) Aggregate spending by category
  const categorySums = useMemo(() => {
    const sums = {};
    filteredSpendings.forEach((sp) => {
      const cat = sp.category_name || "Uncategorized";
      if (!sums[cat]) sums[cat] = 0;
      sums[cat] += parseFloat(sp.amount);
    });
    return sums;
  }, [filteredSpendings]);

  // 2) Aggregate spending by month
  const monthlySums = useMemo(() => {
    const sums = {};
    filteredSpendings.forEach((sp) => {
      const month = new Date(sp.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!sums[month]) sums[month] = 0;
      sums[month] += parseFloat(sp.amount);
    });
    return sums;
  }, [filteredSpendings]);

  // Pie Chart Data
  const pieData = {
    labels: Object.keys(categorySums),
    datasets: [
      {
        label: "Spending by Category",
        data: Object.values(categorySums),
        backgroundColor: [
          "#FF6384",
          "#36A2EB",
          "#FFCE56",
          "#4caf50",
          "#f44336",
          "#9c27b0",
          "#ff9800",
          "#2196f3",
          "#795548",
          "#009688",
        ],
        hoverOffset: 4,
      },
    ],
  };

  const pieOptions = {
    plugins: {
      title: {
        display: true,
        text: "Spending by Category",
        font: { size: 16 },
      },
      legend: {
        position: "bottom",
      },
    },
  };

  // Bar Chart Data
  const barData = {
    labels: Object.keys(monthlySums),
    datasets: [
      {
        label: "Monthly Spending",
        data: Object.values(monthlySums),
        backgroundColor: "#4caf50",
        borderColor: "#4caf50",
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    plugins: {
      title: {
        display: true,
        text: "Monthly Spending Comparison",
        font: { size: 16 },
      },
      legend: {
        display: false,
      },
    },
    responsive: true,
    scales: {
      x: {
        title: {
          display: true,
          text: "Month",
        },
      },
      y: {
        title: {
          display: true,
          text: "Total Spending ($)",
        },
        beginAtZero: true,
      },
    },
  };

  return (
    <Container>
      <Card className="mb-5 shadow mt-5">
        <Card.Body>
          <h3 className="text-center text-success mb-4">Spending Dashboard</h3>

          {/* Filters */}
          <Row className="mb-4">
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Category</Form.Label>
                <Form.Select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Filter by Month</Form.Label>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Label>Show Charts</Form.Label>
              <div className="d-flex">
                <Form.Check
                  type="checkbox"
                  className="me-2"
                  label="Pie"
                  checked={showPie}
                  onChange={(e) => setShowPie(e.target.checked)}
                />
                <Form.Check
                  type="checkbox"
                  label="Bar"
                  checked={showBar}
                  onChange={(e) => setShowBar(e.target.checked)}
                />
              </div>
            </Col>
          </Row>

          <Row>
            {/* Pie Chart */}
            {showPie && (
              <Col md={6} className="mb-4">
                <h5 className="text-center">Spending by Category</h5>
                <Pie data={pieData} options={pieOptions} />
              </Col>
            )}
            {/* Bar Chart */}
            {showBar && (
              <Col md={6} className="mb-4">
                <h5 className="text-center">Monthly Spending Comparison</h5>
                <Bar data={barData} options={barOptions} />
              </Col>
            )}
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StatsDashboard;