import { useParams } from "react-router-dom";
import Breadcrumbs from "../common/Breadcrumbs";
import UserNew from "../common/UserNew";
import EmpLayout from "./EmpLayout";

export default function EmpProfileEdit() {
    const { userId } = useParams();

    return (
        <EmpLayout>
            <div className="p-4 sm:p-6 lg:p-8 lg:pt-4 sm:pt-3 pt-2">
                <Breadcrumbs items={[
                    { label: "Employee", path: "/employee" },
                ]} />

                <UserNew userId={userId} />
            </div>
        </EmpLayout>
    );
}