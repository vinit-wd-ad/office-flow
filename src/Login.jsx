import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Input from "./components/common/Input";
import SubmitButton from "./components/common/SubmitButton";
import api from "./utils/api";

export default function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const formHandler = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        if (errorMessage) setErrorMessage("");
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setErrorMessage("");

        if (!formData.email.trim() || !formData.password.trim()) {
            setErrorMessage("Please enter both email and password.");
            return;
        }
        try {
            setSubmitting(true);
            const response = await api.post("login", formData);
            const { token, user } = response.data;

            localStorage.setItem("_token", token);
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("role", user.role);
            localStorage.setItem("logged_in", "true");

            if (user.role === "admin" || user.role === "hr" || user.role === "sadmin") {
                navigate("/admin");
            } else if (user.role === "employee") {
                navigate("/employee");
            } else {
                navigate("/not-authorized");
            }

        } catch (err) {
            console.log("error:", err);
            if (err.response?.data?.message) {
                setErrorMessage(err.response.data.message);
            } else if (err.response?.data?.error) {
                setErrorMessage(err.response.data.error);
            } else {
                setErrorMessage("Invalid credentials or network issue. Please try again.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-center bg-gray-200 p-4 sm:p-6">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-black/20">
                <h2 className="text-2xl sm:text-3xl text-center mb-6 font-semibold text-gray-800">
                    User Login
                </h2>

                {/* Single-line Error Banner */}
                {errorMessage && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg flex items-center justify-between">
                        <span className="font-medium pr-2">{errorMessage}</span>
                        <button
                            type="button"
                            onClick={() => setErrorMessage("")}
                            className="text-red-400 hover:text-red-600 font-bold text-xl leading-none focus:outline-none"
                            aria-label="Close error message"
                        >
                            &times;
                        </button>
                    </div>
                )}

                <form onSubmit={submitHandler} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block mb-1 text-sm font-medium text-gray-700">
                            Username / Email
                        </label>

                        <Input
                            id="email"
                            name="email"
                            onChange={formHandler}
                            value={formData.email}
                            className="w-full"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block mb-1 text-sm font-medium text-gray-700">
                            Password
                        </label>

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            onChange={formHandler}
                            value={formData.password}
                            className="w-full"
                        />
                    </div>

                    <div className="pt-2 text-center">
                        <SubmitButton disabled={submitting} className="w-full sm:w-auto">
                            {submitting ? "Logging in..." : "Login"}
                        </SubmitButton>
                    </div>
                </form>
            </div>
        </div>
    );
}