"use client";

import * as Accordion from "@radix-ui/react-accordion";
import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { ChevronDown, Download, Info } from "lucide-react";
import { toPng } from "html-to-image";
import { useMemo, useRef, useState } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

const steps = [0, 25, 50, 75, 100];

const initialCategories = [
  {
    id: "market",
    name: "Économie productive",
    description: "Entreprise, concurrence, investissement, création de valeur.",
    subs: [
      { id: "business", name: "Liberté d’entreprendre", value: 60 },
      { id: "competition", name: "Concurrence", value: 55 },
      { id: "investment", name: "Investissement privé", value: 60 },
    ],
  },
  {
    id: "tax",
    name: "Contribution publique",
    description: "Niveau de prélèvement et financement collectif.",
    subs: [
      { id: "incomeTax", name: "Impôt sur le revenu", value: 50 },
      { id: "companyTax", name: "Fiscalité des entreprises", value: 50 },
      { id: "localTax", name: "Fiscalité locale", value: 50 },
    ],
  },
  {
    id: "support",
    name: "Accompagnement social",
    description: "Aides, protection, accès aux ressources essentielles.",
    subs: [
      { id: "health", name: "Santé", value: 65 },
      { id: "housing", name: "Logement", value: 45 },
      { id: "unemployment", name: "Chômage", value: 50 },
      { id: "retirement", name: "Retraites", value: 55 },
    ],
  },
  {
    id: "security",
    name: "Sécurité et justice",
    description: "Sanction, ordre public, protection des personnes.",
    subs: [
      { id: "police", name: "Présence policière", value: 60 },
      { id: "sentences", name: "Fermeté des sanctions", value: 55 },
      { id: "justiceSpeed", name: "Rapidité judiciaire", value: 50 },
    ],
  },
  {
    id: "freedoms",
    name: "Libertés civiles",
    description: "Expression, vie privée, autonomie individuelle.",
    subs: [
      { id: "speech", name: "Liberté d’expression", value: 75 },
      { id: "privacy", name: "Vie privée", value: 65 },
      { id: "association", name: "Liberté d’association", value: 70 },
    ],
  },
  {
    id: "admin",
    name: "Simplicité administrative",
    description: "Lisibilité des règles, démarches, charge réglementaire.",
    subs: [
      { id: "paperwork", name: "Démarches", value: 60 },
      { id: "rules", name: "Lisibilité des règles", value: 55 },
      { id: "speed", name: "Rapidité administrative", value: 50 },
    ],
  },
];

