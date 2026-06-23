import { Outlet } from "react-router-dom";
import VideoPlayer from "../common/VideoPlayer";
import { PlayerProvider } from "../../hooks/usePlayer";
import CornerNav from "./CornerNav";

export default function AppLayout() {
    return (
        <PlayerProvider>
            <div className="relative min-h-screen">
                <Outlet />

                <CornerNav />

                <VideoPlayer />
            </div>
        </PlayerProvider>
    );
}