import { Link, useNavigate } from "react-router-dom";
import Input from "../common/Input";
import SubmitButton from "../common/SubmitButton";
import { useEffect, useState } from "react";
import api from "../../utils/api";

export default function UserNew({ userId, isEmp = true }) {
    const [departments, setDepartments] = useState([]);
    const [positions, setPositions] = useState([]);
    const [selectedDept, setSelectedDept] = useState("");

    // Status & Validation States
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        password: '',
        position_id: '',
    });

    // 1. Fetch Departments
    const fetchDepartments = async () => {
        try {
            const res = await api.get("department");
            setDepartments(res.data.data || []);
        } catch (err) {
            console.log(err);
        }
    };

    // 2. Fetch User Data
    const fetchUser = async () => {
        try {
            const res = await api.get(`user/${userId}`);
            const userData = res.data.data;

            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                phone: userData.phone || '',
                role: userData.role || '',
                password: '',
                position_id: userData.position_id || userData.positions?.id || '',
            });

            const deptId = userData.positions?.department_id
                || userData.positions?.department?.id
                || userData.department_id
                || "";

            setSelectedDept(deptId);
        } catch (err) {
            console.log("Error fetching user:", err);
        }
    };

    useEffect(() => {
        fetchDepartments();
        if (userId) {
            fetchUser();
        }
    }, [userId]);

    // 3. Sync positions after chenging Department 
    useEffect(() => {
        if (selectedDept && departments.length > 0) {
            const selectedDepartment = departments.find(
                (dept) => String(dept.id) === String(selectedDept)
            );
            const posList = selectedDepartment?.positions || selectedDepartment?.position || [];
            setPositions(posList);
        } else {
            setPositions([]);
        }
    }, [selectedDept, departments]);

    const formHandler = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errorMessage) setErrorMessage("");
    };

    const handleDepartmentChange = (e) => {
        const deptId = e.target.value;
        setSelectedDept(deptId);
        setFormData((prev) => ({ ...prev, position_id: "" }));
        if (errorMessage) setErrorMessage("");
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrorMessage("");
        setSuccessMessage("");

        // Single-line common validation check
        const isNameEmpty = !formData.name.trim();
        const isEmailEmpty = !formData.email.trim();
        const isPhoneEmpty = !formData.phone.trim();
        const isRoleEmpty = !formData.role;
        const isDeptEmpty = !selectedDept;
        const isPositionEmpty = !formData.position_id;
        const isPasswordEmpty = !userId && !formData.password.trim();

        if (isNameEmpty || isEmailEmpty || isPhoneEmpty || isRoleEmpty || isDeptEmpty || isPositionEmpty || isPasswordEmpty) {
            setErrorMessage("All fields are required. Please fill in all details.");
            return;
        }

        try {
            setSubmitting(true);
            const res = await (userId == null
                ? api.post('user', formData)
                : api.put(`user/${userId}`, formData));

            setSuccessMessage(userId ? "Employee updated successfully!" : "Employee created successfully!");

            // setTimeout(() => {
            //     navigate("/admin/employee");
            // }, 1200);

        } catch (err) {
            console.log("Error : ", err);
            if (err.response?.data?.message) {
                setErrorMessage(err.response.data.message);
            } else if (err.response?.data?.errors) {
                const firstError = Object.values(err.response.data.errors).flat()[0];
                setErrorMessage(firstError || "Something went wrong. Please try again.");
            } else {
                setErrorMessage("Failed to process request. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };


    return (
        <div className="bg-white rounded-md border border-gray-300 shadow-sm">
            <div className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="font-semibold text-lg">
                        {userId ? "Edit" : "New"} User
                    </h3>
                </div>

                <div className="flex gap-3">
                    <Link to={isEmp ? `/employee/profile` : `/admin/employee`} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
                        Employee List
                    </Link>
                </div>
            </div>

            <div className="overflow-x-auto p-6 border-t border-gray-400">
                {/* Inline Status Banners (Single Line Display) */}
                {errorMessage && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
                        <span className="font-medium">{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage("")}
                            className="text-red-400 hover:text-red-600 font-bold text-lg leading-none"
                        >
                            &times;
                        </button>
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg flex items-center justify-between">
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-3">
                    <div>
                        <label htmlFor="name" className="text-sm font-medium text-gray-700">Name</label>
                        <Input name="name" onChange={formHandler} value={formData.name || ''} />
                    </div>
                    <div>
                        <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                        <Input type="email" name="email" onChange={formHandler} value={formData.email || ''} />
                    </div>
                    <div>
                        <label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone</label>
                        <Input type="tel" name="phone" onChange={formHandler} value={formData.phone || ''} />
                    </div>
                    <div>
                        <label htmlFor="role" className="text-sm font-medium text-gray-700">Role</label>
                        <select
                            name="role"
                            value={formData.role || ''}
                            onChange={formHandler}
                            className="p-2 border w-full rounded my-1 outline-blue-300 border-gray-300 text-sm"
                        >
                            <option value="">Select User Role</option>
                            <option value="admin">Admin</option>
                            <option value="hr">HR</option>
                            <option value="employee">Employee</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="password" className="text-sm font-medium text-gray-700">
                            Password {userId && <span className="text-xs text-gray-400">(Leave blank to keep unchanged)</span>}
                        </label>
                        <Input type="password" name="password" onChange={formHandler} value={formData.password || ''} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5">
                        {/* Department */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Department</label>
                            <select
                                name="department"
                                value={selectedDept || ''}
                                onChange={handleDepartmentChange}
                                className="p-2 border w-full rounded my-1 outline-blue-300 border-gray-300 text-sm"
                            >
                                <option value="">Choose Department</option>
                                {departments.map((dept) => (
                                    <option key={dept.id} value={dept.id}>
                                        {dept.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Position */}
                        <div>
                            <label className="text-sm font-medium text-gray-700">Position</label>
                            <select
                                name="position_id"
                                value={formData.position_id || ''}
                                onChange={formHandler}
                                className="p-2 border w-full rounded my-1 outline-blue-300 border-gray-300 text-sm"
                            >
                                <option value="">Choose Position</option>
                                {positions.map((pos) => (
                                    <option key={pos.id} value={pos.id}>
                                        {pos.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="col-span-2 flex justify-center mt-4">
                        <SubmitButton disabled={submitting}>
                            {submitting ? "Saving..." : (userId ? "Update" : "Create")}
                        </SubmitButton>
                    </div>
                </form>
            </div>
        </div>
    )
}