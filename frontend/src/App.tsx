import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import ProfileSetup from "./pages/ProfileSetup";
import Profile from "./pages/Profile";
import FoodHistory from "./pages/FoodHistory";
import { apiGet } from "@/lib/api";
import type { UserDto } from "@/types";

type View = "dashboard" | "profile" | "foodHistory";

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
            const first = users?.[0] ?? null;
            setUser(first);
            setActiveUser(first);
            setLoading(false);
        })();
    }, []);

    if (loading) return null;
    if (!activeUser) return null;

    // Onboarding: mantenemos tu lógica exactamente igual
    if (needsOnboarding(user)) {
        return (
            <ProfileSetup
                user={user ?? ({ id: 1, name: "User" } as any)}
                onDone={(updated) => {
                    setUser(updated);
                    setActiveUser(updated);
                }}
            />
        );
    }

    if (view === "profile") {
        return (
            <Profile
                userId={activeUser.id}
                onBack={() => setView("dashboard")}
            />
        );
    }

    if (view === "foodHistory") {
        return (
            <FoodHistory
                userId={activeUser.id}
                onBack={() => setView("dashboard")}
            />
        );
    }

    return (
        <Dashboard
            onOpenProfile={() => setView("profile")}
            onOpenFoodHistory={() => setView("foodHistory")}
            onUserChange={(id) => {
                // Preparado para cuando Dashboard permita cambiar usuario
                if (activeUser?.id === id) return;
                setActiveUser((prev) => (prev && prev.id === id ? prev : { ...(prev as any), id })); // fallback
            }}
        />
    );
}
