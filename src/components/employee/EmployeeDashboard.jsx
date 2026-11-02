import StatCard from "../common/StatCard";
import EmpAttendanceBanner from "./EmpAttendanceBanner";
import EmpLayout from "./EmpLayout";

export default function EmployeeDashboard() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <EmpLayout>
            <div className="p-4 sm:p-6 lg:p-8">

                {/* Mobile Heading */}
                <div className="lg:hidden mb-6">
                    <h2 className="text-xl font-semibold">
                        Good morning,  {user.name}👋
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                        Here's your work overview for today.
                    </p>
                </div>

                {/* Attendance Banner */}
                <EmpAttendanceBanner />

                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

                    <StatCard
                        title="Working Hours"
                        value="06:45"
                        subtitle="Today's total"
                        icon="◷"
                        iconBg="bg-indigo-50"
                        iconColor="text-indigo-600"
                    />

                    <StatCard
                        title="Tasks Pending"
                        value="08"
                        subtitle="3 due this week"
                        icon="✓"
                        iconBg="bg-amber-50"
                        iconColor="text-amber-600"
                    />

                    <StatCard
                        title="Completed Tasks"
                        value="24"
                        subtitle="This month"
                        icon="✓"
                        iconBg="bg-emerald-50"
                        iconColor="text-emerald-600"
                        positive
                    />

                    <StatCard
                        title="Leave Balance"
                        value="12"
                        subtitle="Days remaining"
                        icon="📅"
                        iconBg="bg-violet-50"
                        iconColor="text-violet-600"
                    />

                </div>

            </div>
        </EmpLayout>
    );
}