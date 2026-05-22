import { createRoot } from "react-dom/client";
import { setBaseUrl, setAuthTokenGetter } from "@workspace/api-client-react";
import { useAuthStore } from "@/lib/store";
import App from "./App";
import "./index.css";

setBaseUrl(import.meta.env.VITE_API_URL || "http://localhost:5000");
setAuthTokenGetter(() => useAuthStore.getState().token);

createRoot(document.getElementById("root")!).render(<App />);
