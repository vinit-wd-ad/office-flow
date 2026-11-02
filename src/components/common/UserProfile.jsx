import { Link } from "react-router-dom";
import api from "../../utils/api";
import { useEffect, useState } from "react";

export default function UserProfile({ userId, isEmp = true, className = "" }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Modal & Form States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    // Form inputs state
    const [formData, setFormData] = useState({
        dob: "",
        base_salary: "",
        address: "",
        alt_phone: "",
        joining_date: "",
    });

    // File & Preview states
    const [profileFile, setProfileFile] = useState(null);
    const [photoPreview, setPhotoPreview] = useState("");

    const fetchUser = async () => {
        try {
            setLoading(true);
            const res = await api.get(`user/${userId}`);
            setUser(res.data.data);
        } catch (error) {
            console.error("User detail fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const formatDateForInput = (dateStr) => {
        if (!dateStr) return "";
        try {
            const d = new Date(dateStr);
            return d.toISOString().split("T")[0];
        } catch (e) {
            return "";
        }
    };

    const handleOpenModal = () => {
        const details = user?.user_details || {};
        setFormData({
            dob: formatDateForInput(details.dob),
            base_salary: details.base_salary || "",
            address: details.address || "",
            alt_phone: details.alt_phone || "",
            joining_date: formatDateForInput(details.joining_date || user?.created_at),
        });
        setPhotoPreview(details.profile_photo || "");
        setProfileFile(null);
        setErrorMessage("");
        setIsModalOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfileFile(file);
            setPhotoPreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        try {
            setSubmitting(true);

            const payload = new FormData();
            payload.append("user_id", userId);
            payload.append("dob", formData.dob || "");
            payload.append("base_salary", formData.base_salary || "");
            payload.append("address", formData.address || "");
            payload.append("alt_phone", formData.alt_phone || "");
            payload.append("joining_date", formData.joining_date || "");

            if (profileFile) {
                payload.append("profile_photo", profileFile);
            }

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            const hasExistingDetails = Boolean(user?.user_details);

            if (hasExistingDetails) {
                payload.append("_method", "PUT");
                await api.post(`user-details/${userId}`, payload, config);
            } else {
                await api.post(`user-details`, payload, config);
            }

            await fetchUser();
            setIsModalOpen(false);
        } catch (error) {
            console.error("Error saving user details:", error.response?.data || error);

            if (error.response?.data?.errors) {
                const errMessages = Object.values(error.response.data.errors).flat().join("\n");
                setErrorMessage(errMessages);
            } else {
                setErrorMessage(error.response?.data?.message || "Failed to save user details. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 text-center text-gray-500 font-medium">
                Profile loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="p-8 text-center text-red-500 font-medium">
                User not found!
            </div>
        );
    }

    const details = user.user_details || {};
    const departmentName = user.positions?.department?.name || "N/A";
    const positionName = user.positions?.name || "N/A";

    const rawDate = details.joining_date || user.created_at;
    const joiningDate = rawDate
        ? new Date(rawDate).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "N/A";

    const dobFormatted = details.dob
        ? new Date(details.dob).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        })
        : "N/A";

    const salaryFormatted = details.base_salary
        ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(details.base_salary)
        : "N/A";


    return (
        <div className={className}>

            {/* Top Banner Card */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6">
                <div className="h-25 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                {/*  */}
                <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 -mt-16 sm:-mt-12">
                        {details.profile_photo ? (
                            <img
                                src={details.profile_photo}
                                alt={user.name}
                                className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full border-4 border-white bg-indigo-600 text-white flex items-center justify-center font-bold text-3xl shadow-md uppercase">
                                {user.name ? user.name.slice(0, 2) : "EM"}
                            </div>
                        )}

                        <div className="text-center sm:text-left mb-1">
                            <div className="flex items-center gap-3 justify-center sm:justify-start">
                                <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
                                <span className="capitalize px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    {user.role || "Employee"}
                                </span>
                            </div>
                            <p className="text-gray-500 text-sm font-medium">
                                {positionName} • {departmentName}
                            </p>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-center gap-3 flex-wrap sm:flex-nowrap">
                        <button
                            type="button"
                            onClick={handleOpenModal}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Update Details
                        </button>

                        {isEmp &&
                            <Link
                                to={`/employee/profile/${userId}`}
                                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                </svg>
                                Edit Profile
                            </Link>
                        }

                        {!isEmp && <Link
                            to="/admin/employee"
                            className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium transition"
                        >
                            Back to List
                        </Link>
                        }
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Personal Details
                        </h3>

                        <div className="space-y-4 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Email Address</span>
                                <span className="text-gray-800 font-medium">{user.email}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Primary Phone</span>
                                <span className="text-gray-800 font-medium">{user.phone || "N/A"}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Alternate Phone</span>
                                <span className="text-gray-800 font-medium">{details.alt_phone || "N/A"}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Date of Birth</span>
                                <span className="text-gray-800 font-medium">{dobFormatted}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Joining Date</span>
                                <span className="text-gray-800 font-medium">{joiningDate}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Address</span>
                                <span className="text-gray-800 font-medium">{details.address || "N/A"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                            Employment Details
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Employee ID</span>
                                <span className="text-gray-900 font-semibold text-base">EMP-00{user.id}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Base Salary</span>
                                <span className="text-emerald-700 font-bold text-base">{salaryFormatted}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">User Role</span>
                                <span className="text-gray-800 font-medium capitalize">{user.role || "Employee"}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Department</span>
                                <span className="text-gray-800 font-medium">{departmentName}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Position</span>
                                <span className="text-gray-800 font-medium">{positionName}</span>
                            </div>

                            <div>
                                <span className="text-gray-500 block text-xs font-medium uppercase tracking-wider">Account Created</span>
                                <span className="text-gray-800 font-medium">
                                    {user.created_at ? new Date(user.created_at).toLocaleDateString("en-IN") : "N/A"}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- UPDATE DETAILS MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="text-lg font-bold text-gray-800">Update Additional Details</h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition text-xl font-bold"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body / Form */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Inline Error Alert Banner */}
                            {errorMessage && (
                                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-start justify-between gap-2">
                                    <span className="whitespace-pre-line font-medium leading-tight">
                                        {errorMessage}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setErrorMessage("")}
                                        className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
                                    >
                                        &times;
                                    </button>
                                </div>
                            )}

                            {/* Profile Photo Upload Field with Preview */}
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                                    Profile Photo
                                </label>
                                <div className="flex items-center gap-4">
                                    {photoPreview ? (
                                        <img
                                            src={photoPreview}
                                            alt="Preview"
                                            className="w-16 h-16 rounded-full object-cover border-2 border-indigo-500 shadow-sm"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 text-xs">
                                            No Photo
                                        </div>
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        name="dob"
                                        value={formData.dob}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Joining Date
                                    </label>
                                    <input
                                        type="date"
                                        name="joining_date"
                                        value={formData.joining_date}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Base Salary (INR)
                                    </label>
                                    <input
                                        type="number"
                                        name="base_salary"
                                        placeholder="50000"
                                        value={formData.base_salary}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                        Alternate Phone
                                    </label>
                                    <input
                                        type="text"
                                        name="alt_phone"
                                        placeholder="+91 9876543210"
                                        value={formData.alt_phone}
                                        onChange={handleInputChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">
                                    Address
                                </label>
                                <textarea
                                    name="address"
                                    rows="3"
                                    placeholder="Enter full address..."
                                    value={formData.address}
                                    onChange={handleInputChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                ></textarea>
                            </div>

                            {/* Modal Actions */}
                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition disabled:opacity-50"
                                >
                                    {submitting ? "Saving..." : "Save Details"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    )
}