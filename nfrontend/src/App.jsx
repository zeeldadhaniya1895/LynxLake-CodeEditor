import { Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

//Pages
import Auth from "./pages/Auth";
// import Editor from "./pages/Editor";
import HomePage from "./pages/HomePage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import InvitationPage from "./pages/InvitationPage";
import ProjectPage from "./pages/ProjectPage";
import ModernEditor from "./pages/ModernEditor";
// import LandingPage from "./components/home/LandingPage";

// CSS
import "./CSS/App.css";

// Config
import config from "./config/index";

// OAuth
import { GoogleOAuthProvider } from "@react-oauth/google"


function App() {

  const theme = createTheme({
    typography: {
      fontFamily: "Quicksand",
    },
    palette: {
      mode: 'dark',
      primary: {
        main: '#58A6FF',
      },
      secondary: {
        main: '#1F6FEB',
      },
      background: {
        default: '#0D1117',
        paper: '#161B22',
      },
    },
  });

  const GoogleAuthWrapper = () => {
    console.log(import.meta.env.VITE_GOOGLE_CLIENT_ID);
    return (
      <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
        <Auth />
      </GoogleOAuthProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        {/* <Route exact path="/" element={<LandingPage />} /> */}
        <Route exact path="/auth" element={<GoogleAuthWrapper />} />
        <Route exact path="/" element={<ProtectedRoute Component={HomePage} />} />
        <Route
          path="/project"
          element={<ProtectedRoute Component={ProjectPage} />}
        />
        <Route exact path="/project/:projectId" element={<ProtectedRoute Component={ModernEditor} />} />

        <Route exact path="/invite/:token" element={<InvitationPage />} />
        <Route exact path="*" element={<PageNotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App

