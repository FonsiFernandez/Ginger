import { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { TodaySummaryDto, UserDto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

function pct(value: number, target?: number | null) {
    if (!target || target <= 0) return null;
    return Math.max(0, Math.min(100, Math.round((value / target) * 100)));
}

export default function Dashboard() {
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/40">
            <div className="mx-auto max-w-5xl p-6 space-y-6">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-semibold tracking-tight">Ginger</h1>
                    <p className="text-sm text-muted-foreground">
                        Resumen diario: calorías, agua, ayuno y azúcar.
                    </p>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Usuario</CardTitle>
                        <select
                            className="h-9 rounded-md border bg-background px-3 text-sm"
                            value={userId}
                            onChange={(e) => setUserId(Number(e.target.value))}
                        >
                            {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                    {u.name} (id {u.id})
                                </option>
                            ))}
                        </select>
                    </CardHeader>
                    <CardContent>
                        {err ? <div className="text-sm text-destructive">{err}</div> : null}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Hoy</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {summary ? (
                                <>
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Calorías</span>
                                            <span>
                        {Math.round(summary.consumed.calories)}
                                                {summary.targets.calorieTargetKcal ? ` / ${summary.targets.calorieTargetKcal}` : ""}
                      </span>
                                        </div>
                                        {calorieProgress !== null ? <Progress value={calorieProgress} /> : null}
                                    </div>

                                    <div className="grid grid-cols-3 gap-3">
                                        <Stat label="Proteína" value={`${Math.round(summary.consumed.proteinG)} g`} />
                                        <Stat label="Azúcar" value={`${Math.round(summary.consumed.sugarG)} g`} />
                                        <Stat label="Agua" value={`${summary.consumed.waterMl} ml`} />
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Agua</span>
                                            <span>
                        {summary.consumed.waterMl}
                                                {summary.targets.waterGoalMl ? ` / ${summary.targets.waterGoalMl} ml` : " ml"}
                      </span>
                                        </div>
                                        {waterProgress !== null ? <Progress value={waterProgress} /> : null}
                                    </div>
                                </>
                            ) : (
                                <div className="text-sm text-muted-foreground">Cargando...</div>
                            )}

                            <Button onClick={refresh} variant="secondary" disabled={loading}>
                                Refrescar
                            </Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Acciones rápidas</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <div className="text-sm font-medium">Añadir agua</div>
                                <div className="flex gap-2">
                                    <Input
                                        type="number"
                                        value={waterMl}
                                        onChange={(e) => setWaterMl(Number(e.target.value))}
                                        placeholder="ml"
                                    />
                                    <Button onClick={addWater} disabled={loading}>
                                        Añadir
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Registrar comida (IA)</div>
                                <Input value={mealText} onChange={(e) => setMealText(e.target.value)} />
                                <Button onClick={logMealAi} disabled={loading}>
                                    Parsear y guardar
                                </Button>
                            </div>

                            <div className="space-y-2">
                                <div className="text-sm font-medium">Ayuno</div>
                                <div className="flex gap-2">
                                    <Button onClick={startFasting} disabled={loading || summary?.fastingActive}>
                                        Start
                                    </Button>
                                    <Button onClick={stopFasting} variant="secondary" disabled={loading || !summary?.fastingActive}>
                                        Stop
                                    </Button>
                                </div>
                                {summary?.fastingActive ? (
                                    <div className="text-sm text-muted-foreground">
                                        Activo: {summary.fastingProtocol ?? "custom"} (id {summary.activeFastingId})
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
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-background p-3">
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-lg font-semibold">{value}</div>
        </div>
    );
}
