import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

const MonthlyGenerateReport = () => {
  const { state } = useLocation();
  const { startDate, endDate } = state || {};
  const navigate = useNavigate();

  const [tableData, setTableData] = useState([]);
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] });
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/MonthlySummaryReport/GetMonthlySummaryReport");
        if (response.ok) {
          const data = await response.json();
          setTableData(data);

          // Update Bar Chart Data
          setBarChartData({
            labels: data.map((row) => row.month),
            datasets: [
              {
                label: "Total Issues",
                data: data.map((row) => row.totalIssues),
                backgroundColor: ["#003b36", "#3cb4ac", "#aecfd6", "#015e4d"],
              },
            ],
          });

          // Update Pie Chart Data
          setPieChartData({
            labels: data.map((row) => row.month),
            datasets: [
              {
                label: "Issues Open",
                data: data.map((row) => row.issuesOpen),
                backgroundColor: ["#005A50", "#20B2AA", "#7FC9C9", "#014f43"],
              },
            ],
          });

        } else {
          console.error("Failed to fetch report data.");
        }
      } catch (error) {
        console.error("Error fetching report data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyReport();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Monthly Issue Report", 10, 10);
    doc.autoTable({
      head: [["Month", "Total Issues", "Issues Closed", "Issues Open", "Average Resolution Time"]],
      body: tableData.map((row) => [row.month, row.totalIssues, row.issuesClosed, row.issuesOpen, row.avgResolution]),
    });
    doc.save("monthly_report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Issue Report");
    XLSX.writeFile(workbook, "monthly_report.xlsx");
  };

  return (
    <div style={{ padding: "20px", backgroundColor: "#E5F0EC", marginTop: "-10px" }}>
      <h1 style={{ textAlign: "center" }}>Monthly Issue Report</h1>
      <p style={{ textAlign: "center" }}>Date Range: {startDate || "Start Date"} to {endDate || "End Date"}</p>

      {loading ? (
        <p style={{ textAlign: "center" }}>Loading report...</p>
      ) : (
        <>
          <TableContainer component={Paper} style={{ margin: "20px auto", maxWidth: 800 }}>
            <Table>
              <TableHead>
                <TableRow style={{ backgroundColor: "#666" }}>
                  {["Month", "Total Issues", "Issues Closed", "Issues Open", "Average Resolution Time"].map((header) => (
                    <TableCell key={header} style={{ color: "black", fontWeight: "bold" }}>{header}</TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow key={index} style={{ backgroundColor: index % 2 === 0 ? "#E2F0D9" : "white" }}>
                    <TableCell>{row.month}</TableCell>
                    <TableCell>{row.totalIssues}</TableCell>
                    <TableCell>{row.issuesClosed}</TableCell>
                    <TableCell>{row.issuesOpen}</TableCell>
                    <TableCell>{row.avgResolutionTime}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ display: "flex", justifyContent: "space-around", marginTop: "30px" }}>
            <div style={{ width: "35%" }}>
              <h3 style={{ textAlign: "center" }}>Number of Issues Logged per Month</h3>
              <Bar data={barChartData} options={{ responsive: true }} />
            </div>
            <div style={{ width: "20%" }}>
              <h3 style={{ textAlign: "center" }}>Open Issues Distribution</h3>
              <Pie data={pieChartData} options={{ responsive: true }} />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
            <button onClick={() => navigate(-1)} style={{ backgroundColor: "#B71C1C", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}>
              BACK
            </button>
            <div>
              <button onClick={downloadPDF} style={{ backgroundColor: "#005A50", color: "white", padding: "10px 20px", marginRight: "10px", border: "none", cursor: "pointer" }}>
                DOWNLOAD PDF
              </button>
              <button onClick={exportToExcel} style={{ backgroundColor: "#333", color: "white", padding: "10px 20px", border: "none", cursor: "pointer" }}>
                EXPORT TO EXCEL
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyGenerateReport;
