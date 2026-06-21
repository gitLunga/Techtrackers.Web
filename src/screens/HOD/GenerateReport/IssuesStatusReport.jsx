"use client"

import { useState, useEffect } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import styles from "./IssueReport.module.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const IssueReport = ({ isSidebarOpen }) => {
  const { state } = useLocation()
  const navigate = useNavigate()
  const { startDate, endDate } = state || {}

  const [tableData, setTableData] = useState([])
  const [chartData, setChartData] = useState({
    labels: ["Open", "In Progress", "Resolved", "Escalated", "On Hold"],
    datasets: [
      {
        label: "Issue Status Distribution",
        data: [0, 0, 0, 0, 0],
        backgroundColor: [
          "rgba(32, 178, 170, 0.8)",
          "rgba(21, 149, 157, 0.8)",
          "rgba(12, 58, 58, 0.8)",
          "rgba(255, 193, 7, 0.8)",
          "rgba(233, 30, 99, 0.8)",
        ],
        borderColor: ["#20b2aa", "#15959d", "#0c3a3a", "#ffc107", "#e91e63"],
        borderWidth: 2,
        hoverBackgroundColor: [
          "rgba(32, 178, 170, 1)",
          "rgba(21, 149, 157, 1)",
          "rgba(12, 58, 58, 1)",
          "rgba(255, 193, 7, 1)",
          "rgba(233, 30, 99, 1)",
        ],
      },
    ],
  })

  useEffect(() => {
    const fetchIssueReport = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/GenerateReport/GetIssueByStatusReport")
        if (response.ok) {
          const data = await response.json()
          setTableData(data)
        } else {
          console.error("Failed to fetch issue report.")
        }
      } catch (error) {
        console.error("Error fetching issue report:", error)
      }
    }

    fetchIssueReport()
  }, [])

  useEffect(() => {
    const fetchIssueStatusCount = async () => {
      try {
        const response = await fetch("https://localhost:44328/api/GenerateReport/GetIssueStatusCount")
        if (response.ok) {
          const data = await response.json()

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
                  "rgba(32, 178, 170, 0.8)",
                  "rgba(21, 149, 157, 0.8)",
                  "rgba(12, 58, 58, 0.8)",
                  "rgba(255, 193, 7, 0.8)",
                  "rgba(233, 30, 99, 0.8)",
                ],
                borderColor: ["#20b2aa", "#15959d", "#0c3a3a", "#ffc107", "#e91e63"],
                borderWidth: 2,
                hoverBackgroundColor: [
                  "rgba(32, 178, 170, 1)",
                  "rgba(21, 149, 157, 1)",
                  "rgba(12, 58, 58, 1)",
                  "rgba(255, 193, 7, 1)",
                  "rgba(233, 30, 99, 1)",
                ],
              },
            ],
          })
        } else {
          console.error("Failed to fetch issue status count.")
        }
      } catch (error) {
        console.error("Error fetching issue status count:", error)
      }
    }

    fetchIssueStatusCount()
  }, [])

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("Issue By Status Report", 20, 10)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 20)
    doc.text(`Period: ${startDate || "N/A"} to ${endDate || "N/A"}`, 20, 30)

    doc.autoTable({
      startY: 40,
      head: [["Log ID", "Issue Title", "Priority", "Technician", "Status", "Date Created", "Due Date", "Date Closed"]],
      body: tableData.map((row) => Object.values(row)),
      styles: {
        fontSize: 8,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [12, 58, 58],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    })
    doc.save("issue_status_report.pdf")
  }

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(tableData)
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Issue Status Report")
    XLSX.writeFile(wb, "issue_status_report.xlsx")
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "bold",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "#20b2aa",
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(0,0,0,0.1)",
        },
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
    },
  }

  return (
    <div className={`${styles.issueReportContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.headerSection}>
        <h1>Issue By Status Report</h1>
        <p className={styles.subtitle}>
          Report Generated: {new Date().toLocaleDateString()} | Period: {startDate || "N/A"} to {endDate || "N/A"}
        </p>
      </div>

      <div className={styles.tableSection}>
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table>
            <TableHead>
              <TableRow className={styles.tableHeader}>
                <TableCell className={styles.headerCell}>Log ID</TableCell>
                <TableCell className={styles.headerCell}>Issue Title</TableCell>
                <TableCell className={styles.headerCell}>Priority</TableCell>
                <TableCell className={styles.headerCell}>Technician</TableCell>
                <TableCell className={styles.headerCell}>Status</TableCell>
                <TableCell className={styles.headerCell}>Date Created</TableCell>
                <TableCell className={styles.headerCell}>Due Date</TableCell>
                <TableCell className={styles.headerCell}>Date Closed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow
                  key={index}
                  className={`${styles.tableRow} ${row.status === "RESOLVED" ? styles.resolvedRow : ""}`}
                >
                  <TableCell className={styles.tableCell}>{row.logId}</TableCell>
                  <TableCell className={styles.tableCell}>{row.issueTitle}</TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={`${styles.priorityBadge} ${styles[`priority${row.priority?.toLowerCase()}`]}`}>
                      {row.priority}
                    </span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>{row.technician}</TableCell>
                  <TableCell className={styles.tableCell}>
                    <span className={`${styles.statusBadge} ${styles[`status${row.status?.toLowerCase()}`]}`}>
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className={styles.tableCell}>{row.dateCreated}</TableCell>
                  <TableCell className={styles.tableCell}>{row.dueDate}</TableCell>
                  <TableCell className={styles.tableCell}>{row.dateClosed}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className={styles.chartSection}>
        <div className={styles.chartContainer}>
          <div className={styles.chartWrapper}>
            <h3>Issue Status Distribution - Bar Chart</h3>
            <div className={styles.chartBox}>
              <Bar data={chartData} options={chartOptions} />
            </div>
          </div>
          <div className={styles.chartWrapper}>
            <h3>Issue Status Distribution - Pie Chart</h3>
            <div className={styles.chartBox}>
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionSection}>
        <button onClick={() => navigate(-1)} className={`${styles.button} ${styles.backButton}`}>
          ← BACK
        </button>
        <div className={styles.exportButtons}>
          <button onClick={exportPDF} className={`${styles.button} ${styles.pdfButton}`}>
            📄 EXPORT PDF
          </button>
          <button onClick={exportExcel} className={`${styles.button} ${styles.excelButton}`}>
            📊 EXPORT EXCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default IssueReport
