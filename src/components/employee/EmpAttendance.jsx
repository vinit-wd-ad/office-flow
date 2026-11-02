
import { useEffect, useState } from "react";
import Breadcrumbs from "../common/Breadcrumbs";
import EmpLayout from "./EmpLayout";
import api from "../../utils/api";

// Major Indian Festivals List
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
    const [currentDate, setCurrentDate] = useState(new Date());

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Fetch Attendance History
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await api.get("attendance/history");

                if (response.data?.status && response.data?.data) {
                    const rawData = response.data.data;
                    const records = Array.isArray(rawData)
                        ? rawData
                        : (rawData?.data || []);

                    setAttendanceList(records);
                } else {
                    setAttendanceList([]);
                }
            } catch (err) {
                console.error(
                    "Failed to fetch attendance history",
                    err
                );
                setAttendanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Month Navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
    };

    const handleToday = () => {
        setCurrentDate(new Date());
    };

    // Calendar Helpers
    const getDaysInMonth = (y, m) =>
        new Date(y, m + 1, 0).getDate();

    const getFirstDayOfMonth = (y, m) =>
        new Date(y, m, 1).getDay();

    const totalDays = getDaysInMonth(year, month);
    const startDay = getFirstDayOfMonth(year, month);

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    // Map Attendance Using attendance_date
    const attendanceMap = {};

    attendanceList.forEach((record) => {
        if (record.attendance_date) {
            attendanceMap[record.attendance_date] = record;
        }
    });

    // Format time (HH:mm:ss -> 10:05 AM)
    const formatTime = (time) => {
        if (!time) return "-";

        const [hours, minutes] = time.split(":");

        const date = new Date();
        date.setHours(Number(hours), Number(minutes), 0, 0);

        return date.toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });
    };

    // Status Configuration
    const getStatusStyle = (status) => {
        switch (status) {
            case "present":
                return {
                    label: "Present",
                    background:
                        "bg-emerald-50 border-emerald-200 text-emerald-900",
                    badge:
                        "bg-emerald-500 text-white",
                };

            case "late":
                return {
                    label: "Late",
                    background:
                        "bg-amber-50 border-amber-200 text-amber-900",
                    badge:
                        "bg-amber-500 text-white",
                };

            case "half_day":
                return {
                    label: "Half Day",
                    background:
                        "bg-blue-50 border-blue-200 text-blue-900",
                    badge:
                        "bg-blue-500 text-white",
                };

            case "absent":
                return {
                    label: "Absent",
                    background:
                        "bg-rose-50 border-rose-200 text-rose-900",
                    badge:
                        "bg-rose-500 text-white",
                };

            case "on_leave":
                return {
                    label: "On Leave",
                    background:
                        "bg-purple-50 border-purple-200 text-purple-900",
                    badge:
                        "bg-purple-500 text-white",
                };

            default:
                return {
                    label: status || "Unknown",
                    background:
                        "bg-gray-50 border-gray-200 text-gray-900",
                    badge:
                        "bg-gray-500 text-white",
                };
        }
    };

    // Current Date
    const today = new Date();

    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    return (
        <EmpLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">

                <Breadcrumbs
                    items={[
                        { label: "Attendance Calendar" },
                    ]}
                />

                <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-300 p-5 sm:p-4">

                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-300">

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
                                onClick={handleToday}
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

                    {/* Status Legend */}
                    <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-300">

                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                            Present
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                            Late
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                            Half Day
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
                            Absent
                        </span>

                        <span className="flex items-center gap-1.5">
                            <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                            Festival / Holiday
                        </span>

                    </div>

                    {/* Week Days */}
                    <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500 text-xs sm:text-sm mb-3">

                        <span className="text-red-500">Sun</span>
                        <span>Mon</span>
                        <span>Tue</span>
                        <span>Wed</span>
                        <span>Thu</span>
                        <span>Fri</span>
                        <span>Sat</span>

                    </div>

                    {/* Calendar Grid */}
                    {loading ? (

                        <div className="py-20 text-center text-gray-400">
                            Loading attendance data...
                        </div>

                    ) : (

                        <div className="grid grid-cols-7 gap-2">

                                {/* Empty Slots */}
                            {Array.from({ length: startDay }).map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="h-24 sm:h-28 bg-gray-50/50 rounded-lg border border-transparent"
                                />
                            ))}

                                {/* Calendar Days */}
                            {Array.from({ length: totalDays }).map((_, index) => {

                                const dayNum = index + 1;

                                const formattedMonth = String(month + 1).padStart(2, "0");
                                const formattedDay = String(dayNum).padStart(2, "0");

                                const dateKey =
                                    `${year}-${formattedMonth}-${formattedDay}`;

                                const record = attendanceMap[dateKey];
                                const festival = indianFestivals[dateKey];

                                const isToday = dateKey === todayKey;

                                const isFutureDate = dateKey > todayKey;

                                const statusStyle = record
                                    ? getStatusStyle(record.status)
                                    : null;

                                let statusBg =
                                    "bg-white border-gray-300 hover:border-gray-400";

                                if (record) {
                                    statusBg = statusStyle.background;
                                } else if (festival) {
                                    statusBg =
                                        "bg-purple-50 border-purple-200";
                                } else if (isFutureDate) {
                                    statusBg =
                                        "bg-gray-50 border-gray-200";
                                }

                                return (

                                    <div
                                        key={dateKey}
                                        className={`min-h-24 sm:min-h-28 p-2 rounded-xl border flex flex-col justify-between transition relative overflow-hidden ${statusBg} ${isToday ? "ring-2 ring-indigo-500" : ""}`}
                                    >

                                        {/* Date and Festival */}
                                        <div className="flex items-center justify-between gap-1">

                                            <span
                                                className={`text-xs sm:text-sm font-bold shrink-0 ${isToday
                                                        ? "bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                                                        : "text-gray-700"
                                                    }`}
                                            >
                                                {dayNum}
                                            </span>

                                            {festival && (
                                                <span
                                                    className="text-[9px] sm:text-[10px] font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded truncate max-w-[75%]"
                                                    title={festival}
                                                >
                                                    {festival}
                                                </span>
                                            )}

                                        </div>

                                        {/* Attendance Information */}
                                        <div className="mt-2 space-y-1">

                                            {record ? (

                                                <>

                                                    <span
                                                        className={`inline-block text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-medium uppercase ${statusStyle.badge}`}
                                                    >
                                                        {statusStyle.label}
                                                    </span>

                                                    <div className="text-[10px] text-gray-600 truncate">
                                                        In: {formatTime(record.in_time)}
                                                    </div>

                                                    <div className="text-[10px] text-gray-600 truncate">
                                                        Out: {formatTime(record.out_time)}
                                                    </div>

                                                    {record.total_working_hours && (
                                                        <div className="text-[10px] text-gray-600 truncate">
                                                            Hours: {record.total_working_hours}
                                                        </div>
                                                    )}

                                                </>

                                            ) : festival ? (

                                                <span className="text-[10px] text-purple-600 font-medium">
                                                    Holiday
                                                </span>

                                            ) : isFutureDate ? (

                                                <span className="text-[10px] text-gray-400 italic">
                                                    Upcoming
                                                </span>

                                            ) : (

                                                            <span className="text-[10px] text-gray-400 italic">
                                                                No Record
                                                            </span>

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
