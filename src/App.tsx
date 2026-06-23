import { Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LandingPage from "./pages/landing-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route
            path="/app"
            element={<div />}
          />

          <Route
            path="/app/:collection"
            element={<div />}
          />
        </Route>
      </Route>
    </Routes>
  );
}