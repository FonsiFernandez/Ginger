import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import type { FoodLogDto, PageDto, UserDto } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Sparkles,
    Utensils,
    RefreshCw,
    User as UserIcon,
    Flame,
    Leaf,
    Wheat,
    Candy,
    Droplet,
    ChevronLeft,
} from "lucide-react";

function fmtDate(iso: string) {
    const d = new Date(iso);
    return d.toLocaleString();
}

function n0(x?: number | null) {
    if (x === null || x === undefined || Number.isNaN(x)) return 0;
    return x;
}

function fmtInt(x?: number | null) {
    return Math.round(n0(x)).toString();
}

export default function FoodHistory({
                                        userId,
                                        onBack,
                                    }: {
    userId: number;
    onBack: () => void;
}) {
    const [users, setUsers] = useState<UserDto[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<number>(userId);

    const [page, setPage] = useState(0);
    const [size] = useState(25);

    const [data, setData] = useState<PageDto<FoodLogDto> | null>(null);
    const [q, setQ] = useState("");
    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    async function load(p = page) {
        setLoading(true);
        setErr(null);
        try {
            const res = await apiGet<PageDto<FoodLogDto>>(
                `/food-logs?userId=${selectedUserId}&page=${p}&size=${size}`
            );
            setData(res);
            setPage(p);
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        (async () => {
            const u = await apiGet<UserDto[]>("/users");
            setUsers(u);
            if (u.length > 0 && !selectedUserId) setSelectedUserId(u[0].id);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!selectedUserId) return;
        load(0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedUserId]);

    const filtered = useMemo(() => {
        const list = data?.content ?? [];
        const needle = q.trim().toLowerCase();
        if (!needle) return list;
        return list.filter((x) => (x.description ?? "").toLowerCase().includes(needle));
    }, [data, q]);

    const totals = useMemo(() => {
        const list = filtered;
        const t = list.reduce(
            (acc, x) => {
                acc.cal += n0(x.calories);
                acc.pro += n0(x.proteinG);
                acc.car += n0(x.carbsG);
                acc.sug += n0(x.sugarG);
                return acc;
            },
            { cal: 0, pro: 0, car: 0, sug: 0 }
        );
        return {
            cal: Math.round(t.cal),
            pro: Math.round(t.pro),
            car: Math.round(t.car),
            sug: Math.round(t.sug),
        };
    }, [filtered]);

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
                                        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
                                            Historial de comidas
                                        </h1>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        Tus comidas registradas, ordenadas por fecha (más reciente primero).
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                                    <div className="flex items-center gap-2 rounded-2xl border bg-background/60 px-3 py-2">
                                        <UserIcon className="h-4 w-4 text-muted-foreground" />
                                        <select
                                            className="h-9 rounded-md bg-transparent text-sm outline-none"
                                            value={selectedUserId}
                                            onChange={(e) => setSelectedUserId(Number(e.target.value))}
                                        >
                                            {users.map((u) => (
                                                <option key={u.id} value={u.id}>
                                                    {u.name} (id {u.id})
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <Button
                                        onClick={() => load(page)}
                                        variant="secondary"
                                        disabled={loading}
                                        className="rounded-2xl"
                                    >
                                        <RefreshCw className={["h-4 w-4 mr-2", loading ? "animate-spin" : ""].join(" ")} />
                                        Refrescar
                                    </Button>

                                    <Button onClick={onBack} variant="secondary" className="rounded-2xl">
                                        <ChevronLeft className="h-4 w-4 mr-2" />
                                        Volver
                                    </Button>
                                </div>
                            </div>

                            {err ? (
                                <div className="rounded-2xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                                    {err}
                                </div>
                            ) : null}

                            <div className="grid gap-3 lg:grid-cols-12">
                                <div className="lg:col-span-8">
                                    <Input
                                        value={q}
                                        onChange={(e) => setQ(e.target.value)}
                                        placeholder="Buscar por texto… (ej: pollo, café, ensalada)"
                                        className="rounded-2xl bg-background/60"
                                    />
                                </div>

                                <div className="lg:col-span-4 grid grid-cols-2 gap-2">
                                    <MiniKpi icon={<Flame className="h-4 w-4" />} label="kcal" value={totals.cal} />
                                    <MiniKpi icon={<Leaf className="h-4 w-4" />} label="prot (g)" value={totals.pro} />
                                    <MiniKpi icon={<Wheat className="h-4 w-4" />} label="carbs (g)" value={totals.car} />
                                    <MiniKpi icon={<Candy className="h-4 w-4" />} label="azúcar (g)" value={totals.sug} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* LIST */}
                    <Card className="rounded-3xl border bg-background/60 backdrop-blur-xl shadow-sm">
                        <CardHeader className="pb-2 flex flex-row items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500/15 to-rose-500/15 border">
                  <Utensils className="h-4 w-4" />
                </span>
                                Comidas
                            </CardTitle>

                            <div className="text-xs text-muted-foreground">
                                {data ? `${data.totalElements} registros` : "—"}
                            </div>
                        </CardHeader>

                        <CardContent className="space-y-3">
                            {!data ? (
                                <div className="text-sm text-muted-foreground">Cargando…</div>
                            ) : filtered.length === 0 ? (
                                <div className="text-sm text-muted-foreground">No hay resultados.</div>
                            ) : (
                                <div className="space-y-3">
                                    {filtered.map((m) => (
                                        <div key={m.id} className="rounded-2xl border bg-background/50 p-4">
                                            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                                                <div className="space-y-1">
                                                    <div className="text-sm font-medium">{m.description}</div>
                                                    <div className="text-xs text-muted-foreground">
                                                        {fmtDate(m.eatenAt)} · id {m.id}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                                    <StatChip icon={<Flame className="h-4 w-4" />} label="kcal" value={fmtInt(m.calories)} />
                                                    <StatChip icon={<Leaf className="h-4 w-4" />} label="prot" value={`${fmtInt(m.proteinG)} g`} />
                                                    <StatChip icon={<Wheat className="h-4 w-4" />} label="carbs" value={`${fmtInt(m.carbsG)} g`} />
                                                    <StatChip icon={<Candy className="h-4 w-4" />} label="azúcar" value={`${fmtInt(m.sugarG)} g`} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* PAGINATION */}
                            {data ? (
                                <div className="pt-2 flex items-center justify-between">
                                    <div className="text-xs text-muted-foreground">
                                        Página {data.number + 1} / {data.totalPages}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="secondary"
                                            className="rounded-2xl"
                                            disabled={loading || data.first}
                                            onClick={() => load(page - 1)}
                                        >
                                            Anterior
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            className="rounded-2xl"
                                            disabled={loading || data.last}
                                            onClick={() => load(page + 1)}
                                        >
                                            Siguiente
                                        </Button>
                                    </div>
                                </div>
                            ) : null}
                        </CardContent>
                    </Card>

                    <div className="text-xs text-muted-foreground">
                        Backend: {import.meta.env.VITE_API_BASE ?? "http://localhost:8081/api"}
                    </div>
                </div>
            </main>
        </div>
    );
}

function MiniKpi({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="rounded-2xl border bg-background/60 px-3 py-2 flex items-center justify-between gap-2">
            <div className="inline-flex h-8 w-8 items-center justify-center rounded-2xl border bg-background/60">
                {icon}
            </div>
            <div className="text-right">
                <div className="text-[11px] text-muted-foreground">{label}</div>
                <div className="text-sm font-semibold">{value}</div>
            </div>
        </div>
    );
}

function StatChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="rounded-xl border bg-background/60 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
                <div className="inline-flex h-7 w-7 items-center justify-center rounded-xl border bg-background/60">
                    {icon}
                </div>
                <div className="text-right">
                    <div className="text-xs text-muted-foreground">{label}</div>
                    <div className="text-sm font-semibold">{value}</div>
                </div>
            </div>
        </div>
    );
}
