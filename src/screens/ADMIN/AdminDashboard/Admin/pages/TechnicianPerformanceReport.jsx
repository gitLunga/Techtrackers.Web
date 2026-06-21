import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Box,
  CircularProgress
} from "@mui/material";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const TechnicianPerformanceReport = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { startDate, endDate } = location.state || {};

  const [tableData, setTableData] = useState([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Number of Issues",
        data: [],
        fill: false,
        borderColor: "#333",
        tension: 0.4,
      },
    ],
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        const response = await fetch(
          "https://localhost:44328/api/TechPerformanceReport/GetTechnicianPerformanceReport"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch technician performance data.");
        }

        const data = await response.json();

        console.log(data);
        
        // Update table data
        setTableData(data);

        // Update chart data
        setChartData({
          labels: data.map((tech) => tech.technicianName),
          datasets: [
            {
              label: "Number of Issues Resolved",
              data: data.map((tech) => tech.resolvedIssues),
              fill: false,
              borderColor: "#333",
              tension: 0.4,
            },
          ],
        });

      } catch (error) {
        setError(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPerformanceData();
  }, []);

  const downloadPDF = () => {
    const doc = new jsPDF();
    doc.text("Technician Performance Report", 10, 10);
    doc.text(
      `Date report was generated: ${new Date().toLocaleDateString()}`,
      10,
      20
    );
    doc.text(`Report Duration: ${startDate} - ${endDate}`, 10, 30);

    doc.autoTable({
      head: [
        [
          "Technician Name",
          "Total Issues Assigned",
          "Issues Resolved",
          "Average Resolution Time",
          "In Progress Issues",
          "Performance Rating",
        ],
      ],
      body: tableData.map((row) => [
        row.technicianName,
        row.assignedIssues,
        row.resolvedIssues,
        `${row.avgResolutionTime.toFixed(1)} days`, // Ensuring a clean number format
        row.pendingIssues,
        `${row.performanceRating.toFixed(1)}/5`, // Formatting rating
      ]),
    });

    doc.save("technician_performance_report.pdf");
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(
      tableData.map((row) => ({
        "Technician Name": row.technicianName,
        "Total Issues Assigned": row.assignedIssues,
        "Issues Resolved": row.resolvedIssues,
        "Average Resolution Time": `${row.avgResolutionTime.toFixed(1)} hours`,
        "In Progress Issues": row.pendingIssues,
        "Performance Rating": `${row.performanceRating.toFixed(1)}/5`,
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Technician Performance");
    XLSX.writeFile(workbook, "technician_performance_report.xlsx");
  };

  return (
    <Box
      sx={{
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        backgroundColor: "#E5F0EC",
        marginTop: "-10px",
      }}
    >
      <Typography variant="h4" align="center" gutterBottom>
        Technician Performance Report
      </Typography>
      {/* <Typography variant="subtitle1" align="center" gutterBottom>
        Date report was generated: {startDate || "N/A"} - {endDate || "N/A"}
      </Typography> */}

      {isLoading ? (
        <Box display="flex" justifyContent="center" alignItems="center">
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography variant="h6" color="error" align="center">
          {error}
        </Typography>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ margin: "40px 0" }}>
            <Table>
              <TableHead>
                <TableRow sx={{ backgroundColor: "#6da397" }}>
                  <TableCell>Technician Name</TableCell>
                  <TableCell>Total Issues Assigned</TableCell>
                  <TableCell>Issues Resolved</TableCell>
                  <TableCell>Average Resolution Time</TableCell>
                  <TableCell>In Progress Issues</TableCell>
                  <TableCell>Performance Rating</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tableData.map((row, index) => (
                  <TableRow
                    key={index}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#f0f5f4" : "white",
                    }}
                  >
                    <TableCell>{row.technicianName}</TableCell>
                    <TableCell>{row.assignedIssues}</TableCell>
                    <TableCell>{row.resolvedIssues}</TableCell>
                    <TableCell>{row.avgResolutionTime.toFixed(1)} hours</TableCell>
                    <TableCell>{row.pendingIssues}</TableCell>
                    <TableCell>{row.performanceRating.toFixed(1)}/5</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              padding: "10px",
              backgroundColor: "#dbe7e4",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <Typography variant="h6" align="center" gutterBottom>
              Number of Issues Resolved by Each Technician
            </Typography>
            <Line data={chartData} options={{ responsive: true }} />
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "30px",
            }}
          >
            <Button
              variant="contained"
              color="error"
              sx={{ padding: "10px 20px" }}
              onClick={() => navigate(-1)}
            >
              BACK
            </Button>
            <Box>
              <Button
                onClick={downloadPDF}
                variant="contained"
                sx={{
                  backgroundColor: "#005A50",
                  color: "white",
                  padding: "10px 20px",
                  marginRight: "10px",
                }}
              >
                DOWNLOAD PDF
              </Button>
              <Button
                onClick={exportToExcel}
                variant="contained"
                sx={{
                  backgroundColor: "#333",
                  color: "white",
                  padding: "10px 20px",
                }}
              >
                EXPORT TO EXCEL
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default TechnicianPerformanceReport;
