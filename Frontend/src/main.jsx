import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import { MemberProvider } from "./context/MemberContext";

import "./styles.css";
import "./styles-extra.css";

ReactDOM.createRoot(
  document.getElementById("root"),
).render(
  <React.StrictMode>
    <MemberProvider>
      <App />
    </MemberProvider>
  </React.StrictMode>,
);