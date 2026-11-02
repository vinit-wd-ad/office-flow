import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const userRole = localStorage.getItem("role"); 

    if (!allowedRoles.includes(userRole)) {
        return <Navigate to="/not-authorized" />;
    }

    return children;
};

export default ProtectedRoute;