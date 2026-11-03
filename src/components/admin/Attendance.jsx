import { useParams } from "react-router-dom";
import MonthlyAttendance from "../common/MonthlyAttendance";
import AdminLayout from "./AdminLayout";

export default function Attendance() {
    const { userId } = useParams();

    return (
        <AdminLayout>
            <MonthlyAttendance userId={userId} />
        </AdminLayout>
    );
}
