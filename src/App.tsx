import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ConcertsGate from "./components/common/ConcertsGate";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/landing-page";
import Home from "./pages/home";
import CollectionPage from "./pages/collection";
import ConcertsPage from "./pages/concerts";
import { AuthProvider } from "./hooks/useAuth";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        {/* concerts — separate auth: cinder OR concerts password */}
        <Route element={<ConcertsGate />}>
          <Route element={<AppLayout />}>
            <Route
              path="/app/concerts"
              element={<ConcertsPage />}
            />
          </Route>
        </Route>

        {/* main cinder — requires cinder password */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/app"
              element={<Home />}
            />

            <Route
              path="/app/:collection"
              element={<CollectionPage />}
            />
          </Route>
        </Route>
      </Routes>
    </AuthProvider>
  );
}