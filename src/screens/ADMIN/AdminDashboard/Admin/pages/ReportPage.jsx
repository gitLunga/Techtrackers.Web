import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images
import titleImage from "../adminIcons/images/title.jpg";
import chevronRight from "../adminIcons/images/Chevron.jpg";
import vectorImage from "../adminIcons/images/Vector.jpg";

const ReportPage = () => {
  const [reportType, setReportType] = useState("");
  const [previewContent, setPreviewContent] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const navigate = useNavigate();

  const handleSelectReport = (type) => {
    setReportType(type);
    updatePreviewContent(type, startDate, endDate);
  };

  const updatePreviewContent = (type) => {
    const content = `Preview of ${type} 
    .`;
    setPreviewContent(content);
  };

  const handleGenerateReport = () => {
    if (reportType === "Issues of Status Report") {
      navigate("/admindashboard/status-report", {
        state: { reportType },
      });
    } else if (reportType === "Monthly Summary Report") {
      navigate("/admindashboard/monthly-summary-report", {
        state: { reportType },
      });
    } else if (reportType === "Technician Performance Report") {
      navigate("/admindashboard/technician-performance-report", {
        state: { reportType },
      });
    }
  };

  const handleCancel = () => {
    setReportType("");
    setStartDate("");
    setEndDate("");
    setPreviewContent("");
  };

  const getButtonStyle = (type) => {
    return reportType === type
      ? { ...buttonStyle, backgroundColor: "#3F9421" } // Highlight selected button
      : buttonStyle;
  };

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <img src={titleImage} alt="Report Title" style={titleImageStyle} />
        <h1 style={{ color: "#000", fontWeight: "bold" }}>GENERATE REPORT</h1>
      </div>

      <div style={reportTypePreviewStyle}>
        <h3 style={{ color: "#000", fontWeight: "bold" }}>Report Type:</h3>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={vectorImage} alt="Vector Icon" style={iconStyle} />
          <h3 style={{ color: "#000", fontWeight: "bold" }}>Description</h3>
        </div>
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        <div style={buttonColumnStyle}>
          <button
            onClick={() => handleSelectReport("Issues of Status Report")}
            style={getButtonStyle("Issues of Status Report")}
          >
            <span>Issues of Status Report</span>
            <img src={chevronRight} alt="Chevron Right" style={chevronStyle} />
          </button>
          <button
            onClick={() => handleSelectReport("Monthly Summary Report")}
            style={getButtonStyle("Monthly Summary Report")}
          >
            <span>Monthly Summary Report</span>
            <img src={chevronRight} alt="Chevron Right" style={chevronStyle} />
          </button>
          <button
            onClick={() => handleSelectReport("Technician Performance Report")}
            style={getButtonStyle("Technician Performance Report")}
          >
            <span>Technician Performance Report</span>
            <img src={chevronRight} alt="Chevron Right" style={chevronStyle} />
          </button>
        </div>

        <div style={previewBoxStyle}>
          {previewContent ? (
            <p style={{ color: "#333" }}>{previewContent}</p>
          ) : (
            <p style={{ color: "#888" }}>
              Select a report type and date range to preview
            </p>
          )}
        </div>
      </div>

      {/* <div style={dateInputContainerStyle}>
        <div style={{ flex: 1 }}>
          <label>
            Start Date:
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                updatePreviewContent(reportType, e.target.value, endDate); // Update preview as the date is selected
              }}
              style={inputStyle}
            />
          </label>
        </div>
        <div style={{ flex: 1 }}>
          <label>
            End Date:
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                updatePreviewContent(reportType, startDate, e.target.value); // Update preview as the date is selected
              }}
              style={inputStyle}
            />
          </label>
        </div>
      </div> */}

      <div style={actionButtonContainerStyle}>
        <button
          onClick={handleCancel}
          style={{ ...buttonStyle, backgroundColor: "#BA0909", color: "#fff" }}
        >
          CANCEL
        </button>
        <button
          onClick={handleGenerateReport}
          style={{ ...buttonStyle, backgroundColor: "#3F9421", color: "#fff" }}
        >
          GENERATE REPORT
        </button>
      </div>
    </div>
  );
};

// Styles
const containerStyle = {
  marginTop: "-10px",
  padding: "20px",
  fontFamily: "Arial, sans-serif",
  backgroundColor: "#f9f9f9",
  borderRadius: "8px",
};
const headerStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: "20px",
};
const titleImageStyle = { maxWidth: "100px", marginRight: "20px" };
const reportTypePreviewStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "10px",
};
const iconStyle = { maxWidth: "20px", marginRight: "10px" };
const buttonColumnStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  width: "200px",
};
const previewBoxStyle = {
  width: "50%",
  marginLeft: "auto",
  padding: "10px",
  minHeight: "150px",
  borderRadius: "20px",
  backgroundColor: "#F4FFFF",
  boxShadow: " 0 4px 8px rgba(0, 0, 0, 0.2), 0 4px 8px rgba(0, 0, 0, 0.1)", // Inner shadow for "hole" effect
  border: "2px solid rgba(0, 0, 0, 0.1)",
};

const dateInputContainerStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "20px",
};
const actionButtonContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginTop: "20px",
};
const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  backgroundColor: "#15959D",
  color: "#fff",
  transition: "background-color 0.3s",
  fontSize: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
};
const chevronStyle = { width: "20px", height: "20px", marginLeft: "10px" };
const inputStyle = {
  width: "100%",
  marginTop: "5px",
  padding: "8px",
  borderRadius: "4px",
  border: "1px solid #ccc",
};

export default ReportPage;
