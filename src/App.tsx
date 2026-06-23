import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landing-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}