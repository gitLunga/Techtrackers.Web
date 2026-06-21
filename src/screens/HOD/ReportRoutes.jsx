
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReportPage from "./GenerateReport/Report";
import IssuesStatusReport from "./GenerateReport/IssuesStatusReport";
import MonthlySummaryReport from "./GenerateReport/MonthlySummaryReport";
import TechnicianPerformanceReport from "./GenerateReport/TechnicianPerformanceReport";

function ReportRoutes() {
  return (
      <Routes>
        <Route path="/" element={<ReportPage />} />
        <Route path="/status-report" element={<IssuesStatusReport />} />
        <Route
          path="/monthly-summary-report"
          element={<MonthlySummaryReport />}
        />
        <Route
          path="/technician-performance-report"
          element={<TechnicianPerformanceReport />}
        />
      </Routes>
  );
}

export default ReportRoutes;
