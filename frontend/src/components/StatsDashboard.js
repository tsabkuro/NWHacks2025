import React, { useMemo } from "react";
import { Card, Row, Col, Container } from "react-bootstrap";
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

// Register necessary chart components
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
  // Aggregate spending by category
  const categorySums = useMemo(() => {
    const sums = {};
    spendings.forEach((sp) => {
      const cat = sp.category_name || "Uncategorized";
      if (!sums[cat]) sums[cat] = 0;
      sums[cat] += parseFloat(sp.amount);
    });
    return sums;
  }, [spendings]);

  // Aggregate spending by month
  const monthlySums = useMemo(() => {
    const sums = {};
    spendings.forEach((sp) => {
      const month = new Date(sp.date).toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!sums[month]) sums[month] = 0;
      sums[month] += parseFloat(sp.amount);
    });
    return sums;
  }, [spendings]);

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
          <Row>
            {/* Pie Chart */}
            <Col md={6} className="mb-4">
              <h5 className="text-center">Spending by Category</h5>
              <Pie data={pieData} options={pieOptions} />
            </Col>
            {/* Bar Chart */}
            <Col md={6} className="mb-4">
              <h5 className="text-center">Monthly Spending Comparison</h5>
              <Bar data={barData} options={barOptions} />
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default StatsDashboard;