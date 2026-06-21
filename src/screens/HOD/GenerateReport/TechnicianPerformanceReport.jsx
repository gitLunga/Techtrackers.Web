"use client"

import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { Line } from "react-chartjs-2"
import axios from "axios"
import styles from "./TechnicianPerformanceReport.css"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from "@mui/material"
import jsPDF from "jspdf"
import "jspdf-autotable"
import * as XLSX from "xlsx"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const TechnicianPerformanceReport = ({ isSidebarOpen }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { startDate, endDate } = location.state || {}

  const [tableData, setTableData] = useState([])
  const [chartData, setChartData] = useState(null)
  const [loading, setLoading] = useState(true)

  const API_URL = "https://localhost:44328/api/TechPerformanceReport/GetTechnicianPerformanceReport"

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_URL}?startDate=${startDate}&endDate=${endDate}`)
        setTableData(response.data)

        const technicianNames = response.data.map((tech) => tech.technicianName || tech.name)
        const resolutionTimes = response.data.map((tech) =>
          Number.parseFloat(tech.avgResolutionTime || tech.resolutionTime),
        )

        setChartData({
          labels: technicianNames,
          datasets: [
            {
              label: "Average Resolution Time (days)",
              data: resolutionTimes,
              fill: false,
              borderColor: "#20b2aa",
              backgroundColor: "rgba(32, 178, 170, 0.1)",
              tension: 0.4,
              pointBackgroundColor: "#0c3a3a",
              pointBorderColor: "#20b2aa",
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
            },
          ],
        })
      } catch (error) {
        console.error("Error fetching technician performance data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [startDate, endDate])

  const downloadPDF = () => {
    const doc = new jsPDF()
    doc.setFontSize(18)
    doc.text("Technician Performance Report", 20, 20)
    doc.setFontSize(12)
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35)
    doc.text(`Period: ${startDate} - ${endDate}`, 20, 45)

    doc.autoTable({
      startY: 55,
      head: [
        [
          "Technician Name",
          "Total Issues Assigned",
          "Issues Resolved",
          "Average Resolution Time",
          "Pending Issues",
          "Performance Rating",
        ],
      ],
      body: tableData.map((row) => [
        row.technicianName || row.name,
        row.assignedIssues || row.assigned,
        row.resolvedIssues || row.resolved,
        row.avgResolutionTime || row.resolutionTime,
        row.pendingIssues || row.pending,
        row.performanceRating || row.rating,
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

    doc.save("technician_performance_report.pdf")
  }

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(tableData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Technician Performance")
    XLSX.writeFile(workbook, "technician_performance_report.xlsx")
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
      <div
        className={`${styles.technicianReportContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}
      >
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading technician performance data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`${styles.technicianReportContainer} ${isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
      <div className={styles.headerSection}>
        <h1 className={styles.reportTitle}>Technician Performance Report</h1>
        <p className={styles.reportSubtitle}>
          Generated: {new Date().toLocaleDateString()} | Period: {startDate} - {endDate}
        </p>
      </div>

      <div className={styles.reportTableContainer}>
        <TableContainer component={Paper} className={styles.tableContainer}>
          <Table className={styles.reportTable}>
            <TableHead>
              <TableRow className={styles.reportTableHead}>
                <TableCell className={styles.headerCell}>Technician Name</TableCell>
                <TableCell className={styles.headerCell}>Total Issues Assigned</TableCell>
                <TableCell className={styles.headerCell}>Issues Resolved</TableCell>
                <TableCell className={styles.headerCell}>Average Resolution Time</TableCell>
                <TableCell className={styles.headerCell}>Pending Issues</TableCell>
                <TableCell className={styles.headerCell}>Performance Rating</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tableData.map((row, index) => (
                <TableRow key={index} className={styles.reportTableRow}>
                  <TableCell className={styles.tableCell}>{row.technicianName}</TableCell>
                  <TableCell className={styles.tableCell}>{row.assignedIssues}</TableCell>
                  <TableCell className={styles.tableCell}>{row.resolvedIssues}</TableCell>
                  <TableCell className={styles.tableCell}>{row.avgResolutionTime}</TableCell>
                  <TableCell className={styles.tableCell}>{row.pendingIssues}</TableCell>
                  <TableCell className={styles.tableCell}>
                    <span
                      className={`${styles.ratingBadge} ${styles[`rating${Math.floor(row.performanceRating || 0)}`]}`}
                    >
                      {row.performanceRating}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </div>

      <div className={styles.chartContainer}>
        <h2 className={styles.chartTitle}>Average Resolution Time by Technician</h2>
        {chartData && (
          <div className={styles.chartBox}>
            <Line data={chartData} options={chartOptions} />
          </div>
        )}
      </div>

      <div className={styles.buttonsContainer}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          ← BACK
        </button>
        <div className={styles.actionButtons}>
          <button onClick={downloadPDF} className={styles.downloadPdfButton}>
            📄 DOWNLOAD PDF
          </button>
          <button onClick={exportToExcel} className={styles.exportExcelButton}>
            📊 EXPORT TO EXCEL
          </button>
        </div>
      </div>
    </div>
  )
}

export default TechnicianPerformanceReport
