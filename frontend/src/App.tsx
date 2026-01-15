import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import { apiGet } from "@/lib/api";
import type { UserDto } from "@/types";

function needsOnboarding(u: UserDto | null) {
    if (!u) return true;
    return !u.calorieTargetKcal || !u.waterGoalMl || !u.age || !u.heightCm || !u.weightKg;
}

export default function App() {
    const [user, setUser] = useState<UserDto | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            const users = await apiGet<UserDto[]>("/users");
            setUser(users?.[0] ?? null);
            setLoading(false);
        })();
    }, []);

    if (loading) return null;

    if (needsOnboarding(user)) {
        return <ProfileSetup user={user ?? { id: 1, name: "User" } as any} onDone={setUser} />;
    }

    return <Dashboard />;
}
