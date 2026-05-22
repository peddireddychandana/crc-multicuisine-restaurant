import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { setBaseUrl } from "@workspace/api-client-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";
setBaseUrl(apiUrl);

createRoot(document.getElementById("root")!).render(<App />);
