import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../../utils/api";
import { formatWorkingHours } from "../../utils/formatWorkingHours";

export default function AttendanceRow({ item, index, selectedDate, onUpdateSuccess }) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);

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
                onUpdateSuccess();
            }
        } catch (err) {
            console.log("Error updating attendance:", err);
            alert("Failed to update attendance.");
        } finally {
            setLoading(false);
        }
    };

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

    const getApprovalBadge = (approved) => {
        const styles = {
            approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
            rejected: "bg-rose-50 text-rose-700 border-rose-200",
            pending: "bg-amber-50 text-amber-700 border-amber-200",
        };
        return styles[approved] || "bg-gray-50 text-gray-700 border-gray-200";
    };

    const formatTime12Hour = (timeString) => {
        if (!timeString) return "-";
        const [hours, minutes] = timeString.split(":");
        let h = parseInt(hours, 10);
        const m = minutes || "00";

        const ampm = h >= 12 ? "PM" : "AM";
        h = h % 12;
        h = h ? h : 12;

        return `${h}:${m} ${ampm}`;
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
            <td className="px-6 py-4 whitespace-nowrap">
                <span className="text-xs font-semibold capitalize text-gray-600">
                    {item.position}
                </span>
                <p className="text-xs text-gray-500">{item.department}</p>
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
                        {item.status || "absent"}
                    </span>
                )}
            </td>

            {/* In /Out  Time */}
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                {isEditing ? (
                    <input
                        type="time"
                        step="1"
                        value={formData.in_time}
                        onChange={(e) => handleChange("in_time", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    item.in_time ? formatTime12Hour(item.in_time) : "-"
                )} <b>-</b> {isEditing ? (
                    <input
                        type="time"
                        step="1"
                        value={formData.out_time}
                        onChange={(e) => handleChange("out_time", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                ) : (
                    item.out_time ? formatTime12Hour(item.out_time) : "-"
                )}
            </td>

            {/* Total Hours */}
            <td className="px-6 py-4 text-gray-600 whitespace-nowrap text-xs font-medium">
                {formatWorkingHours(item.total_hours)}
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

            {/* Approved By Column */}
            <td className="px-6 py-4 whitespace-nowrap text-xs">
                {item.approved_by ? (
                    <div>
                        <p className="font-semibold text-gray-800">{item.approved_by.name}</p>
                        <span className="capitalize inline-block px-2 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded mt-0.5 border border-gray-200">
                            {item.approved_by.role}
                        </span>
                    </div>
                ) : (
                    <span className="text-gray-400">-</span>
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