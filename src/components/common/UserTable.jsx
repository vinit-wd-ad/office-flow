import { useEffect, useState } from "react";
import api from "../../utils/api";
import { getAvtar } from "../../utils/getAvtar";
import { Link } from "react-router-dom";

export default function UserTable({ limit = null, className = "" }) {
    const [users, setUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                setLoading(true);
                const res = await api.get("user");
                setUsers(res.data.users || res.data.data || []);
            } catch (err) {
                console.log("Error:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const filteredUsers = users.filter((user) =>
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm)
    );

    const displayedUsers = limit ? filteredUsers.slice(0, limit) : filteredUsers;

    return (
        <div className={`bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden ${className}`}>
            <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                <div>
                    <div className="flex items-center gap-3">
                        <h3 className="font-bold text-xl text-gray-800">Employees</h3>
                        <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                            {users.length} Total
                        </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                        Manage team members and view their details.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <Link
                        to="/admin/employee/new"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Employee
                    </Link>
                </div>
            </div>

            <div className="p-4 bg-gray-50/50 border-b border-gray-100">
                <div className="relative w-full sm:w-80">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search by name, email, phone..."
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Employee</th>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Phone</th>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Position / Department</th>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">Loading employees...</td>
                            </tr>
                        ) : displayedUsers.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-500 font-medium">No employees found.</td>
                            </tr>
                        ) : (
                            displayedUsers.map((user) => {
                                const details = user.user_details || {};
                                const rawDate = details.joining_date || user.created_at;
                                const formattedJoined = rawDate
                                    ? new Date(rawDate).toLocaleDateString("en-IN", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                    })
                                    : "-";

                                return (
                                    <EmployeeRow
                                        key={user.id}
                                        profilePhoto={details.profile_photo}
                                        initials={getAvtar ? getAvtar(user.name) : user.name?.slice(0, 2)}
                                        name={user.name}
                                        email={user.email}
                                        phone={user.phone}
                                        department={user.positions?.department?.name ?? "-"}
                                        position={user.positions?.name ?? "-"}
                                        role={user.role}
                                        joined={formattedJoined}
                                        userId={user.id}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function EmployeeRow({
    profilePhoto,
    initials,
    name,
    email,
    phone,
    department,
    position,
    role,
    joined,
    userId,
}) {
    return (
        <tr className="hover:bg-indigo-50/30 transition-colors group">
            <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-3">
                    {profilePhoto ? (
                        <img
                            src={profilePhoto}
                            alt={name}
                            className="w-10 h-10 rounded-full object-cover border border-gray-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0 shadow-sm">
                            {initials}
                        </div>
                    )}

                    <div>
                        <p className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{name}</p>
                        <p className="text-xs text-gray-500">{email}</p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-sm">{phone || "-"}</td>

            <td className="px-6 py-4 whitespace-nowrap">
                <div>
                    <p className="font-medium text-gray-800">{position}</p>
                    <p className="text-xs text-gray-500">{department}</p>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                <span className="capitalize inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                    {role || "employee"}
                </span>
            </td>

            <td className="px-6 py-4 text-gray-500 whitespace-nowrap text-xs">{joined}</td>

            <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex items-center justify-end gap-1.5">
                    <Link
                        to={`/admin/employee/detail/${userId}`}
                        title="View Profile"
                        className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                    </Link>

                    <Link
                        to={`/admin/employee/edit/${userId}`}
                        title="Edit Employee"
                        className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </Link>
                </div>
            </td>
        </tr>
    );
}