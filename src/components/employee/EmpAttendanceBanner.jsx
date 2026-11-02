import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function EmpAttendanceBanner() {
    const [officeSettings, setOfficeSettings] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");

    // States for attendance tracking & workflow
    const [todayAttendance, setTodayAttendance] = useState(null);
    const [locationVerifiedAt, setLocationVerifiedAt] = useState(null);
    const [isExpired, setIsExpired] = useState(false);
    const [notes, setNotes] = useState("");
    const [selectedImage, setSelectedImage] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch office settings and today's attendance status on load
    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Office Settings
                const settingsRes = await api.get("attendance-setting");
                if (settingsRes.data && settingsRes.data.data) {
                    setOfficeSettings(settingsRes.data.data);
                }

                // 2. Fetch Today's Attendance directly
                const attendanceRes = await api.get("attendance/today");
                if (attendanceRes.data && attendanceRes.data.status && attendanceRes.data.data) {
                    setTodayAttendance(attendanceRes.data.data);
                } else {
                    setTodayAttendance(null);
                }
            } catch (err) {
                console.error("Failed to load initial data", err);
                setErrorMessage("Failed to load attendance details.");
            }
        };
        fetchData();
    }, []);

    // Timer effect to expire location verification after 2 minutes (120,000 ms)
    useEffect(() => {
        let timer;
        if (locationVerifiedAt) {
            const interval = 1000;
            timer = setInterval(() => {
                const elapsed = Date.now() - locationVerifiedAt;
                if (elapsed > 120 * 1000) {
                    setIsExpired(true);
                    clearInterval(timer);
                }
            }, interval);
        }
        return () => clearInterval(timer);
    }, [locationVerifiedAt]);

    // Helper to safely format time avoiding "Invalid Date"
    const formatTimeString = (timeString) => {
        if (!timeString) return "";
        const formattedStr = timeString.includes(' ') ? timeString.replace(' ', 'T') : timeString;
        const date = new Date(formattedStr);
        if (isNaN(date.getTime())) return timeString;
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // 🟢 FIX: Helper to get local date time string in YYYY-MM-DD HH:mm:ss format
    const getLocalCurrentTime = () => {
        const now = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    };

    // Distance calculation formula
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371e3;
        const dLat = ((lat2 - lat1) * Math.PI) / 180;
        const dLon = ((lon2 - lon1) * Math.PI) / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c);
    };

    // Handler to refresh location
    const handleRefreshLocation = () => {
        if (!officeSettings) {
            setErrorMessage("Office settings not loaded yet.");
            return;
        }

        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            return;
        }

        setIsTesting(true);
        setErrorMessage("");
        setTestResult(null);
        setIsExpired(false);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const userLat = position.coords.latitude;
                const userLon = position.coords.longitude;

                const officeLat = parseFloat(officeSettings.latitude);
                const officeLon = parseFloat(officeSettings.longitude);
                const allowedRadius = parseFloat(officeSettings.allow_radius_meters);

                const distance = calculateDistance(userLat, userLon, officeLat, officeLon);
                const isInside = distance <= allowedRadius;

                setTestResult({
                    distance,
                    allowedRadius,
                    isInside,
                    userLat,
                    userLon,
                });
                setLocationVerifiedAt(Date.now());
                setIsTesting(false);
            },
            (error) => {
                console.error(error);
                setErrorMessage("Unable to retrieve location. Please check phone GPS and browser permissions.");
                setIsTesting(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 0
            }
        );
    };

    // Handler for Check-In or Check-Out action using FormData
    const handleAttendanceAction = async () => {
        if (!testResult || isExpired) {
            setErrorMessage("Location verification expired or missing. Please refresh location again.");
            return;
        }

        const hasCheckedIn = todayAttendance && !todayAttendance.out_time;

        if (!testResult.isInside && !notes.trim()) {
            setErrorMessage("You are outside the office radius. Please provide notes explaining your field work.");
            return;
        }

        setActionLoading(true);
        setErrorMessage("");

        try {
            let endpoint = '';
            const formData = new FormData();
            formData.append('latitude', testResult.userLat);
            formData.append('longitude', testResult.userLon);
            formData.append('notes', notes);

            if (selectedImage) {
                formData.append('image', selectedImage);
            }

            // FIX APPLIED: using getLocalCurrentTime() instead of ISOString
            if (!hasCheckedIn) {
                endpoint = 'attendance/check-in';
                formData.append('in_time', getLocalCurrentTime());
            } else {
                endpoint = `attendance/${todayAttendance.id}/check-out`;
                formData.append('out_time', getLocalCurrentTime());
            }

            const response = await api.post(endpoint, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data && response.data.status) {
                alert(response.data.message || "Action successful!");
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            setErrorMessage(err.response?.data?.message || "Something went wrong during attendance action.");
        } finally {
            setActionLoading(false);
        }
    };

    // Determine current attendance state
    const hasCheckedInToday = todayAttendance && !todayAttendance.out_time;
    const isCompletedToday = todayAttendance && todayAttendance.out_time;

    return (
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-md p-6 text-white mb-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                    <p className="text-indigo-100 text-sm">
                        GPS Attendance System
                    </p>

                    <h3 className="text-2xl sm:text-3xl font-bold mt-2">
                        {officeSettings ? officeSettings.office_name : "Loading Office..."}
                    </h3>

                    <p className="text-indigo-100 text-sm mt-2">
                        {officeSettings ? `Allowed Radius Limit: ${officeSettings.allow_radius_meters} meters` : "Fetching configuration..."}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {!isCompletedToday && (
                        <button
                            onClick={handleRefreshLocation}
                            disabled={isTesting || !officeSettings}
                            className="bg-white text-indigo-600 px-4 py-3 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition shadow disabled:opacity-50 cursor-pointer flex items-center gap-2"
                            title="Refresh GPS Location"
                        >
                            <svg className={`w-5 h-5 ${isTesting ? "animate-spin" : ""}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            {isTesting ? "Fetching GPS..." : (hasCheckedInToday ? "Refresh for Check-Out" : "Refresh Location")}
                        </button>
                    )}
                </div>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div className="mt-4 p-3 bg-red-500/20 border border-red-300 text-white text-sm rounded-lg">
                    {errorMessage}
                </div>
            )}

            {/* Compact Checked-In Time Display */}
            {hasCheckedInToday && (
                <div className="mt-4 p-3 bg-emerald-500/25 border border-emerald-300 text-emerald-100 rounded-lg text-sm flex items-center justify-between">
                    <div>
                        <span className="font-medium text-white/90">Check-In Time :</span> <strong className="text-white ml-1">{formatTimeString(todayAttendance.in_time)}</strong>
                    </div>
                    <span className="text-xs bg-emerald-500/40 text-white px-2.5 py-1 rounded-full font-medium">
                        Active
                    </span>
                </div>
            )}

            {/* Attendance Completed Status Message */}
            {isCompletedToday && (
                <div className="mt-4 p-3 bg-emerald-500/25 border border-emerald-300 text-emerald-100 rounded-lg text-sm">
                    <p className="font-medium">✅ Attendance Completed for Today (In: {formatTimeString(todayAttendance.in_time)} - Out: {formatTimeString(todayAttendance.out_time)})</p>
                </div>
            )}

            {/* Location Result & Action Panel */}
            {testResult && !isCompletedToday && (
                <div className={`mt-4 p-4 rounded-lg border text-sm backdrop-blur-sm ${isExpired
                        ? "bg-yellow-500/25 border-yellow-300 text-yellow-100"
                        : testResult.isInside
                            ? "bg-green-500/25 border-green-300 text-green-100"
                            : "bg-blue-500/25 border-blue-300 text-blue-100"
                    }`}>
                    <div>
                        <p className="font-semibold text-base mb-1">
                            {isExpired
                                ? "⚠️ Location Verification Expired (> 2 mins). Please Refresh Location."
                                : testResult.isInside
                                    ? "✅ Inside Office Radius"
                                    : "🌐 Outside Office Radius (Field Work)"}
                        </p>
                        <div className="mt-2 space-y-1 text-indigo-50">
                            <p>📍 Distance from Office: <strong className="text-white">{testResult.distance > 1000 ? (testResult.distance / 1000).toFixed(2) + " KM" : testResult.distance + " meters"}</strong></p>
                            <p>📏 Allowed Radius: <strong className="text-white">{testResult.allowedRadius} meters</strong></p>
                        </div>
                    </div>

                    {!isExpired && (
                        <div className="mt-4 pt-3 border-t border-white/20 space-y-3">
                            {!testResult.isInside && (
                                <div>
                                    <label className="block text-xs font-medium mb-1 text-white">
                                        Field Work / Marketing Notes <span className="text-red-300">*Mandatory</span>
                                    </label>
                                    <textarea
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                        placeholder="E.g., Visiting client meeting at Connaught Place, Delhi..."
                                        className="w-full p-2.5 rounded-lg bg-black/20 border border-white/30 text-white placeholder-indigo-200 text-sm focus:outline-none focus:border-white"
                                        rows="2"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-medium mb-1 text-white opacity-75">
                                    Verification Snapshot <span className="text-indigo-200 font-normal">(Optional)</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => setSelectedImage(e.target.files[0])}
                                    className="block w-full text-xs text-indigo-100 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-white file:text-indigo-700 hover:file:bg-indigo-50 cursor-pointer"
                                />
                            </div>

                            {/* Dynamic Action Button: Check-In OR Check-Out */}
                            <div className="pt-2">
                                {!hasCheckedInToday ? (
                                    <button
                                        onClick={handleAttendanceAction}
                                        disabled={actionLoading}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition shadow cursor-pointer disabled:opacity-50"
                                    >
                                        {actionLoading ? "Processing..." : "Check-In"}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleAttendanceAction}
                                        disabled={actionLoading}
                                        className="bg-rose-500 hover:bg-rose-600 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition shadow cursor-pointer disabled:opacity-50"
                                    >
                                        {actionLoading ? "Processing..." : "Check-Out"}
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}