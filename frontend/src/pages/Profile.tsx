import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
    ActivityLevel,
    Goal,
    GoalPace,
    OnboardingRequest,
    Sex,
    UserDto,
    WeightLogDto,
    DailyTotalsPoint,
    HourCaloriesPoint,
} from "@/types";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
    BarChart,
    Bar,
} from "recharts";
import {
    Sparkles,
    User as UserIcon,
    ArrowLeft,
    Target,
    Droplets,
    Flame,
    Dumbbell,
    Ruler,
    Scale,
    Clock,
    TrendingUp,
} from "lucide-react";

export default function Profile({ userId, onBack }: { userId: number; onBack: () => void }) {
    const [user, setUser] = useState<UserDto | null>(null);

    const [form, setForm] = useState<OnboardingRequest>({
        age: 30,
        sex: "MALE",
        heightCm: 170,
        weightKg: 70,
        activityLevel: "MODERATE",
        goal: "MAINTAIN",
        goalPace: "MILD",
    });

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);
    const [ok, setOk] = useState<string | null>(null);

    const [weightSeries, setWeightSeries] = useState<WeightLogDto[]>([]);
    const [weightDays, setWeightDays] = useState<number>(90);

    const [dailyDays, setDailyDays] = useState<number>(30);
    const [dailyTotals, setDailyTotals] = useState<DailyTotalsPoint[]>([]);

    const [hourDays, setHourDays] = useState<number>(14);
    const [hourTotals, setHourTotals] = useState<HourCaloriesPoint[]>([]);

    // ===== derived =====
    const calorieTarget = (user as any)?.calorieTargetKcal ?? null;
    const waterGoal = (user as any)?.waterGoalMl ?? null;

    const goalLabel = useMemo(() => {
        if (form.goal === "LOSE") return "Adelgazar";
        if (form.goal === "GAIN") return "Ganar peso";
        return "Mantener";
    }, [form.goal]);

    const activityLabel = useMemo(() => {
        switch (form.activityLevel) {
            case "SEDENTARY":
                return "Sedentario";
            case "LIGHT":
                return "Ligera";
            case "MODERATE":
                return "Moderada";
            case "HIGH":
                return "Alta";
            case "VERY_HIGH":
                return "Muy alta";
            default:
                return form.activityLevel;
        }
    }, [form.activityLevel]);

    const weightChartData = useMemo(
        () =>
            weightSeries.map((x) => ({
                date: new Date(x.createdAt).toLocaleDateString(),
                weightKg: Number(x.weightKg.toFixed(1)),
            })),
        [weightSeries]
    );

    // ===== load user =====
    useEffect(() => {
        (async () => {
            const u = await apiGet<UserDto>(`/users/${userId}`);
            setUser(u);

            // precargar form con lo que haya (si tu UserDto no trae esos campos tipados)
            setForm((f) => ({
                ...f,
                age: (u as any).age ?? f.age,
                sex: ((u as any).sex ?? f.sex) as Sex,
                heightCm: (u as any).heightCm ?? f.heightCm,
                weightKg: (u as any).weightKg ?? f.weightKg,
                activityLevel: ((u as any).activityLevel ?? f.activityLevel) as ActivityLevel,
                goal: ((u as any).goal ?? f.goal) as Goal,
                goalPace: ((u as any).goalPace ?? f.goalPace) as GoalPace,
            }));
        })();
    }, [userId]);

    // ===== load series =====
    useEffect(() => {
        (async () => {
            const data = await apiGet<WeightLogDto[]>(`/stats/weight?userId=${userId}&days=${weightDays}`);
            setWeightSeries(data);
        })();
    }, [userId, weightDays]);

    useEffect(() => {
        (async () => {
            const data = await apiGet<DailyTotalsPoint[]>(`/stats/daily-totals?userId=${userId}&days=${dailyDays}`);
            setDailyTotals(data);
        })();
    }, [userId, dailyDays]);

    useEffect(() => {
        (async () => {
            const data = await apiGet<HourCaloriesPoint[]>(`/stats/calories-by-hour?userId=${userId}&days=${hourDays}`);
            setHourTotals(data);
        })();
    }, [userId, hourDays]);

    async function save() {
        setLoading(true);
        setErr(null);
        setOk(null);
        try {
            const updated = await apiPost<UserDto>(`/users/${userId}/onboarding`, form);
            setUser(updated);
            setOk("Guardado. Objetivos recalculados.");
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.14),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.10),transparent_55%)]">
            <main className="w-full">
                <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                    {/* HERO */}
                    <div className="relative overflow-hidden rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-fuchsia-500/10 to-emerald-500/10" />
                        <div className="relative p-6 md:p-8 flex flex-col gap-5">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 via-fuchsia-500/20 to-emerald-500/20 border">
                                            <Sparkles className="h-4 w-4" />
                                        </div>
                                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Perfil</h1>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Ajusta tus datos y revisa tu progreso. Al guardar recalculamos objetivos de calorías y agua.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm bg-background/60">
                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                      Usuario <span className="font-medium text-foreground">#{userId}</span>
                    </span>
                                    </div>

                                    <div className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm bg-background/60">
                                        <Target className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                      Objetivo: <span className="font-medium text-foreground">{goalLabel}</span>
                    </span>
                                    </div>

                                    <Button variant="secondary" onClick={onBack} className="rounded-2xl">
                                        <ArrowLeft className="h-4 w-4 mr-2" />
                                        Volver
                                    </Button>
                                </div>
                            </div>

                            {err ? (
                                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {err}
                                </div>
                            ) : null}

                            {ok ? (
                                <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-800">
                                    {ok}
                                </div>
                            ) : null}

                            {/* Targets quick glance */}
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <Stat
                                    label="Calorías objetivo"
                                    value={calorieTarget ? `${calorieTarget} kcal` : "—"}
                                    icon={<Flame className="h-4 w-4" />}
                                    accent="from-orange-500/15 to-rose-500/10"
                                />
                                <Stat
                                    label="Agua objetivo"
                                    value={waterGoal ? `${waterGoal} ml` : "—"}
                                    icon={<Droplets className="h-4 w-4" />}
                                    accent="from-sky-500/15 to-indigo-500/10"
                                />
                                <Stat
                                    label="Actividad"
                                    value={activityLabel}
                                    icon={<Dumbbell className="h-4 w-4" />}
                                    accent="from-emerald-500/15 to-lime-500/10"
                                />
                            </div>
                        </div>
                    </div>

                    {/* GRID PRINCIPAL */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* FORM */}
                        <Card className="lg:col-span-5 rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 border">
                    <Target className="h-4 w-4" />
                  </span>
                                    Datos y objetivos
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Edad" icon={<Clock className="h-4 w-4" />}>
                                        <Input
                                            type="number"
                                            value={form.age}
                                            onChange={(e) => setForm((x) => ({ ...x, age: Number(e.target.value) }))}
                                            className="rounded-2xl"
                                        />
                                    </Field>

                                    <Field label="Sexo" icon={<UserIcon className="h-4 w-4" />}>
                                        <select
                                            className="h-10 w-full rounded-2xl border bg-background px-3 text-sm"
                                            value={form.sex}
                                            onChange={(e) => setForm((x) => ({ ...x, sex: e.target.value as Sex }))}
                                        >
                                            <option value="MALE">Hombre</option>
                                            <option value="FEMALE">Mujer</option>
                                        </select>
                                    </Field>

                                    <Field label="Altura (cm)" icon={<Ruler className="h-4 w-4" />}>
                                        <Input
                                            type="number"
                                            value={form.heightCm}
                                            onChange={(e) => setForm((x) => ({ ...x, heightCm: Number(e.target.value) }))}
                                            className="rounded-2xl"
                                        />
                                    </Field>

                                    <Field label="Peso (kg)" icon={<Scale className="h-4 w-4" />}>
                                        <Input
                                            type="number"
                                            value={form.weightKg}
                                            onChange={(e) => setForm((x) => ({ ...x, weightKg: Number(e.target.value) }))}
                                            className="rounded-2xl"
                                        />
                                    </Field>
                                </div>

                                <div className="rounded-2xl border bg-background/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <Dumbbell className="h-4 w-4 text-emerald-600" />
                                            Actividad
                                        </div>
                                        <Pill>nivel</Pill>
                                    </div>

                                    <select
                                        className="h-10 w-full rounded-2xl border bg-background px-3 text-sm"
                                        value={form.activityLevel}
                                        onChange={(e) => setForm((x) => ({ ...x, activityLevel: e.target.value as ActivityLevel }))}
                                    >
                                        <option value="SEDENTARY">Sedentario</option>
                                        <option value="LIGHT">Ligera</option>
                                        <option value="MODERATE">Moderada</option>
                                        <option value="HIGH">Alta</option>
                                        <option value="VERY_HIGH">Muy alta</option>
                                    </select>
                                </div>

                                <div className="rounded-2xl border bg-background/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <Target className="h-4 w-4 text-fuchsia-600" />
                                            Objetivo
                                        </div>
                                        <Pill>meta</Pill>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <select
                                            className="h-10 w-full rounded-2xl border bg-background px-3 text-sm"
                                            value={form.goal}
                                            onChange={(e) => setForm((x) => ({ ...x, goal: e.target.value as Goal }))}
                                        >
                                            <option value="LOSE">Adelgazar</option>
                                            <option value="MAINTAIN">Mantener</option>
                                            <option value="GAIN">Ganar peso</option>
                                        </select>

                                        <select
                                            className="h-10 w-full rounded-2xl border bg-background px-3 text-sm"
                                            value={form.goalPace}
                                            onChange={(e) => setForm((x) => ({ ...x, goalPace: e.target.value as GoalPace }))}
                                            disabled={form.goal === "MAINTAIN"}
                                        >
                                            <option value="MILD">Suave</option>
                                            <option value="MEDIUM">Medio</option>
                                            <option value="AGGRESSIVE">Agresivo</option>
                                        </select>
                                    </div>
                                </div>

                                <Button onClick={save} variant="secondary" disabled={loading} className="w-full rounded-2xl">
                                    Guardar cambios
                                </Button>

                                <div className="text-xs text-muted-foreground">
                                    Targets actuales:{" "}
                                    <span className="font-medium text-foreground">{calorieTarget ?? "—"} kcal</span> ·{" "}
                                    <span className="font-medium text-foreground">{waterGoal ?? "—"} ml</span>
                                </div>
                            </CardContent>
                        </Card>

                        {/* CHARTS COLUMN */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* WEIGHT */}
                            <Card className="rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/15 to-lime-500/10 border">
                      <TrendingUp className="h-4 w-4" />
                    </span>
                                        Evolución del peso
                                    </CardTitle>

                                    <select
                                        className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                        value={weightDays}
                                        onChange={(e) => setWeightDays(Number(e.target.value))}
                                    >
                                        <option value={14}>14 días</option>
                                        <option value={30}>30 días</option>
                                        <option value={90}>90 días</option>
                                        <option value={365}>1 año</option>
                                    </select>
                                </CardHeader>

                                <CardContent>
                                    {weightChartData.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">
                                            No hay datos todavía. Cambia el peso y guarda para crear registros.
                                        </div>
                                    ) : (
                                        <ChartShell>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={weightChartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} domain={["dataMin - 1", "dataMax + 1"]} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="weightKg" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ChartShell>
                                    )}
                                </CardContent>
                            </Card>

                            {/* DAILY CALORIES */}
                            <Card className="rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 to-rose-500/10 border">
                      <Flame className="h-4 w-4" />
                    </span>
                                        Calorías por día
                                    </CardTitle>

                                    <select
                                        className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                        value={dailyDays}
                                        onChange={(e) => setDailyDays(Number(e.target.value))}
                                    >
                                        <option value={14}>14 días</option>
                                        <option value={30}>30 días</option>
                                        <option value={90}>90 días</option>
                                    </select>
                                </CardHeader>

                                <CardContent>
                                    {dailyTotals.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No hay datos todavía.</div>
                                    ) : (
                                        <ChartShell>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dailyTotals} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="calories" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ChartShell>
                                    )}
                                </CardContent>
                            </Card>

                            {/* DAILY WATER */}
                            <Card className="rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500/15 to-indigo-500/10 border">
                      <Droplets className="h-4 w-4" />
                    </span>
                                        Agua por día (ml)
                                    </CardTitle>

                                    <select
                                        className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                        value={dailyDays}
                                        onChange={(e) => setDailyDays(Number(e.target.value))}
                                    >
                                        <option value={14}>14 días</option>
                                        <option value={30}>30 días</option>
                                        <option value={90}>90 días</option>
                                    </select>
                                </CardHeader>

                                <CardContent>
                                    {dailyTotals.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No hay datos todavía.</div>
                                    ) : (
                                        <ChartShell>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={dailyTotals} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Line type="monotone" dataKey="waterMl" strokeWidth={3} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </ChartShell>
                                    )}
                                </CardContent>
                            </Card>

                            {/* CALORIES BY HOUR */}
                            <Card className="rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                                <CardHeader className="flex flex-row items-center justify-between pb-2">
                                    <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-fuchsia-500/15 to-pink-500/10 border">
                      <Clock className="h-4 w-4" />
                    </span>
                                        ¿A qué hora comes más calorías?
                                    </CardTitle>

                                    <select
                                        className="h-10 rounded-2xl border bg-background px-3 text-sm"
                                        value={hourDays}
                                        onChange={(e) => setHourDays(Number(e.target.value))}
                                    >
                                        <option value={7}>7 días</option>
                                        <option value={14}>14 días</option>
                                        <option value={30}>30 días</option>
                                    </select>
                                </CardHeader>

                                <CardContent>
                                    {hourTotals.length === 0 ? (
                                        <div className="text-sm text-muted-foreground">No hay datos todavía.</div>
                                    ) : (
                                        <ChartShell tall>
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={hourTotals} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                                                    <CartesianGrid strokeDasharray="3 3" />
                                                    <XAxis dataKey="hour" tick={{ fontSize: 12 }} />
                                                    <YAxis tick={{ fontSize: 12 }} />
                                                    <Tooltip />
                                                    <Bar dataKey="calories" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        </ChartShell>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Backend: {import.meta.env.VITE_API_BASE ?? "http://localhost:8081/api"}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ChartShell({ children, tall = false }: { children: React.ReactNode; tall?: boolean }) {
    return (
        <div className={["w-full rounded-2xl border bg-background/50 p-3", tall ? "h-72" : "h-64"].join(" ")}>
            {children}
        </div>
    );
}

function Field({
                   label,
                   icon,
                   children,
               }: {
    label: string;
    icon?: React.ReactNode;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border bg-background/60">
          {icon}
        </span>
                <span>{label}</span>
            </div>
            {children}
        </div>
    );
}

function Pill({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <span
            className={[
                "inline-flex items-center rounded-full border bg-background/60 px-2.5 py-1 text-xs text-muted-foreground",
                className,
            ].join(" ")}
        >
      {children}
    </span>
    );
}

function Stat({
                  label,
                  value,
                  icon,
                  accent,
              }: {
    label: string;
    value: string;
    icon: React.ReactNode;
    accent: string;
}) {
    return (
        <div className="rounded-2xl border bg-background/60 p-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={["h-8 w-8 rounded-2xl border bg-gradient-to-br", accent, "flex items-center justify-center"].join(" ")}>
                    {icon}
                </div>
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
    );
}
