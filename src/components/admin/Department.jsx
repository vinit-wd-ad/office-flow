import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import Input from "../common/Input";
import Modal from "../common/Modal";
import SubmitButton from "../common/SubmitButton";
import api from "../../utils/api";
import Breadcrumbs from "../common/Breadcrumbs";

export default function Department() {
    const [departments, setDepartments] = useState([]);
    const [formData, setFormData] = useState({ name: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Status & Validation States
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [selectedDept, setSelectedDept] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (dept) => {
        setSelectedDept(dept);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedDept(null);
        setIsModalOpen(false);
    };

    const fetchDepartment = async () => {
        try {
            setIsLoading(true);
            const response = await api.get("department");
            setDepartments(response.data.data || []);
        } catch (err) {
            setErrorMessage("Failed to fetch departments. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const formHandler = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        if (errorMessage) setErrorMessage("");
        if (successMessage) setSuccessMessage("");
    };

    const addDepartment = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        if (!formData.name || !formData.name.trim()) {
            setErrorMessage("Department name is required.");
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post("department", formData);
            setFormData({ name: "" });
            setSuccessMessage("Department added successfully.");
            fetchDepartment();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Failed to add department.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const delDepartment = async (id) => {
        if (!confirm("Are you sure you want to delete this department?")) return;

        try {
            setErrorMessage("");
            setSuccessMessage("");
            await api.delete(`department/${id}`);
            setSuccessMessage("Department deleted successfully.");
            fetchDepartment();
        } catch (err) {
            setErrorMessage(err.response?.data?.message || "Failed to delete department.");
        }
    };

    useEffect(() => {
        fetchDepartment();
    }, []);

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs items={[
                    { label: "Department" },
                ]} />

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

                <div className="relative grid lg:grid-cols-3 grid-cols-1 gap-5">
                    <div className="bg-white rounded-md border border-gray-300 shadow-sm lg:col-span-2 lg:order-0 order-1">
                        <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h3 className="font-semibold text-lg">
                                    Departments
                                </h3>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-50 border-y border-b-gray-400">
                                    <tr>
                                        <th className="text-left px-6 py-4 font-medium text-slate-500">
                                            Departments
                                        </th>
                                        <th className="text-left px-6 py-4 font-medium text-slate-500">
                                            Positions
                                        </th>
                                        <th className="text-left px-6 py-4 font-medium text-slate-500">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-8 text-gray-500">
                                                Loading departments...
                                            </td>
                                        </tr>
                                    ) : departments.length === 0 ? (
                                        <tr>
                                            <td colSpan="3" className="text-center py-8 text-gray-500">
                                                No departments found.
                                            </td>
                                        </tr>
                                    ) : (
                                        departments.map((dept) => (
                                            <tr key={dept.id} className="hover:bg-slate-50 border-gray-300">
                                                <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                                    {dept.name}
                                                </td>

                                                <td className="px-6 py-4 text-slate-500">
                                                    {dept.position?.length > 0
                                                        ? dept.position.map((pos) => pos.name).join(", ")
                                                        : "No Positions"}

                                                    <button
                                                        onClick={() => openModal(dept)}
                                                        className="ml-2 text-blue-500 underline text-sm"
                                                    >
                                                        Manage
                                                    </button>
                                                </td>

                                                <td className="px-6 py-4">
                                                    <button
                                                        onClick={() => delDepartment(dept.id)}
                                                        className="p-1 px-2 bg-red-500 rounded text-white font-semibold hover:bg-red-600"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                            <PositionModal
                                isOpen={isModalOpen}
                                onClose={closeModal}
                                dept={selectedDept}
                                refresh={fetchDepartment}
                            />
                        </div>
                    </div>
                    <div className="bg-white">
                        <div className="p-6 rounded-md border border-gray-300 shadow-sm">
                            <form onSubmit={addDepartment} className="w-full">
                                <h3 className="font-semibold text-lg mb-2">
                                    Add Department
                                </h3>
                                <div className="my-2">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
                                    <Input
                                        name="name"
                                        value={formData.name || ''}
                                        onChange={formHandler}
                                        required
                                    />
                                </div>
                                <div className="text-end mt-4">
                                    <SubmitButton disabled={isSubmitting}>
                                        {isSubmitting ? "Adding..." : "Add"}
                                    </SubmitButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}

function PositionModal({ isOpen, onClose, dept, refresh }) {
    const [positions, setPositions] = useState([]);
    const [name, setName] = useState("");
    const [error, setError] = useState("");

    useEffect(() => {
        if (dept) {
            setPositions(dept.position || []);
            setName("");
            setError("");
        }
    }, [dept]);

    const addPosition = async () => {
        if (!name.trim()) {
            setError("Position name is required.");
            return;
        }

        try {
            setError("");
            const res = await api.post("position", {
                name,
                department_id: dept.id,
            });

            setPositions((prev) => [...prev, res.data.data]);
            setName("");
            refresh();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to add position.");
        }
    };

    const deletePosition = async (id) => {
        if (!confirm("Are you sure you want to delete this position?")) return;

        try {
            setError("");
            await api.delete(`position/${id}`);
            setPositions((prev) => prev.filter((p) => p.id !== id));
            refresh();
        } catch (err) {
            setError(err.response?.data?.message || "Failed to delete position.");
        }
    };

    if (!isOpen || !dept) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <h2 className="text-lg font-semibold mb-4">
                {dept.name} Positions
            </h2>

            {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                    {error}
                </div>
            )}

            <div className="flex gap-2 my-2">
                <Input
                    value={name}
                    onChange={(e) => {
                        setName(e.target.value);
                        if (error) setError("");
                    }}
                    placeholder="New Position"
                />
                <SubmitButton
                    onClick={addPosition}
                    className="m-0"
                >
                    Add
                </SubmitButton>
            </div>

            <ul className="space-y-2 max-h-60 overflow-y-auto mt-5">
                {positions.length > 0 ? (
                    positions.map((pos) => (
                        <li
                            key={pos.id}
                            className="flex justify-between items-center border-t p-2 border-gray-200 rounded"
                        >
                            <span className="text-sm text-gray-800">{pos.name}</span>
                            <button
                                onClick={() => deletePosition(pos.id)}
                                className="text-red-500 text-sm hover:underline"
                            >
                                Delete
                            </button>
                        </li>
                    ))
                ) : (
                    <p className="text-gray-500 text-sm text-center py-4">No positions available</p>
                )}
            </ul>
        </Modal>
    );
}