import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App.jsx";
import CompanyContextProvider from "./context/companyContext.jsx";

import "./index.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <CompanyContextProvider>
        <App />
      </CompanyContextProvider>
    </BrowserRouter>
  </StrictMode>
);
