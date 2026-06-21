// src/MainApp.jsx
import React, { useState } from "react";

import "../SidebarCSS/CollabMain.css";


import Table from "./TableCollaburationRequest";

const CollabMain = () => {
  const [sortConfig] = useState({ key: null, direction: null });

  return (
    <div className="App">
      <Table sortConfig={sortConfig} />
    </div>
  );
};

export default CollabMain;
