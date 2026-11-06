
import { useEffect, useState } from "react";
import Breadcrumbs from "../common/Breadcrumbs";
import api from "../../utils/api";
import { formatWorkingHours } from "../../utils/formatWorkingHours";

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

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function MonthlyAttendance({ userId = null }) {
    const [attendanceList, setAttendanceList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const monthNames = [
        "January", "February", "March", "April",
        "May", "June", "July", "August",
        "September", "October", "November", "December"
    ];

    // Fetch Attendance
    useEffect(() => {
        const fetchHistory = async () => {
            try {
                console.log(userId);

                const endpoint = userId
                    ? `attendance/history?user_id=${encodeURIComponent(userId)}`
                    : "attendance/history";
                const response = await api.get(endpoint);

                if (response.data?.status && response.data?.data) {
                    const rawData = response.data.data;
                    const records = Array.isArray(rawData)
                        ? rawData
                        : rawData?.data || [];

                    setAttendanceList(records);
                } else {
                    setAttendanceList([]);
                }
            } catch (error) {
                console.error("Failed to fetch attendance history", error);
                setAttendanceList([]);
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
    }, []);

    // Calendar Navigation
    const handlePrevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1));
        setSelectedDate(null);
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1));
        setSelectedDate(null);
    };

    const handleToday = () => {
        setCurrentDate(new Date());
        setSelectedDate(null);
    };

    const totalDays = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    // Today's date
    const today = new Date();

    const todayKey = [
        today.getFullYear(),
        String(today.getMonth() + 1).padStart(2, "0"),
        String(today.getDate()).padStart(2, "0"),
    ].join("-");

    // Attendance Map
    const attendanceMap = {};

    attendanceList.forEach((record) => {
        if (record.attendance_date) {
            attendanceMap[record.attendance_date] = record;
        }
    });

    // Format Time
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

    // Format Date
    const formatDate = (dateKey) => {
        const [y, m, d] = dateKey.split("-").map(Number);

        return new Date(y, m - 1, d).toLocaleDateString("en-IN", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
        });
    };

    // Status Configuration
    const getStatusStyle = (status) => {
        switch (status) {
            case "present":
                return {
                    label: "Present",
                    letter: "P",
                    badge: "bg-emerald-500 text-white",
                    background: "bg-emerald-50 border-emerald-300",
                    text: "text-emerald-700",
                };

            case "late":
                return {
                    label: "Late",
                    letter: "L",
                    badge: "bg-amber-500 text-white",
                    background: "bg-amber-50 border-amber-300",
                    text: "text-amber-700",
                };

            case "half_day":
                return {
                    label: "Half Day",
                    letter: "H",
                    badge: "bg-blue-500 text-white",
                    background: "bg-blue-50 border-blue-300",
                    text: "text-blue-700",
                };

            case "absent":
                return {
                    label: "Absent",
                    letter: "A",
                    badge: "bg-rose-500 text-white",
                    background: "bg-rose-50 border-rose-300",
                    text: "text-rose-700",
                };

            case "on_leave":
                return {
                    label: "On Leave",
                    letter: "O",
                    badge: "bg-purple-500 text-white",
                    background: "bg-purple-50 border-purple-300",
                    text: "text-purple-700",
                };

            default:
                return {
                    label: status || "Unknown",
                    letter: "?",
                    badge: "bg-gray-500 text-white",
                    background: "bg-gray-50 border-gray-300",
                    text: "text-gray-700",
                };
        }
    };

    // Get information for a date
    const getDayInfo = (dayNum) => {
        const dateKey = [
            year,
            String(month + 1).padStart(2, "0"),
            String(dayNum).padStart(2, "0"),
        ].join("-");

        const record = attendanceMap[dateKey];
        const festival = indianFestivals[dateKey];
        const dayOfWeek = new Date(year, month, dayNum).getDay();

        return {
            dateKey,
            record,
            festival,
            dayOfWeek,
            isSunday: dayOfWeek === 0,
            isToday: dateKey === todayKey,
            isFuture: dateKey > todayKey,
            status: record ? getStatusStyle(record.status) : null,
        };
    };

    // Mobile date cell background
    const getMobileCellStyle = (info) => {
        if (info.record?.status === "absent") {
            return "bg-rose-100 border-rose-300";
        }

        if (info.festival) {
            return "bg-purple-100 border-purple-300";
        }

        if (info.isSunday) {
            return "bg-yellow-100 border-yellow-300";
        }

        if (info.record) {
            return info.status.background;
        }

        return "bg-white border-gray-200";
    };

    // Mobile date cell
    const renderMobileDay = (dayNum) => {
        const info = getDayInfo(dayNum);

        let letter = "";
        let letterStyle = "";

        if (info.record) {
            letter = info.status.letter;
            letterStyle = info.status.badge;
        } else if (info.festival) {
            letter = "F";
            letterStyle = "bg-purple-500 text-white";
        }

        return (
            <button
                key={info.dateKey}
                type="button"
                onClick={() => setSelectedDate(info.dateKey)}
                aria-label={`View attendance for ${formatDate(info.dateKey)}`}
                className={`
                    relative aspect-square min-w-0 w-full
                    rounded-lg border
                    flex flex-col items-center justify-center gap-1
                    transition active:scale-95
                    ${getMobileCellStyle(info)}
                    ${info.isToday ? "ring-2 ring-indigo-500" : ""}
                `}
            >
                <span className="text-sm font-bold text-gray-800">
                    {dayNum}
                </span>

                {letter && (
                    <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${letterStyle}`}
                    >
                        {letter}
                    </span>
                )}

                {info.isToday && (
                    <span className="absolute top-0.5 right-1 w-1.5 h-1.5 rounded-full bg-indigo-600" />
                )}
            </button>
        );
    };

    // Desktop date cell
    const renderDesktopDay = (dayNum) => {
        const info = getDayInfo(dayNum);

        let background = "bg-white border-gray-300";

        if (info.record) {
            background = info.status.background;
        } else if (info.festival) {
            background = "bg-purple-50 border-purple-200";
        } else if (info.isSunday) {
            background = "bg-yellow-50 border-yellow-200";
        } else if (info.isFuture) {
            background = "bg-gray-50 border-gray-200";
        }

        return (
            <div
                key={info.dateKey}
                className={`
                    min-h-28 p-2 rounded-xl border
                    flex flex-col justify-between
                    ${background}
                    ${info.isToday ? "ring-2 ring-indigo-500" : ""}
                `}
            >
                <div className="flex items-center justify-between gap-1">
                    <span className={`
                        text-sm font-bold
                        ${info.isToday
                            ? "bg-indigo-600 text-white w-6 h-6 rounded-full flex items-center justify-center"
                            : "text-gray-700"
                        }
                    `}>
                        {dayNum}
                    </span>

                    {info.festival && (
                        <span
                            title={info.festival}
                            className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded truncate max-w-[75%]"
                        >
                            {info.festival}
                        </span>
                    )}
                </div>

                <div className="space-y-1 mt-2">
                    {info.record ? (
                        <>
                            <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium ${info.status.badge}`}>
                                {info.status.label}
                            </span>

                            <div className="text-[10px] text-gray-600">
                                In: {formatTime(info.record.in_time)}
                            </div>

                            <div className="text-[10px] text-gray-600">
                                Out: {formatTime(info.record.out_time)}
                            </div>

                            {info.record.total_working_hours && (
                                <div className="text-[10px] text-gray-600">
                                    Hours: {formatWorkingHours(info.record.total_working_hours)}
                                </div>
                            )}
                        </>
                    ) : info.festival ? (
                        <span className="text-[10px] text-purple-600">
                            Holiday
                        </span>
                    ) : !info.isFuture ? (
                        <span className="text-[10px] text-gray-400 italic">
                            No Record
                        </span>
                    ) : (
                        <span className="text-[10px] text-gray-400 italic">
                            Upcoming
                        </span>
                    )}
                </div>
            </div>
        );
    };

    // Selected date popup data
    const selectedInfo = selectedDate
        ? (() => {
            const [y, m, d] = selectedDate.split("-").map(Number);
            const dayNum = d;
            const dateKey = selectedDate;
            const record = attendanceMap[dateKey];
            const festival = indianFestivals[dateKey];
            const dayOfWeek = new Date(y, m - 1, d).getDay();

            return {
                record,
                festival,
                dayOfWeek,
                isSunday: dayOfWeek === 0,
                isFuture: dateKey > todayKey,
                status: record ? getStatusStyle(record.status) : null,
            };
        })()
        : null;

    return (
        <div className="p-2 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">

            <Breadcrumbs
                items={[
                    { label: "Attendance Calendar" },
                ]}
            />

            <div className="mt-3 sm:mt-6 bg-white rounded-xl shadow-sm border border-gray-300 p-2 sm:p-4">

                {/* Header */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-300">

                    <h2 className="text-xl font-bold text-gray-800">
                        {monthNames[month]} {year}
                    </h2>

                    <div className="flex items-center gap-2 sm:gap-3">
                        <button
                            onClick={handlePrevMonth}
                            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            &larr; Prev
                        </button>

                        <button
                            onClick={handleToday}
                            className="px-3 py-2 text-sm text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg"
                        >
                            Today
                        </button>

                        <button
                            onClick={handleNextMonth}
                            className="px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
                        >
                            Next &rarr;
                        </button>
                    </div>
                </div>

                {/* Legend */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-5 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-300">

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-emerald-500" />
                        Present
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-amber-500" />
                        Late
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-blue-500" />
                        Half Day
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-rose-500" />
                        Absent
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-purple-500" />
                        Festival / Holiday
                    </span>

                    <span className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded-full bg-yellow-400" />
                        Sunday
                    </span>
                </div>

                {loading ? (
                    <div className="py-20 text-center text-gray-400">
                        Loading attendance data...
                    </div>
                ) : (
                    <>
                        {/* DESKTOP CALENDAR */}
                        <div className="hidden sm:block">

                            <div className="grid grid-cols-7 gap-2 text-center font-semibold text-gray-500 text-sm mb-3">
                                {weekDays.map((day, index) => (
                                    <span
                                        key={day}
                                        className={index === 0 ? "text-red-500" : ""}
                                    >
                                        {day}
                                    </span>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-2">
                                {Array.from({ length: startDay }).map((_, index) => (
                                    <div key={`empty-${index}`} />
                                ))}

                                {Array.from({ length: totalDays }).map((_, index) =>
                                    renderDesktopDay(index + 1)
                                )}
                            </div>
                        </div>

                        {/* MOBILE COMPACT CALENDAR */}
                        <div className="grid grid-cols-7 gap-1 sm:hidden">

                            {weekDays.map((day, index) => (
                                <div
                                    key={`heading-${day}`}
                                    className={`text-center text-xs font-semibold py-2 ${index === 0
                                        ? "text-red-500"
                                        : "text-gray-500"
                                        }`}
                                >
                                    {day}
                                </div>
                            ))}

                            {Array.from({ length: startDay }).map((_, index) => (
                                <div key={`mobile-empty-${index}`} />
                            ))}

                            {Array.from({ length: totalDays }).map((_, index) =>
                                renderMobileDay(index + 1)
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* MOBILE DATE DETAILS POPUP */}
            {selectedDate && selectedInfo && (
                <div
                    className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4 sm:hidden"
                    onClick={() => setSelectedDate(null)}
                >
                    <div
                        className="bg-white w-full max-w-sm rounded-2xl shadow-xl p-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Popup Header */}
                        <div className="flex items-start justify-between gap-3 mb-4">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">
                                    Attendance Details
                                </h3>

                                <p className="text-sm text-gray-500 mt-1">
                                    {formatDate(selectedDate)}
                                </p>
                            </div>

                            <button
                                onClick={() => setSelectedDate(null)}
                                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200"
                                aria-label="Close popup"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Status */}
                        <div className="border border-gray-200 rounded-xl p-4 space-y-3">

                            {selectedInfo.record ? (
                                <>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-500">
                                            Status
                                        </span>

                                        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${selectedInfo.status.badge}`}>
                                            {selectedInfo.status.label}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            Check In
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                            {formatTime(selectedInfo.record.in_time)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            Check Out
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                            {formatTime(selectedInfo.record.out_time)}
                                        </span>
                                    </div>

                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">
                                            Working Hours
                                        </span>
                                        <span className="font-semibold text-gray-800">
                                            {selectedInfo.record.total_working_hours || "-"}
                                        </span>
                                    </div>
                                </>
                            ) : selectedInfo.festival ? (
                                <div className="text-center py-2">
                                    <span className="text-purple-600 font-semibold">
                                        {selectedInfo.festival}
                                    </span>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Holiday
                                    </p>
                                </div>
                            ) : selectedInfo.isFuture ? (
                                <p className="text-center text-sm text-gray-500 py-2">
                                    Upcoming date. No attendance record yet.
                                </p>
                            ) : selectedInfo.isSunday ? (
                                <p className="text-center text-sm text-yellow-700 py-2">
                                    Sunday / Weekly Off
                                </p>
                            ) : (
                                <p className="text-center text-sm text-gray-500 py-2">
                                    No attendance record found.
                                </p>
                            )}

                            {selectedInfo.festival && selectedInfo.record && (
                                <div className="text-xs text-purple-600 border-t pt-2">
                                    Festival: {selectedInfo.festival}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={() => setSelectedDate(null)}
                            className="w-full mt-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}
