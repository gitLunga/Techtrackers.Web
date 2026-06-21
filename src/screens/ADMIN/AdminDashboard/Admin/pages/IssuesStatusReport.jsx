import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const IssueReport = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { startDate, endDate } = state || {};

  const [tableData, setTableData] = useState([]); // Holds issue reports
  const [chartData, setChartData] = useState({
    labels: ["Open", "In Progress", "Resolved", "Escalated", "On Hold"],
    datasets: [
      {
        label: "Issue Status Distribution",
        data: [0, 0, 0, 0, 0], // Initial empty values
        backgroundColor: ["#8FD3DF", "#56A9CB", "#023030", "#FFC107", "#E91E63"],
      },
    ],
  });

  // Fetch Issue Report Data
  useEffect(() => {
    const fetchIssueReport = async () => {
      try {
        const response = await fetch(
          "https://localhost:44328/api/GenerateReport/GetIssueByStatusReport"
        );
        if (response.ok) {
          const data = await response.json();
          setTableData(data);
        } else {
          console.error("Failed to fetch issue report.");
        }
      } catch (error) {
        console.error("Error fetching issue report:", error);
      }
    };

    fetchIssueReport();
  }, []);

  // Fetch Issue Status Count Data (for Graphs)
  useEffect(() => {
    const fetchIssueStatusCount = async () => {
      try {
        const response = await fetch(
          "https://localhost:44328/api/GenerateReport/GetIssueStatusCount"
        );
        if (response.ok) {
          const data = await response.json();

          console.log(data);

          setChartData({
            labels: ["Open", "In Progress", "Resolved", "Escalated", "On Hold"],
            datasets: [
              {
                label: "Issue Status Distribution",
                data: [
                  data.open || 0,
                  data.inProgress || 0,
                  data.completed || 0,
                  data.escalated || 0,
                  data.onHold || 0,
                ],
                backgroundColor: [
                  "#8FD3DF",
                  "#56A9CB",
                  "#023030",
                  "#FFC107",
                  "#E91E63",
                ],
              },
            ],
          });
        } else {
          console.error("Failed to fetch issue status count.");
        }
      } catch (error) {
        console.error("Error fetching issue status count:", error);
      }
    };

    fetchIssueStatusCount();
  }, []);

  // Export Report as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Issue Report", 20, 10);
    doc.autoTable({
      startY: 20,
      head: [
        [
          "Log ID",
          "Issue Title",
          "Priority",
          "Technician",
          "Status",
          "Date Created",
          "Due Date",
          "Date Closed",
        ],
      ],
      body: tableData.map((row) => Object.values(row)),
    });
    doc.save("issue_report.pdf");
  };

  // Export Report as Excel
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tableData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Issue Report");
    XLSX.writeFile(wb, "issue_report.xlsx");
  };

  return (
    <div style={{ padding: "20px", marginTop: "-10px" }}>
      <h1 style={{ textAlign: "center" }}>Issue By Status Report</h1>
      <p style={{ textAlign: "center" }}>
        Date report was generated: {startDate || "N/A"} to {endDate || "N/A"}
      </p>

      {/* Table Section */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Log ID</TableCell>
              <TableCell>Issue Title</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Technician</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date Created</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell>Date Closed</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                key={index}
                style={{
                  backgroundColor: row.status === "RESOLVED" ? "#E2F0D9" : "white",
                }}
              >
                <TableCell>{row.logId}</TableCell>
                <TableCell>{row.issueTitle}</TableCell>
                <TableCell>{row.priority}</TableCell>
                <TableCell>{row.technician}</TableCell>
                <TableCell>{row.status}</TableCell>
                <TableCell>{row.dateCreated}</TableCell>
                <TableCell>{row.dueDate}</TableCell>
                <TableCell>{row.dateClosed}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Charts Section */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginTop: "40px",
        }}
      >
        <div style={{ width: "45%" }}>
          <Bar data={chartData} />
        </div>
        <div>
          <Pie data={chartData} />
        </div>
      </div>

      {/* Export & Navigation Buttons */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "30px",
        }}
      >
        <button
          onClick={() => navigate(-1)} // Navigate back to the previous page
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "10px 20px",
            border: "none",
            cursor: "pointer",
          }}
        >
          BACK
        </button>

        <div>
          <button
            onClick={exportPDF}
            style={{
              backgroundColor: "#005A50",
              color: "white",
              padding: "10px 20px",
              marginRight: "10px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Export PDF
          </button>
          <button
            onClick={exportExcel}
            style={{
              backgroundColor: "#333",
              color: "white",
              padding: "10px 20px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Export Excel
          </button>
        </div>
      </div>
    </div>
  );
};

export default IssueReport;
