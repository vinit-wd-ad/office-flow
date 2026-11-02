import StatCard from "../common/StatCard";
import UserTable from "../common/UserTable";
import AdminLayout from "./AdminLayout";

export default function AdminDashboard() {

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8">
                {/* Mobile Heading */}
                <div className="lg:hidden mb-6">
                    <h2 className="text-xl font-semibold">
                        Good morning, John 👋
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                        Here's today's office overview.
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                    <StatCard
                        title="Total Employees"
                        value="248"
                        subtitle="+12 this month"
                        icon="👥"
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-600"
                        positive
                    />

                    <StatCard
                        title="Present Today"
                        value="218"
                        subtitle="87.9% attendance"
                        icon="✓"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        positive
                    />

                    <StatCard
                        title="On Leave"
                        value="18"
                        subtitle="7.3% of employees"
                        icon="🏖"
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                    />

                    <StatCard
                        title="Late Arrivals"
                        value="12"
                        subtitle="4.8% of employees"
                        icon="◷"
                        iconBg="bg-rose-50"
                        iconColor="text-rose-600"
                    />
                </div>

                {/* Employee Table */}
                <UserTable limit={5} className="mt-4" />
            </div>
        </AdminLayout>
    )
}

function EmployeeRow({
    initials,
    name,
    email,
    department,
    position,
    status,
    joined,
}) {
    return (
        <tr className="hover:bg-slate-50">
            <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold shrink-0">
                        {initials}
                    </div>

                    <div>
                        <p className="font-medium whitespace-nowrap">
                            {name}
                        </p>

                        <p className="text-xs text-slate-500">
                            {email}
                        </p>
                    </div>
                </div>
            </td>

            <td className="px-6 py-4 whitespace-nowrap">
                {department}
            </td>

            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                {position}
            </td>

            <td className="px-6 py-4">
                <span
                    className={`
            inline-flex px-2.5 py-1 rounded-full text-xs font-medium
            ${status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }
          `}
                >
                    {status}
                </span>
            </td>

            <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                {joined}
            </td>
        </tr>
    );
}