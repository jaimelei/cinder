import { Outlet } from "react-router-dom";
import CornerNav from "./CornerNav";

export default function AppLayout() {
    return (
        <div className="relative min-h-screen">
            <Outlet />

            <CornerNav />
        </div>
    );
}