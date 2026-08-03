import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Drawer,
  Box,
  List,
  ListItemButton,
  ListItemText,
} from "@mui/material";

import { useState } from "react";

import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import MenuIcon from "@mui/icons-material/Menu";
import IconButton from "@mui/material/IconButton";

import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import AuthenticatorDetails from "./pages/authenticators/AuthenticatorDetails.jsx";
import AuthenticatorForm from "./pages/authenticators/CreateAuthenticator.jsx";
import Authenticators from "./pages/authenticators/Authenticators.jsx";
import PolicyLoad from "./pages/policies/PolicyLoad.jsx";
import Resources from "./pages/resources/Resources.jsx";
import ResourceDetail from "./pages/resources/ResourceDetails.jsx";
import Dashboard from "./pages/dashboard/dashboard.jsx";
import OIDCCallback from "./pages/OIDCCallback";

import "./App.css";

function navPadding() {
  if (location.pathname === "/login") {
    return "0px";
  }

  return "240px";
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}

function AppRoutes() {
  return (
    <>
      <Toolbar sx={{ display: { xs: "block", lg: "none" } }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/resources" replace />} />
        <Route
          path="/resources"
          element={
            <ProtectedRoute>
              <Resources />
            </ProtectedRoute>
          }
        />
        <Route
          path="/resources/:kind/:serviceId"
          element={
            <ProtectedRoute>
              <ResourceDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authenticators"
          element={
            <ProtectedRoute>
              <Authenticators />
            </ProtectedRoute>
          }
        />
        <Route
          path="/authenticators/:type/:name"
          element={
            <ProtectedRoute>
              <AuthenticatorDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/policy/load"
          element={
            <ProtectedRoute>
              <PolicyLoad />
            </ProtectedRoute>
          }
        />
        <Route path="/login/callback" element={<OIDCCallback />} />
        <Route
          path="/authenticators/create"
          element={
            <ProtectedRoute>
              <AuthenticatorForm />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

function DrawerContent({ logout }) {
  return (
    <>
      <img
        src="/conjur-logo.svg"
        alt="Conjur"
        style={{
          width: "182px",
          margin: "20px",
          filter: "brightness(0) saturate(100%)",
        }}
      />

      <List>
        <ListItemButton component={Link} to="/dashboard">
          <DashboardIcon sx={{ mr: 2 }} />
          <ListItemText primary="Dashboard" />
        </ListItemButton>
        <ListItemButton component={Link} to="/resources">
          <Inventory2OutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Resources" />
        </ListItemButton>

        {/* <ListItemButton component={Link} to="/resources?kind=variable">
          <KeyOutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Secrets" />
        </ListItemButton>

        <ListItemButton component={Link} to="/resources?kind=group">
          <GroupOutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Groups" />
        </ListItemButton> */}

        <ListItemButton component={Link} to="/authenticators">
          <SecurityOutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Authenticators" />
        </ListItemButton>
{/* 
        <ListItemButton component={Link} to="/resources?kind=policy">
          <DescriptionOutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Policy" />
        </ListItemButton> */}

        <ListItemButton component={Link} to="/policy/load">
          <CloudUploadIcon sx={{ mr: 2 }} />
          <ListItemText primary="Load Policy" />
        </ListItemButton>

        <ListItemButton onClick={logout}>
          <LogoutOutlinedIcon sx={{ mr: 2 }} />
          <ListItemText primary="Logout" />
        </ListItemButton>
      </List>
    </>
  );
}

function NavBar({ mobileOpen, handleDrawerToggle }) {
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const showNavbar = isAuthenticated && location.pathname !== "/login";

  if (!showNavbar) {
    return null;
  }

  return (
    <>
      {showNavbar && (
        <>
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", lg: "block" },
              "& .MuiDrawer-paper": {
                width: 240,
                boxSizing: "border-box",
              },
            }}
            open
          >
            <DrawerContent logout={logout} />
          </Drawer>

          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true,
            }}
            sx={{
              display: { xs: "block", lg: "none" },
              "& .MuiDrawer-paper": {
                width: 240,
                boxSizing: "border-box",
              },
            }}
          >
            <DrawerContent logout={logout} />
          </Drawer>
        </>
      )}
    </>
  );
}

function AppShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const showNavbar = isAuthenticated && location.pathname !== "/login";

  return (
    <>
      <Box sx={{ display: "flex" }}>
        {showNavbar && (
          <AppBar
            position="fixed"
            sx={{
              display: { xs: "block", lg: "none" },
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>

              <img
                src="/conjur-logo.svg"
                alt="Conjur"
                style={{
                  width: "182px",
                  margin: "20px",
                  filter: "brightness(0) saturate(100%)",
                }}
              />
            </Toolbar>
          </AppBar>
        )}
        <NavBar
          mobileOpen={mobileOpen}
          handleDrawerToggle={handleDrawerToggle}
        />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { lg: navPadding() },
            p: 3,
          }}
        >
          <AppRoutes />
        </Box>
      </Box>
    </>
  );
}

export default App;
