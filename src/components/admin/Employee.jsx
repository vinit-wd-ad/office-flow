import AdminLayout from "./AdminLayout";
import Breadcrumbs from "../common/Breadcrumbs";
import UserTable from "../common/UserTable";

export default function Employee() {

    return (
        <AdminLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs items={[{ label: "Employees" }]} />

                <UserTable />
            </div>
        </AdminLayout>
    );
}