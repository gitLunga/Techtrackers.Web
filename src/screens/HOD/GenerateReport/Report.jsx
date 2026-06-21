import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ReportPage.css"; // Import CSS file

// Import images
import titleImage from "./images/title.jpg";
import chevronRight from "./images/Chevron right.jpg";
import vectorImage from "./images/Vector.jpg";

const ReportPage = ({ isSidebarOpen }) => {
  const [reportType, setReportType] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const handleSelectReport = (type) => {
    setReportType(type);
    updatePreviewContent(type, startDate, endDate);
  };

  const updatePreviewContent = (type, start, end) => {
    const content = `Preview of ${type} from ${start || "Start Date"} to ${
      end || "End Date"
    }.`;
    setPreviewContent(content);
  };

  const handleGenerateReport = () => {
    if (reportType === "Issues of Status Report") {
      navigate("/headdepartment/status-report", {
        state: { reportType, startDate, endDate },
      });
    } else if (reportType === "Monthly Summary Report") {
      navigate("/headdepartment/monthly-summary-report", {
        state: { reportType, startDate, endDate },
      });
    } else if (reportType === "Technician Performance Report") {
      navigate("/headdepartment/technician-performance-report", {
        state: { reportType, startDate, endDate },
      });
    }
  };

  const handleCancel = () => {
    setReportType("");
    setStartDate("");
    setEndDate("");
    setPreviewContent("");
  };

  const getButtonClassName = (type) =>
    reportType === type ? "button selected" : "button";

  return (
    <div className={`ReportContainer ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}>
      <div className="ReportHeader">
        <img src={titleImage} alt="Report Title" className="title-image" />
        <h1>GENERATE REPORT</h1>
      </div>

      <div className="report-type-preview">
        <h3>Report Type:</h3>
        <div>
          <h3><img src={vectorImage} alt="Vector Icon" className="icon" />Description</h3>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div className="button-column">
          <button
            onClick={() => handleSelectReport("Issues of Status Report")}
            className={getButtonClassName("Issues of Status Report")}
          >
            <span>Issues of Status Report</span>
            <img src={chevronRight} alt="Chevron Right" className="chevron" />
          </button>
          <button
            onClick={() => handleSelectReport("Monthly Summary Report")}
            className={getButtonClassName("Monthly Summary Report")}
          >
            <span>Monthly Summary Report</span>
            <img src={chevronRight} alt="Chevron Right" className="chevron" />
          </button>
          <button
            onClick={() => handleSelectReport("Technician Performance Report")}
            className={getButtonClassName("Technician Performance Report")}
          >
            <span>Technician Performance Report</span>
            <img src={chevronRight} alt="Chevron Right" className="chevron" />
          </button>
        </div>

        <div className="preview-box">
          {previewContent ? (
            <p>{previewContent}</p>
          ) : (
            <p>Select a report type and date range to preview</p>
          )}
        </div>
      </div>

      <div className="date-input-container">
        <div style={{flex: 1}}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                updatePreviewContent(reportType, e.target.value, endDate);
              }}
              className="input"
            />
          </label>
        </div>
        <div style={{flex: 1}}>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updatePreviewContent(reportType, startDate, e.target.value);
              }}
              className="input"
            />
          </label>
        </div>
      </div>

      <div className="action-button-container">
        <button onClick={handleCancel} className="button" style={{ backgroundColor: "#BA0909" }}>
          CANCEL
        </button>
        <button onClick={handleGenerateReport} className="button" style={{ backgroundColor: "#3F9421" }}>
          GENERATE REPORT
        </button>
      </div>
    </div>
  );
};

export default ReportPage;
