import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { TodaySummaryDto, UserDto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
    Droplets,
    Flame,
    Leaf,
    Sparkles,
    RefreshCw,
    Play,
    Square,
    User as UserIcon,
    Candy,
} from "lucide-react";

function pct(value: number, target?: number | null) {
    if (!target || target <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

export default function Dashboard({ onOpenProfile }: { onOpenProfile: () => void }) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [userId, setUserId] = useState<number>(1);
    const [summary, setSummary] = useState<TodaySummaryDto | null>(null);
    const [waterMl, setWaterMl] = useState<number>(250);
    const [mealText, setMealText] = useState<string>("café con leche y tostada con mantequilla");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function refresh() {
        setErr(null);
        const s = await apiGet<TodaySummaryDto>(`/summary/today?userId=${userId}`);
        setSummary(s);
    }

    useEffect(() => {
        (async () => {
            const u = await apiGet<UserDto[]>("/users");
            setUsers(u);
            if (u.length > 0) setUserId(u[0].id);
        })();
    }, []);

    useEffect(() => {
        if (!userId) return;
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    const waterProgress = useMemo(() => {
        if (!summary) return null;
        return pct(summary.consumed.waterMl, summary.targets.waterGoalMl);
    }, [summary]);

    const calorieProgress = useMemo(() => {
        if (!summary) return null;
        return pct(summary.consumed.calories, summary.targets.calorieTargetKcal);
    }, [summary]);

    async function addWater() {
        setLoading(true);
        setErr(null);
        try {
            await apiPost("/water", { userId, ml: waterMl });
            await refresh();
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function logMealAi() {
        setLoading(true);
        setErr(null);
        try {
            await apiPost("/ai/log-meal", { userId, text: mealText });
            await refresh();
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function startFasting() {
        setLoading(true);
        setErr(null);
        try {
            await apiPost("/fasting/start", { userId, protocol: "16:8" });
            await refresh();
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    async function stopFasting() {
        setLoading(true);
        setErr(null);
        try {
            await apiPost(`/fasting/stop?userId=${userId}`, {});
            await refresh();
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    const fastingBadge = summary?.fastingActive
        ? `Ayuno activo · ${summary.fastingProtocol ?? "custom"}`
        : "Sin ayuno activo";

    return (
        <div className="min-h-screen w-full bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_55%),radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.14),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(236,72,153,0.10),transparent_55%)]">
            <main className="w-full">
                {/* CONTENEDOR CENTRADO (máximo razonable) */}
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
                                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Ginger</h1>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Resumen diario: calorías, agua, ayuno y azúcar. Sencillo, rápido y claro.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <div
                                        className={[
                                            "inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm bg-background/60",
                                            summary?.fastingActive ? "border-emerald-500/30" : "border-muted",
                                        ].join(" ")}
                                    >
                                        <Leaf
                                            className={[
                                                "h-4 w-4",
                                                summary?.fastingActive ? "text-emerald-600" : "text-muted-foreground",
                                            ].join(" ")}
                                        />
                                        <span className="text-muted-foreground">{fastingBadge}</span>
                                    </div>

                                    <div className="flex items-center gap-2 rounded-2xl border bg-background/60 px-3 py-2">
                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                        <select
                                            className="h-9 rounded-md bg-transparent text-sm outline-none"
                                            value={userId}
                                            onChange={(e) => setUserId(Number(e.target.value))}
                                        >
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} (id {u.id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button onClick={refresh} variant="secondary" disabled={loading} className="rounded-2xl">
                                        <RefreshCw className={["h-4 w-4 mr-2", loading ? "animate-spin" : ""].join(" ")} />
                                        Refrescar
                                    </Button>
                                    <Button onClick={onOpenProfile} variant="secondary" className="rounded-2xl">
                                        Perfil
                                    </Button>
                                </div>
                            </div>

                            {err ? (
                                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {err}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* GRID PRINCIPAL (mejor reparto en pantallas grandes) */}
                    <div className="grid gap-6 lg:grid-cols-12">
                        {/* TODAY */}
                        <Card className="lg:col-span-8 rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 to-rose-500/15 border">
                    <Flame className="h-4 w-4" />
                  </span>
                                    Hoy
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-6">
                                {summary ? (
                                    <>
                                        {/* CALORIES */}
                                        <Section
                                            title="Calorías"
                                            right={`${Math.round(summary.consumed.calories)}${
                                                summary.targets.calorieTargetKcal ? ` / ${summary.targets.calorieTargetKcal}` : ""
                                            }`}
                                            icon={<Flame className="h-4 w-4" />}
                                            badge={calorieProgress !== null ? `${calorieProgress}%` : undefined}
                                        >
                                            <ProgressBlock value={calorieProgress} />
                                        </Section>

                                        {/* STATS */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                            <Stat
                                                label="Proteína"
                                                value={`${Math.round(summary.consumed.proteinG)} g`}
                                                icon={<Leaf className="h-4 w-4" />}
                                                accent="from-emerald-500/15 to-lime-500/10"
                                            />
                                            <Stat
                                                label="Azúcar"
                                                value={`${Math.round(summary.consumed.sugarG)} g`}
                                                icon={<Candy className="h-4 w-4" />}
                                                accent="from-fuchsia-500/15 to-pink-500/10"
                                            />
                                            <Stat
                                                label="Agua"
                                                value={`${summary.consumed.waterMl} ml`}
                                                icon={<Droplets className="h-4 w-4" />}
                                                accent="from-sky-500/15 to-indigo-500/10"
                                            />
                                        </div>

                                        {/* WATER */}
                                        <Section
                                            title="Agua"
                                            right={`${summary.consumed.waterMl}${
                                                summary.targets.waterGoalMl ? ` / ${summary.targets.waterGoalMl} ml` : " ml"
                                            }`}
                                            icon={<Droplets className="h-4 w-4" />}
                                            badge={waterProgress !== null ? `${waterProgress}%` : undefined}
                                        >
                                            <ProgressBlock value={waterProgress} />
                                        </Section>
                                    </>
                                ) : (
                                    <div className="text-sm text-muted-foreground">Cargando…</div>
                                )}
                            </CardContent>
                        </Card>

                        {/* QUICK ACTIONS */}
                        <Card className="lg:col-span-4 rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/15 to-fuchsia-500/10 border">
                    <Sparkles className="h-4 w-4" />
                  </span>
                                    Acciones rápidas
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="space-y-5">
                                {/* WATER ACTION */}
                                <div className="rounded-2xl border bg-background/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <Droplets className="h-4 w-4 text-sky-600" />
                                            Añadir agua
                                        </div>
                                        <Pill>ml</Pill>
                                    </div>

                                    <div className="flex gap-2">
                                        <Input
                                            type="number"
                                            value={waterMl}
                                            onChange={(e) => setWaterMl(Number(e.target.value))}
                                            placeholder="ml"
                                            className="rounded-2xl"
                                        />
                                        <Button onClick={addWater} variant="secondary" disabled={loading} className="rounded-2xl">
                                            <Droplets className="h-4 w-4 mr-2" />
                                            Añadir
                                        </Button>
                                    </div>
                                </div>

                                {/* AI MEAL */}
                                <div className="rounded-2xl border bg-background/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-fuchsia-600" />
                                            Registrar comida (IA)
                                        </div>
                                        <Pill>texto</Pill>
                                    </div>

                                    <Input
                                        value={mealText}
                                        onChange={(e) => setMealText(e.target.value)}
                                        className="rounded-2xl"
                                        placeholder="Ej: arroz con pollo y ensalada"
                                    />

                                    <Button
                                        onClick={logMealAi}
                                        disabled={loading}
                                        variant="secondary"
                                        className="w-full rounded-2xl"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Parsear y guardar
                                    </Button>
                                </div>

                                {/* FASTING */}
                                <div className="rounded-2xl border bg-background/50 p-4 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium flex items-center gap-2">
                                            <Leaf className="h-4 w-4 text-emerald-600" />
                                            Ayuno
                                        </div>
                                        <Pill>16:8</Pill>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            onClick={startFasting}
                                            variant="secondary"
                                            disabled={loading || summary?.fastingActive}
                                            className="rounded-2xl"
                                        >
                                            <Play className="h-4 w-4 mr-2" />
                                            Start
                                        </Button>
                                        <Button
                                            onClick={stopFasting}
                                            variant="secondary"
                                            disabled={loading || !summary?.fastingActive}
                                            className="rounded-2xl"
                                        >
                                            <Square className="h-4 w-4 mr-2" />
                                            Stop
                                        </Button>
                                    </div>

                                    {summary?.fastingActive ? (
                                        <div className="text-sm text-muted-foreground">
                                            Activo: <span className="font-medium">{summary.fastingProtocol ?? "custom"}</span>{" "}
                                            <span className="text-xs">(id {summary.activeFastingId})</span>
                                        </div>
                                    ) : (
                                        <div className="text-sm text-muted-foreground">No hay ayuno activo.</div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="text-xs text-muted-foreground">
                        Backend: {import.meta.env.VITE_API_BASE ?? "http://localhost:8081/api"}
                    </div>
                </div>
            </main>
        </div>
    );
}

function ProgressBlock({ value }: { value: number | null }) {
    if (value === null) return null;
    return (
        <div className="space-y-2">
            <div className="rounded-2xl border bg-background/50 p-2">
                <Progress value={value} />
            </div>
        </div>
    );
}

function Section({
                     title,
                     right,
                     icon,
                     badge,
                     children,
                 }: {
    title: string;
    right: string;
    icon: React.ReactNode;
    badge?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-medium">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border bg-background/60">
            {icon}
          </span>
                    <span>{title}</span>
                    {badge ? <Pill className="ml-1">{badge}</Pill> : null}
                </div>
                <div className="text-sm text-muted-foreground">{right}</div>
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
                <div
                    className={[
                        "h-8 w-8 rounded-2xl border bg-gradient-to-br",
                        accent,
                        "flex items-center justify-center",
                    ].join(" ")}
                >
                    {icon}
                </div>
            </div>
            <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
        </div>
    );
}
