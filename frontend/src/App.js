import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Home from "./features/home/Home";
import Login from "./features/auth/Login";
import Register from "./features/auth/Register";
import Dashboard from "./features/dashboard/Dashboard";
import PrivateRoute from "./components/PrivateRoute";
import Footer from "./components/Footer";

import TenantListings from "./features/listings/TenantListings";
import TenantBookings from "./features/bookings/TenantBookings";
import OwnerListings from "./features/listings/OwnerListings";
import OwnerBookings from "./features/bookings/OwnerBookings";
import PropertyDetails from "./features/listings/PropertyDetails";
import SavedProperties from "./features/listings/SavedProperties";

function AppContent() {
  const location = useLocation();

  const hideFooter = ["/login", "/register"].includes(
    location.pathname
  );

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/listings"
          element={
            <PrivateRoute>
              <TenantListings />
            </PrivateRoute>
          }
        />

        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <TenantBookings />
            </PrivateRoute>
          }
        />

        <Route
          path="/owner/listings"
          element={
            <PrivateRoute>
              <OwnerListings />
            </PrivateRoute>
          }
        />

        <Route
          path="/owner/bookings"
          element={
            <PrivateRoute>
              <OwnerBookings />
            </PrivateRoute>
          }
        />

        <Route
          path="/property/:id"
          element={
            <PrivateRoute>
              <PropertyDetails />
            </PrivateRoute>
          }
        />

        <Route
          path="/saved"
          element={
            <PrivateRoute>
              <SavedProperties />
            </PrivateRoute>
          }
        />
      </Routes>

      {!hideFooter && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;