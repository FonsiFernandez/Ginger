import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ActivityLevel, Goal, GoalPace, OnboardingRequest, Sex, UserDto } from "@/types";

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

    useEffect(() => {
        (async () => {
            const u = await apiGet<UserDto>(`/users/${userId}`);
            setUser(u);

            // precargar form con lo que haya
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
        <div className="min-h-screen w-full">
            <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold tracking-tight">Perfil</h1>
                        <p className="text-sm text-muted-foreground">
                            Edita tus datos. Al guardar se recalculan calorías objetivo y agua.
                        </p>
                    </div>
                    <Button variant="secondary" onClick={onBack}>
                        Volver
                    </Button>
                </div>

                {err ? <div className="text-sm text-destructive">{err}</div> : null}
                {ok ? <div className="text-sm text-emerald-700">{ok}</div> : null}

                <Card className="rounded-3xl bg-background/60 backdrop-blur-xl">
                    <CardHeader>
                        <CardTitle>Datos</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Edad">
                                <Input
                                    type="number"
                                    value={form.age}
                                    onChange={(e) => setForm((x) => ({ ...x, age: Number(e.target.value) }))}
                                />
                            </Field>

                            <Field label="Sexo">
                                <select
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    value={form.sex}
                                    onChange={(e) => setForm((x) => ({ ...x, sex: e.target.value as Sex }))}
                                >
                                    <option value="MALE">Hombre</option>
                                    <option value="FEMALE">Mujer</option>
                                </select>
                            </Field>

                            <Field label="Altura (cm)">
                                <Input
                                    type="number"
                                    value={form.heightCm}
                                    onChange={(e) => setForm((x) => ({ ...x, heightCm: Number(e.target.value) }))}
                                />
                            </Field>

                            <Field label="Peso (kg)">
                                <Input
                                    type="number"
                                    value={form.weightKg}
                                    onChange={(e) => setForm((x) => ({ ...x, weightKg: Number(e.target.value) }))}
                                />
                            </Field>
                        </div>

                        <Field label="Actividad">
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={form.activityLevel}
                                onChange={(e) => setForm((x) => ({ ...x, activityLevel: e.target.value as ActivityLevel }))}
                            >
                                <option value="SEDENTARY">Sedentario</option>
                                <option value="LIGHT">Ligera</option>
                                <option value="MODERATE">Moderada</option>
                                <option value="HIGH">Alta</option>
                                <option value="VERY_HIGH">Muy alta</option>
                            </select>
                        </Field>

                        <div className="grid grid-cols-2 gap-3">
                            <Field label="Objetivo">
                                <select
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    value={form.goal}
                                    onChange={(e) => setForm((x) => ({ ...x, goal: e.target.value as Goal }))}
                                >
                                    <option value="LOSE">Adelgazar</option>
                                    <option value="MAINTAIN">Mantener</option>
                                    <option value="GAIN">Ganar peso</option>
                                </select>
                            </Field>

                            <Field label="Ritmo">
                                <select
                                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                    value={form.goalPace}
                                    onChange={(e) => setForm((x) => ({ ...x, goalPace: e.target.value as GoalPace }))}
                                    disabled={form.goal === "MAINTAIN"}
                                >
                                    <option value="MILD">Suave</option>
                                    <option value="MEDIUM">Medio</option>
                                    <option value="AGGRESSIVE">Agresivo</option>
                                </select>
                            </Field>
                        </div>

                        <Button onClick={save} variant="secondary" disabled={loading} className="w-full">
                            Guardar cambios
                        </Button>

                        {/* Targets resultantes */}
                        <div className="text-sm text-muted-foreground">
                            Targets actuales:{" "}
                            <span className="font-medium">
                {(user as any)?.calorieTargetKcal ?? "—"} kcal
              </span>{" "}
                            ·{" "}
                            <span className="font-medium">
                {(user as any)?.waterGoalMl ?? "—"} ml
              </span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <div className="text-sm text-muted-foreground">{label}</div>
            {children}
        </div>
    );
}
