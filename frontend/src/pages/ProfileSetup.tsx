import { useMemo, useState } from "react";
import { apiPost } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { OnboardingRequest, UserDto } from "@/types";

export default function ProfileSetup({ user, onDone }: { user: UserDto; onDone: (u: UserDto) => void }) {
    const [form, setForm] = useState<OnboardingRequest>({
        age: 34,
        sex: "MALE",
        heightCm: 178,
        weightKg: 78,
        activityLevel: "MODERATE",
        goal: "MAINTAIN",
        goalPace: "MILD",
    });

    const [loading, setLoading] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    const canSubmit = useMemo(() => {
        return form.age > 0 && form.heightCm > 0 && form.weightKg > 0;
    }, [form]);

    async function submit() {
        setLoading(true);
        setErr(null);
        try {
            const updated = await apiPost<UserDto>(`/users/${user.id}/onboarding`, form);
            onDone(updated);
        } catch (e: any) {
            setErr(String(e?.message ?? e));
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex items-center justify-center px-4 py-10">
            <Card className="w-full max-w-xl rounded-3xl border bg-background/70 backdrop-blur-xl">
                <CardHeader>
                    <CardTitle>Configura tu perfil</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Con estos datos calcularemos tu objetivo de calorías y agua.
                    </p>
                </CardHeader>

                <CardContent className="space-y-4">
                    {err ? <div className="text-sm text-destructive">{err}</div> : null}

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Edad</label>
                            <Input
                                type="number"
                                value={form.age}
                                onChange={(e) => setForm((f) => ({ ...f, age: Number(e.target.value) }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Sexo</label>
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={form.sex}
                                onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value as any }))}
                            >
                                <option value="MALE">Hombre</option>
                                <option value="FEMALE">Mujer</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Altura (cm)</label>
                            <Input
                                type="number"
                                value={form.heightCm}
                                onChange={(e) => setForm((f) => ({ ...f, heightCm: Number(e.target.value) }))}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Peso (kg)</label>
                            <Input
                                type="number"
                                value={form.weightKg}
                                onChange={(e) => setForm((f) => ({ ...f, weightKg: Number(e.target.value) }))}
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-sm text-muted-foreground">Actividad</label>
                        <select
                            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                            value={form.activityLevel}
                            onChange={(e) => setForm((f) => ({ ...f, activityLevel: e.target.value as any }))}
                        >
                            <option value="SEDENTARY">Sedentario (poco movimiento)</option>
                            <option value="LIGHT">Ligera (1–3 días/sem)</option>
                            <option value="MODERATE">Moderada (3–5 días/sem)</option>
                            <option value="HIGH">Alta (6–7 días/sem)</option>
                            <option value="VERY_HIGH">Muy alta (trabajo físico + entreno)</option>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Objetivo</label>
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={form.goal}
                                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value as any }))}
                            >
                                <option value="LOSE">Adelgazar</option>
                                <option value="MAINTAIN">Mantener</option>
                                <option value="GAIN">Ganar peso</option>
                            </select>
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm text-muted-foreground">Ritmo</label>
                            <select
                                className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                                value={form.goalPace}
                                onChange={(e) => setForm((f) => ({ ...f, goalPace: e.target.value as any }))}
                                disabled={form.goal === "MAINTAIN"}
                            >
                                <option value="MILD">Suave</option>
                                <option value="MEDIUM">Medio</option>
                                <option value="AGGRESSIVE">Agresivo</option>
                            </select>
                        </div>
                    </div>

                    <Button className="w-full" onClick={submit} disabled={!canSubmit || loading}>
                        Guardar y calcular
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
