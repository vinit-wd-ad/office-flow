import { Routes, Route } from "react-router-dom";

import AdminDashboard from "./components/admin/AdminDashboard";
import EmployeeDashboard from "./components/employee/EmployeeDashboard";
import Login from "./Login";
import NotAuthorized from "./NotAuthorized";
import Employee from "./components/admin/Employee";
import EmployeeNew from "./components/admin/EmployeeNew";
import Department from "./components/admin/Department";
import UserDetail from "./components/admin/UserDetail";
import EmpProfile from "./components/employee/EmpProfile";
import EmpProfileEdit from "./components/employee/EmpProfileEdit";
import Settings from "./components/admin/Settings";
import EmpAttendance from "./components/employee/EmpAttendance";
import Attendance from "./components/admin/Attendance";
import DailyAttendance from "./components/admin/DailyAttendance";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100">

      <Routes>

        {/* Login */}
        <Route path="/" element={<Login />} />

        {/* Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/employee" element={<Employee />} />
        <Route path="/admin/employee/new" element={<EmployeeNew />} />
        <Route path="/admin/employee/edit/:userId" element={<EmployeeNew />} />
        <Route path="/admin/employee/detail/:userId" element={<UserDetail />} />
        <Route path="/admin/attendance" element={<DailyAttendance />} />
        <Route path="/admin/department" element={<Department />} />
        <Route path="/admin/attendance/:userId" element={<Attendance />} />

        <Route path="/admin/setting" element={<Settings />} />

        {/* Employee */}
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/employee/profile" element={<EmpProfile />} />
        <Route path="/employee/profile/:userId" element={<EmpProfileEdit />} />
        <Route path="/employee/attendance" element={<EmpAttendance />} />

        {/* Unauthorized */}
        <Route path="/not-authorized" element={<NotAuthorized />} />

      </Routes>

    </div>
  );
}