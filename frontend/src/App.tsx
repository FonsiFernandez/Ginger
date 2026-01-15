import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import { apiGet } from "@/lib/api";
import type { UserDto } from "@/types";

type View = "dashboard" | "profile";

function needsOnboarding(u: UserDto | null) {
    if (!u) return true;
    return !u.calorieTargetKcal || !u.waterGoalMl || !u.age || !u.heightCm || !u.weightKg;
}

export default function App() {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<View>("dashboard");
    const [activeUser, setActiveUser] = useState<UserDto | null>(null);

    useEffect(() => {
        (async () => {
            const users = await apiGet<UserDto[]>("/users");
            setUser(users?.[0] ?? null);
            setActiveUser(users?.[0] ?? null);
            setLoading(false);
        })();
    }, []);

    if (loading) return null;

    if (!activeUser) return null;

    if (needsOnboarding(user)) {
        return <ProfileSetup user={user ?? { id: 1, name: "User" } as any} onDone={setUser} />;
    }

    if (view === "profile") {
        return (
            <Profile
                userId={activeUser.id}
                onBack={() => setView("dashboard")}
            />
        );
    }

    return <Dashboard onOpenProfile={() => setView("profile")} />;
}
