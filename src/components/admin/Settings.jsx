import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../common/Breadcrumbs";
import Input from "../common/Input";
import SubmitButton from "../common/SubmitButton";
import api from "../../utils/api";

export default function Settings() {
    const [formData, setFormData] = useState({
        office_name: "",
        latitude: "",
        longitude: "",
        in_time: "",
        out_time: "",
        allow_radius_meters: "",
    });

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDetecting, setIsDetecting] = useState(false);
    
    // New States for Edit Control
    const [isEditing, setIsEditing] = useState(true);
    const [hasExistingData, setHasExistingData] = useState(false);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    // Fetch existing settings on load
    const fetchSettings = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("attendance-setting");
            if (response.data && response.data.data) {
                setFormData(response.data.data);
                setHasExistingData(true);
                setIsEditing(false); // Data pehle se hai toh form disable rakho
            }
        } catch (err) {
            // Agar data nahi hai ya error aaya toh form editable rakho naye entry ke liye
            setHasExistingData(false);
            setIsEditing(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSettings();
    }, []);

    const formHandler = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errorMessage) setErrorMessage("");
        if (successMessage) setSuccessMessage("");
    };

    // Automated Geolocation Detection
    const handleDetectLocation = () => {
        if (!navigator.geolocation) {
            setErrorMessage("Geolocation is not supported by your browser.");
            return;
        }

        setIsDetecting(true);
        setErrorMessage("");
        setSuccessMessage("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setFormData((prev) => ({
                    ...prev,
                    latitude: position.coords.latitude.toString(),
                    longitude: position.coords.longitude.toString(),
                }));
                setIsDetecting(false);
                setSuccessMessage("Location detected successfully!");
            },
            (error) => {
                console.error(error);
                setErrorMessage("Unable to retrieve your location. Please check browser permissions.");
                setIsDetecting(false);
            },
            { enableHighAccuracy: true }
        );
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        // Client-side validation check
        if (
            !formData.office_name ||
            !formData.latitude ||
            !formData.longitude ||
            !formData.in_time ||
            !formData.out_time ||
            !formData.allow_radius_meters
        ) {
            setErrorMessage("All fields are required.");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("attendance-setting", formData);
            setSuccessMessage("Settings updated successfully.");
            setHasExistingData(true);
            setIsEditing(false); // Save hone ke baad wapas read-only mode kar do
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Failed to update settings.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs
                    items={[
                        { label: "Settings" },
                    ]}
                />

                <div className="max-w-3xl bg-white rounded-md border border-gray-300 shadow-sm p-6 mt-4">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg text-gray-800">
                            Office Configuration & Settings
                        </h3>
                        {/* Edit Button - Will show only if data exists and form is read-only */}
                        {hasExistingData && !isEditing && (
                            <button
                                type="button"
                                onClick={() => setIsEditing(true)}
                                className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-md text-sm font-semibold transition"
                            >
                                Edit Settings
                            </button>
                        )}
                    </div>

                    {/* Status Banners */}
                    {errorMessage && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded">
                            {errorMessage}
                        </div>
                    )}
                    {successMessage && (
                        <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-sm rounded">
                            {successMessage}
                        </div>
                    )}

                    {isLoading ? (
                        <div className="text-center py-8 text-gray-500">Loading settings...</div>
                    ) : (
                        <form onSubmit={submitHandler} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Office Name
                                </label>
                                <Input
                                    name="office_name"
                                    value={formData.office_name || ""}
                                    onChange={formHandler}
                                    placeholder="Enter office name"
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            {/* Location Detector Section */}
                            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-800">Office Coordinates</h4>
                                        <p className="text-xs text-gray-500">Detect current location automatically using GPS.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDetectLocation}
                                        disabled={!isEditing || isDetecting}
                                        className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isDetecting ? "Detecting..." : "Detect Current Location"}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                                        <Input
                                            name="latitude"
                                            value={formData.latitude || ""}
                                            onChange={formHandler}
                                            placeholder="Latitude"
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                                        <Input
                                            name="longitude"
                                            value={formData.longitude || ""}
                                            onChange={formHandler}
                                            placeholder="Longitude"
                                            disabled={!isEditing}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">In Time</label>
                                    <input
                                        type="time"
                                        name="in_time"
                                        value={formData.in_time || ""}
                                        onChange={formHandler}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Out Time</label>
                                    <input
                                        type="time"
                                        name="out_time"
                                        value={formData.out_time || ""}
                                        onChange={formHandler}
                                        disabled={!isEditing}
                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Allowed Radius (in Meters)
                                </label>
                                <Input
                                    type="number"
                                    name="allow_radius_meters"
                                    value={formData.allow_radius_meters || ""}
                                    onChange={formHandler}
                                    placeholder="e.g. 100"
                                    disabled={!isEditing}
                                    required
                                />
                            </div>

                            {/* Save Button will only show when isEditing is true */}
                            {isEditing && (
                                <div className="flex items-center justify-end gap-3 pt-2">
                                    {hasExistingData && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditing(false);
                                                fetchSettings(); // Revert changes on cancel
                                            }}
                                            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                    <SubmitButton disabled={isSubmitting}>
                                        {isSubmitting ? "Saving..." : "Save Settings"}
                                    </SubmitButton>
                                </div>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}