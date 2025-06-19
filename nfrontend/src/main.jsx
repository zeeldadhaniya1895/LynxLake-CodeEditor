import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { SocketProvider } from "./context/socket";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/auth";
import { UserProvider } from "./context/user";

//css
import "./CSS/index.css";
createRoot(document.getElementById('root')).render(
  // <StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <SocketProvider>
        <UserProvider>
    <App />
    <Toaster
            position="top-center"
            toastOptions={{
              style: {
                zIndex: 9999,
                fontFamily: "Quicksand",
                fontWeight: "600",
              },
            }}
          />
    </UserProvider>
      </SocketProvider>
    </AuthProvider>
  </BrowserRouter>,
  {/* </StrictMode>, */}
)
