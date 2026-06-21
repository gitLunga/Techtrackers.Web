import { useState } from "react";

const useIssues = () => {
  const [issues, setIssues] = useState([
    {
      issueId: "IT-P2-1234",
      name: "Excellent Nambane",
      title: "Internal Issue",
      description: "System error affecting multiple internal applications.",
      date: "19/08/2024",
      department: "IT Department",
      priority: "Medium",
      assigned: "None",
      status: "Pending",
      attachments: [
        {
          filename: "error_screenshot.png",
          imageUrl: "/path/to/error_screenshot.png", // replace with actual path
        },
      ],
    },
    {
      issueId: "HR-P3-1235",
      name: "Themba Zwane",
      title: "Network Issue",
      description: "Connectivity issues impacting access to shared resources.",
      date: "15/08/2024",
      department: "Human Resources (HR)",
      priority: "High",
      assigned: "Abel Makamu",
      status: "Ongoing",
      attachments: [
        {
          filename: "network_diagram.jpg",
          imageUrl: "/path/to/network_diagram.jpg", // replace with actual path
        },
      ],
    },
    {
      issueId: "HR-P1-1236",
      name: "Sara Smith",
      title: "Printer Not Working",
      description: "Office printer unable to print, likely due to a hardware issue.",
      date: "22/07/2024",
      department: "Human Resources (HR)",
      priority: "Low",
      assigned: "Matete Sekgotodi",
      status: "On Hold",
      attachments: [
        {
          filename: "printer_issue.jpg",
          imageUrl: "/path/to/printer_issue.jpg", // replace with actual path
        },
      ],
    },
    {
      issueId: "HR-P1-1237",
      name: "John Doe",
      title: "Forgot Password",
      description: "User locked out of account due to forgotten password.",
      date: "15/07/2024",
      department: "Human Resources (HR)",
      priority: "High",
      assigned: "Hamilton Masipa",
      status: "Done",
      attachments: [
        {
          filename: "password_reset_email.png",
          imageUrl: "/path/to/password_reset_email.png", // replace with actual path
        },
      ],
    },
  ]);

  return { issues, setIssues };
};

export default useIssues;
