import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";

export default function AttendanceRow({ item, index, selectedDate, onUpdateSuccess }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

    // Local editable state for this specific row
    const [formData, setFormData] = useState({
        status: item.status || "absent",
        in_time: item.in_time || "",
        out_time: item.out_time || "",
        approved: item.approved || "pending",
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const payload = {
                date: selectedDate,
                status: formData.status,
                in_time: formData.in_time || null,
                out_time: formData.out_time || null,
                approved: formData.approved,
            };

            const res = await api.put(`attendance/admin-update/${item.user_id}`, payload);
            if (res.data.status) {
                setIsEditing(false);
                onUpdateSuccess(); // Refresh parent data
            }
        } catch (err) {
            console.log("Error updating attendance:", err);
            alert("Failed to update attendance.");
        } finally {
            setLoading(false);
        }
    };

    // Helper for status badge styling
    const getStatusBadge = (status) => {
        const styles = {
            present: "bg-emerald-50 text-emerald-700 border-emerald-200",
            absent: "bg-rose-50 text-rose-700 border-rose-200",
            half_day: "bg-amber-50 text-amber-700 border-amber-200",
            leave: "bg-blue-50 text-blue-700 border-blue-200",
            late: "bg-purple-50 text-purple-700 border-purple-200",
        };
        return styles[status] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    // Helper for approval badge styling
    const getApprovalBadge = (approved) => {
        const styles = {
            approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
            rejected: "bg-rose-50 text-rose-700 border-rose-200",
            pending: "bg-amber-50 text-amber-700 border-amber-200",
        };
        return styles[approved] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    return (
        <tr className="hover:bg-indigo-50/30 transition-colors">
            {/* Employee Info */}
            <td className="px-6 py-4 whitespace-nowrap">
                <Link to={`/admin/employee/detail/${item.user_id}`}>
                    <p className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">{item.name}</p>
                    <p className="text-xs text-gray-500">{item.email}</p>
                </Link>
            </td>

            {/* Status */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <select
                        value={formData.status}
                        onChange={(e) => handleChange("status", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
                    >
                        <option value="present">Present</option>
                        <option value="absent">Absent</option>
                        <option value="half_day">Half Day</option>
                        <option value="leave">Leave</option>
                        <option value="late">Late</option>
                    </select>
                ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize inline-block ${getStatusBadge(item.status)}`}>
                        {item.status || "Absent"}
                    </span>
                )}
            </td>

            {/* In Time */}
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                {isEditing ? (
                    <input
                        type="time"
                        step="1"
                        value={formData.in_time}
                        onChange={(e) => handleChange("in_time", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    item.in_time || "-"
                )}
            </td>

            {/* Out Time */}
            <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                {isEditing ? (
                    <input
                        type="time"
                        step="1"
                        value={formData.out_time}
                        onChange={(e) => handleChange("out_time", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    item.out_time || "-"
                )}
            </td>

            {/* Total Hours */}
            <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-xs font-medium">
                {item.total_hours ? `${item.total_hours} hrs` : "-"}
            </td>

            {/* Approval */}
            <td className="px-6 py-4 whitespace-nowrap">
                {isEditing ? (
                    <select
                        value={formData.approved}
                        onChange={(e) => handleChange("approved", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 capitalize"
                    >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                ) : (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border capitalize inline-block ${getApprovalBadge(item.approved)}`}>
                        {item.approved || "pending"}
                    </span>
                )}
            </td>

            {/* Actions */}
            <td className="px-6 py-4 whitespace-nowrap text-right">
                {isEditing ? (
                    <div className="flex items-center justify-end gap-2">
                        <button
                            onClick={handleSave}
                            disabled={loading}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium transition shadow-sm disabled:opacity-50"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            onClick={() => setIsEditing(false)}
                            disabled={loading}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-medium transition"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-3 py-1.5 border border-gray-300 hover:border-indigo-600 hover:text-indigo-600 text-gray-700 rounded-lg text-xs font-medium transition shadow-sm bg-white"
                    >
                        Edit
                    </button>
                )}
            </td>
        </tr>
    );
}