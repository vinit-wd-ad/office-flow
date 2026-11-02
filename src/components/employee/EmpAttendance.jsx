import { useEffect, useState } from "react";
import Breadcrumbs from "../common/Breadcrumbs";
import EmpLayout from "./EmpLayout";
import api from "../../utils/api";

// Major Indian Festivals List (Aap isme aur bhi add kar sakte hain)
const indianFestivals = {
    "2026-01-26": "Republic Day",
    "2026-03-04": "Holi",
    "2026-03-26": "Id-ul-Fitr",
    "2026-08-15": "Independence Day",
    "2026-10-02": "Gandhi Jayanti",
    "2026-10-20": "Dussehra",
    "2026-11-08": "Diwali",
    "2026-12-25": "Christmas",
};

export default function EmpAttendance() {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);

    // Calendar Navigation States
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0 - 11

    // Fetch Attendance History on load
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get("attendance/history"); // Aapka index route
                if (response.data && response.data.status && response.data.data) {
                    const rawData = response.data.data;
                    const records = Array.isArray(rawData) ? rawData : (rawData?.data || []);
                    setAttendanceList(records);
                }
            } catch (err) {
                console.error("Failed to fetch attendance history", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, []);

    // Month change handlers
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    // Helper to get days in month
    const getDaysInMonth = (y, m) => new Date(y, m + 1, 0).getDate();
    const getFirstDayOfMonth = (y, m) => new Date(y, m, 1).getDay(); // 0 for Sunday

    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    // Month Names
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    // Map attendance records by date string "YYYY-MM-DD" for quick lookup
    const attendanceMap = {};
    attendanceList.forEach(record => {
        if (record.in_time) {
            const dateStr = record.in_time.split(' ')[0].split('T')[0];
            attendanceMap[dateStr] = record;
        }
    });

    return (
        <EmpLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs
                    items={[
                        { label: "Attendance Calendar" },
                    ]}
                />

                <div className="mt-6 bg-white rounded-xl shadow-sm border border-3 border-gray-400 p-5 sm:p-4">

                    {/* Header Controls: Month Selector & Navigation */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-2 pb-1 border-b border-b-gray-300">
                        <h2 className="text-xl font-bold text-gray-800">
                            {monthNames[month]} {year}
                        </h2>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={handlePrevMonth}
                                className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                            >
                                &larr; Prev
                            </button>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className="px-3.5 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition cursor-pointer"
                            >
                                Today
                            </button>
                            <button
                                onClick={handleNextMonth}
                                className="px-3.5 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                            >
                                Next &rarr;
                            </button>
                        </div>
                    </div>

                    {/* Status Color Legend */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-300">
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Present</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Late</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span> Half Day</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> Absent</span>
                        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-purple-500 inline-block"></span> Festival / Holiday</span>
                    </div>

                    {/* Calendar Grid Header (Days of week) */}
                    <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500 text-xs sm:text-sm mb-3">
                        <span className="text-red-500">Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>
                    </div>

                    {/* Calendar Days Grid */}
                    {loading ? (
                        <div className="py-20 text-center text-gray-400">Loading attendance data...</div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {/* Blank slots for previous month offset */}
                            {Array.from({ length: startDay }).map((_, index) => (
                                <div key={`empty-${index}`} className="h-24 sm:h-28 bg-gray-50/50 rounded-lg border border-transparent"></div>
                            ))}

                            {/* Actual Days of the Month */}
                            {Array.from({ length: totalDays }).map((_, index) => {
                                const dayNum = index + 1;
                                const formattedMonth = String(month + 1).padStart(2, '0');
                                const formattedDay = String(dayNum).padStart(2, '0');
                                const dateKey = `${year}-${formattedMonth}-${formattedDay}`;

                                const record = attendanceMap[dateKey];
                                const festival = indianFestivals[dateKey];

                                // Determine background color based on status
                                let statusBg = "bg-white border-gray-300 hover:border-gray-400";
                                let badgeText = "";
                                let badgeColor = "";

                                if (record) {
                                    if (record.status === 'present') {
                                        statusBg = "bg-emerald-50/70 border-emerald-200 text-emerald-900";
                                        badgeText = "Present";
                                        badgeColor = "bg-emerald-500 text-white";
                                    } else if (record.status === 'late') {
                                        statusBg = "bg-amber-50/70 border-amber-200 text-amber-900";
                                        badgeText = "Late";
                                        badgeColor = "bg-amber-500 text-white";
                                    } else if (record.status === 'half_day') {
                                        statusBg = "bg-blue-500/10 border-blue-200 text-blue-900";
                                        badgeText = "Half Day";
                                        badgeColor = "bg-blue-500 text-white";
                                    } else {
                                        statusBg = "bg-rose-50/70 border-rose-200 text-rose-900";
                                        badgeText = record.status;
                                        badgeColor = "bg-rose-500 text-white";
                                    }
                                }

                                const isToday =
                                    new Date().getDate() === dayNum &&
                                    new Date().getMonth() === month &&
                                    new Date().getFullYear() === year;

                                return (
                                    <div
                                        key={dateKey}
                                        className={`h-16 sm:h-20 p-2 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${statusBg} ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`text-xs sm:text-sm font-bold ${isToday ? "bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center" : "text-gray-700"}`}>
                                                {dayNum}
                                            </span>

                                            {/* Festival Badge */}
                                            {festival && (
                                                <span className="text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded truncate max-w-[70px]" title={festival}>
                                                    🎉 {festival}
                                                </span>
                                            )}
                                        </div>

                                        {/* Attendance Status Info */}
                                        <div className="mt-auto">
                                            {record ? (
                                                <div className="space-y-1">
                                                    <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${badgeColor}`}>
                                                        {badgeText}
                                                    </span>
                                                    <div className="text-[10px] text-gray-500 truncate">
                                                        In: {record.in_time ? new Date(record.in_time.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }) : '-'}
                                                    </div>
                                                </div>
                                            ) : (
                                                <span className="text-[10px] text-gray-400 italic">No Record</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </EmpLayout>
    );
}