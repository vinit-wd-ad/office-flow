import Breadcrumbs from "../common/Breadcrumbs";
import UserProfile from "../common/UserProfile";
import EmpLayout from "./EmpLayout";

export default function EmpProfile() {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    return (
        <EmpLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs
                    items={[
                        { label: "Profile" },
                    ]}
                />
                <UserProfile userId={user.id} isEmp={true} />
            </div>
        </EmpLayout>
    )
}