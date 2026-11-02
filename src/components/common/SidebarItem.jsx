import { Link } from "react-router-dom";

export default function SidebarItem({
    icon,
    label,
    active,
    to,
}) {
    return (
        <Link
            to={to}
            className={`
                flex items-center gap-3 px-4 py-3 rounded-lg text-sm
                transition
                ${active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-300 hover:bg-slate-800"
                }
            `}
        >
            <span className="w-5 text-center">{icon}</span>
            <span>{label}</span>
        </Link>
    );
}