function average(values: number[]) {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function StepSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="space-y-3">
      <Slider.Root
        value={[value]}
        min={0}
        max={100}
        step={25}
        onValueChange={([v]) => onChange(v)}
        className="relative flex h-5 w-full touch-none items-center"
      >
        <Slider.Track className="relative h-2 w-full rounded-[9px] bg-neutral-200">
          <Slider.Range className="absolute h-full rounded-[9px] bg-black" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-[9px] bg-black shadow-md outline-none transition-transform hover:scale-110 focus:ring-4 focus:ring-black/10" />
      </Slider.Root>

      <div className="relative flex justify-between px-1">
        {steps.map((step) => (
          <span
            key={step}
            className={`h-2 w-2 rounded-full ${
              value >= step ? "bg-black" : "bg-neutral-300"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"intro" | "game" | "result">("intro");
  const [categories, setCategories] = useState(initialCategories);
  const cardRef = useRef<HTMLDivElement>(null);

  const categoryScores = useMemo(
    () =>
      categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        value: average(cat.subs.map((s) => s.value)),
      })),
    [categories]
  );

  const radarData = useMemo(() => {
    const get = (id: string) =>
      categoryScores.find((c) => c.id === id)?.value ?? 50;

    return [
      { subject: "Autonomie", value: average([get("market"), get("freedoms")]) },
      { subject: "Cadre", value: average([get("security"), get("admin")]) },
      { subject: "Protection", value: get("support") },
      { subject: "Simplicité", value: get("admin") },
      { subject: "Dynamisme", value: get("market") },
      { subject: "Responsabilité", value: average([get("tax"), get("security")]) },
    ];
  }, [categoryScores]);

  const profileName = useMemo(() => {
    const autonomy = radarData.find((d) => d.subject === "Autonomie")?.value ?? 50;
    const frame = radarData.find((d) => d.subject === "Cadre")?.value ?? 50;
    const protection = radarData.find((d) => d.subject === "Protection")?.value ?? 50;

    if (autonomy >= 70 && frame >= 60) return "Libéral cadré";
    if (protection >= 70 && frame >= 60) return "Protecteur structuré";
    if (autonomy >= 70 && frame < 45) return "Autonomiste ouvert";
    if (frame >= 75) return "Ordre renforcé";
    return "Équilibriste pragmatique";
  }, [radarData]);

  function updateParent(categoryId: string, newValue: number) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({ ...sub, value: newValue })),
        };
      })
    );
  }

  function updateSub(categoryId: string, subId: string, newValue: number) {
    setCategories((prev) =>
      prev.map((cat) => {
        if (cat.id !== categoryId) return cat;
        return {
          ...cat,
          subs: cat.subs.map((sub) =>
            sub.id === subId ? { ...sub, value: newValue } : sub
          ),
        };
      })
    );
  }

  async function downloadCard() {
    if (!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = "civis-profil.png";
    link.href = dataUrl;
    link.click();
  }

  return (
    <main className="min-h-screen bg-[#f6f6f3] text-neutral-950">
      {screen === "intro" && (
        <section className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="space-y-4">
              <p className="text-sm uppercase tracking-[0.35em] text-neutral-500">
                CIVIS
              </p>
              <h1 className="text-5xl font-semibold tracking-tight md:text-7xl">
                Testez vos arbitrages.
              </h1>
              <p className="mx-auto max-w-xl text-lg text-neutral-600">
                Ajustez différents paramètres publics et observez l’équilibre
                qu’ils produisent.
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setScreen("game")}
                className="rounded-[9px] bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
              >
                Commencer
              </button>

              <Dialog.Root>
                <Dialog.Trigger className="inline-flex items-center gap-2 rounded-[9px] border border-neutral-300 bg-white px-5 py-3 text-neutral-800 transition hover:bg-neutral-100">
                  <Info size={16} />
                  Comprendre
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[9px] bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-semibold">
                      Comprendre Civis
                    </Dialog.Title>
                    <Dialog.Description className="mt-4 text-neutral-600">
                      Chaque choix a des conséquences. Certaines sont visibles
                      immédiatement. D’autres apparaissent plus loin. Civis
                      visualise ces interactions et permet d’explorer différents
                      équilibres à travers une série de paramètres liés entre eux.
                    </Dialog.Description>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </motion.div>
        </section>
      )}

      {screen === "game" && (
        <section className="mx-auto max-w-4xl px-6 py-10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                CIVIS
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Construisez votre modèle
              </h1>
            </div>
            <button
              onClick={() => setScreen("result")}
              className="rounded-[9px] bg-black px-5 py-3 text-white transition hover:bg-neutral-800"
            >
              Voir le résultat
            </button>
          </div>

          <Accordion.Root type="multiple" className="space-y-3">
            {categories.map((cat) => {
              const parentValue = average(cat.subs.map((s) => s.value));

              return (
                <Accordion.Item
                  key={cat.id}
                  value={cat.id}
                  className="rounded-[9px] border border-neutral-200 bg-white p-5 shadow-sm"
                >
                  <div className="grid gap-5 md:grid-cols-[1fr_320px_32px] md:items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{cat.name}</h2>
                      <p className="mt-1 text-sm text-neutral-500">
                        {cat.description}
                      </p>
                    </div>

                    <StepSlider
                      value={parentValue}
                      onChange={(v) => updateParent(cat.id, v)}
                    />

                    <Accordion.Trigger className="group flex h-8 w-8 items-center justify-center rounded-[9px] border border-neutral-200 transition hover:bg-neutral-100">
                      <ChevronDown
                        size={18}
                        className="transition-transform group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </div>

                  <Accordion.Content className="overflow-hidden data-[state=closed]:animate-slideUp data-[state=open]:animate-slideDown">
                    <div className="mt-5 space-y-5 border-t border-neutral-100 pt-5">
                      {cat.subs.map((sub) => (
                        <div
                          key={sub.id}
                          className="grid gap-3 md:grid-cols-[1fr_320px]"
                        >
                          <div className="text-sm font-medium">{sub.name}</div>
                          <StepSlider
                            value={sub.value}
                            onChange={(v) => updateSub(cat.id, sub.id, v)}
                          />
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </section>
      )}

      {screen === "result" && (
        <section className="mx-auto max-w-6xl px-6 py-10">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
                Résultat
              </p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight">
                Votre équilibre Civis
              </h1>
            </div>
            <button
              onClick={() => setScreen("game")}
              className="rounded-[9px] border border-neutral-300 bg-white px-5 py-3 transition hover:bg-neutral-100"
            >
              Modifier
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="rounded-[9px] border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Radar d’équilibre</h2>
              <div className="mt-6 h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" />
                    <Radar dataKey="value" fill="#111" fillOpacity={0.22} stroke="#111" />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-4">
              <div
                ref={cardRef}
                className="rounded-[9px] bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-600 p-8 text-white shadow-xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                  CIVIS
                </p>
                <h2 className="mt-10 text-4xl font-semibold">{profileName}</h2>
                <p className="mt-5 text-lg text-white/75">
                  Un modèle construit autour de compromis entre autonomie,
                  cadre, protection et responsabilité.
                </p>

                <div className="mt-10 grid grid-cols-2 gap-4">
                  {radarData.slice(0, 4).map((item) => (
                    <div key={item.subject}>
                      <p className="text-3xl font-semibold">{item.value}</p>
                      <p className="text-sm text-white/60">{item.subject}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={downloadCard}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[9px] bg-black px-5 py-3 text-white transition hover:bg-neutral-800"
              >
                <Download size={18} />
                Télécharger la carte
              </button>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
