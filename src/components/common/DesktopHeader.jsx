import { Link } from "react-router-dom";
import { getAvtar } from "../../utils/getAvtar";
import { useState } from "react";

export default function DesktopHeader({ link = "/employee" }) {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const [openAvtar, setOpenAvtar] = useState(false);

    return (
        <header className="hidden lg:flex h-20 bg-white border-b px-8 items-center justify-between">
            <div>
                <h2 className="text-xl font-semibold">
                    Welcome, {user.name} 👋
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Here's what's happening in your office today.
                </p>
            </div>

            <div className="flex items-center gap-4">
                <button className="relative p-2.5 rounded-lg hover:bg-slate-100">
                    🔔
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
                </button>
                <div
                    className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold cursor-pointer"
                    onClick={() => setOpenAvtar(!openAvtar)}
                >
                    {getAvtar(user.name)}
                </div>

                {openAvtar && (
                    <div className="absolute right-10 top-15 w-40 bg-slate-900 border border-slate-700 rounded-lg shadow-lg overflow-hidden z-50">

                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.href = "/";
                            }}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-800 transition"
                        >
                            🚪 <span>Logout</span>
                        </button>

                        {(user.role != 'employee') && (
                            <Link to={link} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-slate-800 transition">
                                ➔ Switch Panel
                            </Link>
                        )}

                    </div>
                )}

            </div>
        </header>
    )
}