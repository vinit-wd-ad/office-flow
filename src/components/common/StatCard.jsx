export default function StatCard({
    title,
    value,
    subtitle,
    icon,
    iconBg,
    iconColor,
    positive,
}) {
    return (
        <div className="bg-white rounded-md border border-gray-300 shadow-sm hover:shadow-md transition hover:-translate-y-1 p-5">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-slate-500">{title}</p>

                    <h3 className="text-2xl font-bold mt-2">
                        {value}
                    </h3>
                </div>

                <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg ${iconBg} ${iconColor}`}
                >
                    {icon}
                </div>
            </div>

            <p
                className={`text-xs mt-4 ${positive ? "text-emerald-600" : "text-slate-500"
                    }`}
            >
                {subtitle}
            </p>
        </div>
    );
}