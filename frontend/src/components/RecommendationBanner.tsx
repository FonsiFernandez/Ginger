import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { Sparkles } from "lucide-react";

type TodayRecommendationsDto = {
    userId: number;
    date: string;
    messages: string[];
};

function pickPrimaryMessage(messages: string[]) {
    const priority = ["Ayuno", "Agua", "Comida"];
    for (const key of priority) {
        const found = messages.find((m) => m.startsWith(key + ":") || m.startsWith(key + " "));
        if (found) return found;
    }
    return messages[0] ?? null;
}

function toneFromMessage(msg: string) {
    if (!msg) return "info";
    if (msg.includes("objetivo cumplido") || msg.includes("cumplido")) return "success";
    if (msg.includes("te falta") || msg.includes("faltan") || msg.includes("cerca")) return "warn";
    return "info";
}

export function RecommendationBanner({ userId }: { userId: number }) {
    const [data, setData] = useState<TodayRecommendationsDto | null>(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        let mounted = true;

        (async () => {
            try {
                const res = await apiGet<TodayRecommendationsDto>(`/recommendations/today?userId=${userId}`);
                if (mounted) setData(res);
            } catch {
                if (mounted) setData(null);
            }
        })();

        return () => {
            mounted = false;
        };
    }, [userId]);

    const primary = useMemo(() => pickPrimaryMessage(data?.messages ?? []), [data]);
    if (!primary) return null;

    const tone = toneFromMessage(primary);

    const toneStyles =
        tone === "success"
            ? {
                border: "border-emerald-500/25",
                left: "bg-emerald-500/70",
                dot: "bg-emerald-500",
                icon: "text-emerald-700",
            }
            : tone === "warn"
                ? {
                    border: "border-amber-500/25",
                    left: "bg-amber-500/75",
                    dot: "bg-amber-500",
                    icon: "text-amber-700",
                }
                : {
                    border: "border-indigo-500/25",
                    left: "bg-indigo-500/70",
                    dot: "bg-indigo-500",
                    icon: "text-indigo-700",
                };

    return (
        <div className={["relative overflow-hidden rounded-2xl border bg-background/50 backdrop-blur-xl", toneStyles.border].join(" ")}>
            {/* barra izquierda */}
            <div className={["absolute left-0 top-0 h-full w-1", toneStyles.left].join(" ")} />

            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className={["mt-1 h-2.5 w-2.5 rounded-full", toneStyles.dot].join(" ")} />
                    <div className="flex-1">
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <Sparkles className={["h-4 w-4", toneStyles.icon].join(" ")} />
                                <div className="text-xs text-muted-foreground">Sugerencia de hoy</div>
                            </div>

                            {data?.messages?.length && data.messages.length > 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setOpen((v) => !v)}
                                    className="text-xs text-muted-foreground hover:text-foreground transition"
                                >
                                    {open ? "Ocultar" : "Ver más"}
                                </button>
                            ) : null}
                        </div>

                        <div className="mt-1 text-sm leading-relaxed">{primary}</div>

                        {open ? (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {data!.messages.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-full border bg-background/60 px-3 py-1 text-xs text-muted-foreground"
                                    >
                                        {m}
                                    </div>
                                ))}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
}
