import { Routes, Route } from "react-router-dom";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Login from "./pages/Login";

import Overview from "./pages/dashboard/Overview";
import Notices from "./pages/dashboard/Notices";
import Fees from "./pages/dashboard/Fees";
import Attendance from "./pages/dashboard/Attendance";
import Assignments from "./pages/dashboard/Assignments";
import Results from "./pages/dashboard/Results";
import Accounts from "./pages/dashboard/Accounts";
import Academics from "./pages/dashboard/Academics";

export default function App() {
  return (
    <Routes>
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/login" element={<Login />} />
      </Route>

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Overview />} />
        <Route path="notices" element={<Notices />} />
        <Route path="fees" element={<ProtectedRoute allow={["ACCOUNTANT", "STUDENT", "CEO"]}><Fees /></ProtectedRoute>} />
        <Route path="attendance" element={<ProtectedRoute allow={["TEACHER", "STUDENT"]}><Attendance /></ProtectedRoute>} />
        <Route path="assignments" element={<ProtectedRoute allow={["TEACHER", "STUDENT"]}><Assignments /></ProtectedRoute>} />
        <Route path="results" element={<ProtectedRoute allow={["TEACHER", "STUDENT"]}><Results /></ProtectedRoute>} />
        <Route path="accounts" element={<ProtectedRoute allow={["REGISTRAR"]}><Accounts /></ProtectedRoute>} />
        <Route path="academics" element={<ProtectedRoute allow={["REGISTRAR"]}><Academics /></ProtectedRoute>} />
      </Route>
    </Routes>
  );
}
