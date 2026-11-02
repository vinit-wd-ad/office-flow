import { useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../common/Breadcrumbs";
import UserProfile from "../common/UserProfile";

export default function UserDetail() {
    const { userId } = useParams();

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs
                    items={[
                        { label: "Employee", path: "/admin/employee" },
                        { label: "Profile" },
                    ]}
                />

                <UserProfile userId={userId} isEmp={false} />
            </div>

        </AdminLayout>
    );
}