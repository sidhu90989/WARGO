import React from "react";
import { createRoot } from "react-dom/client";
import AdminApp from "./src/AdminApp";
import "../../client/src/index.css";

createRoot(document.getElementById("root")!).render(<AdminApp />);
