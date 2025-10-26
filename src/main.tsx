import React from 'react'; 
import { createRoot } from "react-dom/client";
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from "./App.tsx";
import "./index.css";

// Google OAuth Client ID - replace with your actual Client ID
// Get it from: https://console.cloud.google.com/
const GOOGLE_CLIENT_ID = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID || "568713479079-mdb6g0unc66rqrkil54rg0pr7ps6g9qm.apps.googleusercontent.com";

const root = createRoot(document.getElementById("root")!);

root.render(
  // @ts-ignore - GoogleOAuthProvider works correctly despite TypeScript type issue
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID as string}>
    <App />
  </GoogleOAuthProvider>
);
