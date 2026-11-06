import { useState } from "react";
import SidebarItem from "../common/SidebarItem";
import { getAvtar } from "../../utils/getAvtar";
import { Link, Navigate } from "react-router-dom";
import DesktopHeader from "../common/DesktopHeader";

export default function AdminLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const user = JSON.parse(localStorage.getItem("user") || "null");

    // localStorage.clear();

    if (!localStorage.getItem("logged_in")) {
        return <Navigate to="/" replace />;
    }
    if (user.role === "employee") {
        return <Navigate to="/not-authorized" replace />;
    }

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            {/* Mobile Header */}
            <header className="lg:hidden h-16 bg-white border-b flex items-center justify-between px-4">
                <div>
                    <h1 className="font-bold text-lg">OfficeFlow</h1>
                    <p className="text-xs text-slate-500">Office Management</p>
                </div>

                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-2 rounded-lg hover:bg-slate-100 text-xl"
                >
                    ☰
                </button>
            </header>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    onClick={() => setSidebarOpen(false)}
                    className="fixed inset-0 bg-black/40 z-40 lg:hidden"
                />
            )}

            {/* Sidebar */}
            <aside
                className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white
          transition-transform duration-300
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
            >
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="h-20 px-6 flex items-center border-b border-slate-800">
                        <div>
                            <h1 className="text-xl font-bold">OfficeFlow</h1>
                            <p className="text-xs text-slate-400">
                                Office Management
                            </p>
                        </div>

                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="ml-auto lg:hidden text-slate-400 text-xl"
                        >
                            ×
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-1">
                        <SidebarItem icon="➔" to="/admin" label="Dashboard" active />
                        <SidebarItem icon="➔" to="/admin/employee" label="Employees" />
                        <SidebarItem icon="➔" to="/admin/attendance" label="Attendance" />
                        {/* <SidebarItem icon="➔" label="Leave Management" /> */}
                        <SidebarItem icon="➔" to="/admin/department" label="Departments" />
                        {/* <SidebarItem icon="➔" label="Payroll" />
                        <SidebarItem icon="➔" label="Reports" /> */}

                        <div className="pt-5 pb-2 px-4 text-[11px] uppercase tracking-wider text-slate-500">
                            System
                        </div>

                        <SidebarItem icon="⚙" to="/admin/setting" label="Settings" />
                        {(user.role != 'employee') && (
                            <SidebarItem icon="➔" to="/employee" label="Switch Panel" />
                        )}
                    </nav>

                    {/* Admin */}
                    <div className="p-4 border-t border-slate-800">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center font-semibold">
                                {getAvtar(user.name)}
                            </div>

                            <div>
                                <p className="text-sm font-medium">{user.name}</p>
                                <p className="text-xs text-slate-400">
                                    {user.role}
                                </p>
                            </div>

                            <button className="ml-auto text-slate-400">
                                ⋮
                            </button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="lg:ml-64">
                {/* Desktop Header */}
                <DesktopHeader link="/employee" />

                {/* Content */}
                {children}
            </main>
        </div>
    );
}
