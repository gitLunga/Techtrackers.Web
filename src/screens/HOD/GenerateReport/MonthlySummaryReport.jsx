"use client"

import { useEffect, useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"
import styles from "./MonthlyGenerateReport.module.css"

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

const MonthlyGenerateReport = ({ isSidebarOpen }) => {
  const { state } = useLocation()
  const { startDate, endDate } = state || {}
  const navigate = useNavigate()

  const [tableData, setTableData] = useState([])
  const [barChartData, setBarChartData] = useState({ labels: [], datasets: [] })
  const [pieChartData, setPieChartData] = useState({ labels: [], datasets: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMonthlyReport = async () => {
      try {
        setLoading(true)
        const response = await fetch("https://localhost:44328/api/MonthlySummaryReport/GetMonthlySummaryReport")
        if (response.ok) {
          const data = await response.json()
          setTableData(data)

          setBarChartData({
            labels: data.map((row) => row.month),
            datasets: [
              {
                label: "Total Issues",
                data: data.map((row) => row.totalIssues),
                backgroundColor: [
                  "rgba(32, 178, 170, 0.8)",
                  "rgba(21, 149, 157, 0.8)",
                  "rgba(12, 58, 58, 0.8)",
                  "rgba(1, 94, 77, 0.8)",
                ],
                borderColor: ["#20b2aa", "#15959d", "#0c3a3a", "#015e4d"],
                borderWidth: 2,
                hoverBackgroundColor: [
                  "rgba(32, 178, 170, 1)",
                  "rgba(21, 149, 157, 1)",
                  "rgba(12, 58, 58, 1)",
                  "rgba(1, 94, 77, 1)",
                ],
              },
            ],
          })

          setPieChartData({
            labels: data.map((row) => row.month),
            datasets: [
              {
                label: "Issues Open",
                data: data.map((row) => row.issuesOpen),
                backgroundColor: [
                  "rgba(0, 90, 80, 0.8)",
                  "rgba(32, 178, 170, 0.8)",
                  "rgba(127, 201, 201, 0.8)",
                  "rgba(1, 79, 67, 0.8)",
                ],
                borderColor: ["#005a50", "#20b2aa", "#7fc9c9", "#014f43"],
                borderWidth: 2,
                hoverBackgroundColor: [
                  "rgba(0, 90, 80, 1)",
                  "rgba(32, 178, 170, 1)",
                  "rgba(127, 201, 201, 1)",
                  "rgba(1, 79, 67, 1)",
                ],
              },
            ],
          })
        } else {
          console.error("Failed to fetch report data.")
        }
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMonthlyReport()
  }, [])

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Monthly Issue Report", 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)
    doc.text(`Period: ${startDate || "Start Date"} to ${endDate || "End Date"}`, 20, 45)

    doc.autoTable({
      startY: 55,
      head: [["Month", "Total Issues", "Issues Closed", "Issues Open", "Average Resolution Time"]],
      body: tableData.map((row) => [
        row.month,
        row.totalIssues,
        row.issuesClosed,
        row.issuesOpen,
        row.avgResolutionTime,
      ]),
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      headStyles: {
        fillColor: [12, 58, 58],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [248, 255, 254],
      },
    })
    doc.save("monthly_report.pdf")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Monthly Report")
    XLSX.writeFile(workbook, "monthly_report.xlsx")
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
          color: "rgba(32, 178, 170, 0.1)",
        },
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
      x: {
        grid: {
          color: "rgba(32, 178, 170, 0.1)",
        },
        ticks: {
          font: {
            weight: "bold",
          },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className={`${styles.monthlyReportContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading monthly report data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.monthlyReportContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.headerSection}>
        <h1>Monthly Issue Report</h1>
        <p className={styles.subtitle}>
          Generated: {new Date().toLocaleDateString()} | Period: {startDate || "Start Date"} to {endDate || "End Date"}
        </p>
      </div>

      <div className={styles.reportTableContainer}>
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table className={styles.reportTable}>
            <TableHead>
              <TableRow className={styles.tableHeader}>
                {["Month", "Total Issues", "Issues Closed", "Issues Open", "Average Resolution Time"].map((header) => (
                  <TableCell key={header} className={styles.headerCell}>
                    {header}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index} className={styles.tableRow}>
                  <TableCell className={styles.tableCell}>{row.month}</TableCell>
                  <TableCell className={styles.tableCell}>{row.totalIssues}</TableCell>
                  <TableCell className={styles.tableCell}>{row.issuesClosed}</TableCell>
                  <TableCell className={styles.tableCell}>{row.issuesOpen}</TableCell>
                  <TableCell className={styles.tableCell}>{row.avgResolutionTime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className={styles.chartContainer}>
        <div className={styles.chartBar}>
          <h3>Number of Issues Logged per Month</h3>
          <div className={styles.chartBox}>
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>
        <div className={styles.chartPie}>
          <h3>Open Issues Distribution</h3>
          <div className={styles.chartBox}>
            <Pie data={pieChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      <div className={styles.buttonsContainer}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← BACK
        </button>
        <div className={styles.actionButtons}>
          <button onClick={downloadPDF} className={`${styles.downloadPdf}`}>
            📄 DOWNLOAD PDF
          </button>
          <button onClick={exportToExcel} className={`${styles.exportExcel}`}>
            📊 EXPORT TO EXCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default MonthlyGenerateReport
