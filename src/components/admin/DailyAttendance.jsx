import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import api from "../../utils/api";
import Breadcrumbs from "../common/Breadcrumbs";
import AttendanceRow from "./AttendanceRow";

export default function DailyAttendance() {
    const [selectedDate, setSelectedDate] = useState(
        new Date().toISOString().split("T")[0]
    );
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchDailyAttendance = async () => {
        try {
            setLoading(true);
            const res = await api.get(`attendance/daily?date=${selectedDate}`);
            setAttendanceList(res.data.data || []);
            console.log(res.data.data);
        } catch (err) {
            console.log("Error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDailyAttendance();
    }, [selectedDate]);

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs items={[{ label: "Attendance" }]} />

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100">
                        <div>
                            <div className="flex items-center gap-3">
                                <h3 className="font-bold text-xl text-gray-800">Daily Attendance</h3>
                                <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
                                    {attendanceList.length} Total
                                </span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Manage and review employee attendance records date-wise.
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <label className="text-xs font-medium text-gray-600">Select Date:</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Role</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">In / Out Time</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Total Hours</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Approval</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider">Approved By</th>
                                    <th className="px-6 py-3.5 font-semibold text-xs text-gray-500 uppercase tracking-wider text-right">Actions</th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-gray-100 bg-white">
                                {loading ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">Loading attendance records...</td>
                                    </tr>
                                ) : attendanceList.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-500 font-medium">No attendance records found for this date.</td>
                                    </tr>
                                ) : (
                                    attendanceList.map((item, index) => (
                                        <AttendanceRow
                                            key={item.user_id}
                                            item={item}
                                            index={index}
                                            selectedDate={selectedDate}
                                            onUpdateSuccess={fetchDailyAttendance}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}