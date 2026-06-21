import { useState } from "react";

const useIssues = () => {
  const [issues, setIssues] = useState([
    {
      id: 1,
      name: "MIKE MDLULI",
      title: "Cloud Technician",
      issueTitle: "Storage Capacity",
      issueDetails: "Some details about the issue will go on here...",
      time: "14:18",
      date: "2023/08/01",
    },
    {
      id: 2,
      name: "COLIN RADEBE",
      title: "System Analyst",
      issueTitle: "Issue Title",
      issueDetails: "Some details about the issue will go on here...",
      time: "14:18",
      date: "2023/08/02",
    },
    {
      id: 3,
      name: "FAITH MNISI",
      title: "Web Support Technician",
      issueTitle: "Responsive Design Troubleshooting",
      issueDetails: "Some details about the issue will go on here...",
      time: "14:18",
      date: "2023/07/29",
    },
    {
      name: "NATASHA SMITH",
      title: "Telecommunications Technician",
      issueTitle: " Network Connectivity",
      issueDetails: "Some details about the issue will go on here...",
      time: "14:18",
      date: "2023/08/05",
    },
  ]);

  return { issues, setIssues };
};

export default useIssues;
