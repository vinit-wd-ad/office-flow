import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../common/Breadcrumbs";
import UserNew from "../common/UserNew";

export default function EmployeeNew() {
    const { userId } = useParams();

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs items={[
                    { label: "Employee", path: "/admin/employee" },
                    { label: userId ? "Update User" : "Add User" },
                ]} />

                <UserNew userId={userId} isEmp={false} />
            </div>
        </AdminLayout>
    );
}