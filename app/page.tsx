"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { Download, Info, X } from "lucide-react";
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
    description: "Protection, accès aux soins, retraites, chômage et logement.",
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
    description: "Ordre public, sanctions, rapidité judiciaire.",
    subs: [
      { id: "police", name: "Présence policière", value: 60 },
      { id: "sentences", name: "Fermeté des sanctions", value: 55 },
      { id: "justiceSpeed", name: "Rapidité judiciaire", value: 50 },
    ],
  },
  {
    id: "freedoms",
    name: "Libertés civiles",
    description: "Expression, vie privée, association.",
    subs: [
      { id: "speech", name: "Liberté d’expression", value: 75 },
      { id: "privacy", name: "Vie privée", value: 65 },
      { id: "association", name: "Liberté d’association", value: 70 },
    ],
  },
  {
    id: "admin",
    name: "Simplicité administrative",
    description: "Lisibilité des règles, rapidité, faible charge réglementaire.",
    subs: [
      { id: "paperwork", name: "Démarches", value: 60 },
      { id: "rules", name: "Lisibilité des règles", value: 55 },
      { id: "speed", name: "Rapidité administrative", value: 50 },
    ],
  },
];

const impactDocumentation = [
  {
    source: "Contribution publique",
    target: "Économie productive",
    coefficient: "-1.25",
    example: "+25 → -31",
  },
  {
    source: "Contribution publique",
    target: "Simplicité administrative",
    coefficient: "-0.65",
    example: "+25 → -16",
  },
  {
    source: "Contribution publique",
    target: "Accompagnement social",
    coefficient: "+0.65",
    example: "+25 → +16",
  },
  {
    source: "Accompagnement social",
    target: "Contribution publique",
    coefficient: "+0.70",
    example: "+25 → +18",
  },
  {
    source: "Accompagnement social",
    target: "Économie productive",
    coefficient: "-0.65",
    example: "+25 → -16",
  },
  {
    source: "Sécurité et justice",
    target: "Libertés civiles",
    coefficient: "-0.75",
    example: "+25 → -19",
  },
  {
    source: "Libertés civiles",
    target: "Économie productive",
    coefficient: "+0.30",
    example: "+25 → +8",
  },
  {
    source: "Économie productive",
    target: "Contribution publique",
    coefficient: "-0.45",
    example: "+25 → -11",
  },
  {
    source: "Simplicité administrative",
    target: "Économie productive",
    coefficient: "+0.75",
    example: "+25 → +19",
  },
];

const countryModels = [
  {
    id: "france",
    name: "France",
    flag: "fr",
    values: {
      business: 40,
      competition: 35,
      investment: 35,
      incomeTax: 75,
      companyTax: 75,
      localTax: 70,
      health: 85,
      housing: 70,
      unemployment: 75,
      retirement: 85,
      police: 65,
      sentences: 55,
      justiceSpeed: 35,
      speech: 70,
      privacy: 65,
      association: 75,
      paperwork: 35,
      rules: 35,
      speed: 30,
    },
  },
  {
    id: "switzerland",
    name: "Suisse",
    flag: "ch",
    values: {
      business: 85,
      competition: 80,
      investment: 85,
      incomeTax: 45,
      companyTax: 45,
      localTax: 55,
      health: 65,
      housing: 45,
      unemployment: 45,
      retirement: 55,
      police: 70,
      sentences: 60,
      justiceSpeed: 75,
      speech: 85,
      privacy: 85,
      association: 85,
      paperwork: 75,
      rules: 75,
      speed: 75,
    },
  },
  {
    id: "sweden",
    name: "Suède",
    flag: "se",
    values: {
      business: 70,
      competition: 70,
      investment: 65,
      incomeTax: 80,
      companyTax: 60,
      localTax: 75,
      health: 85,
      housing: 70,
      unemployment: 75,
      retirement: 80,
      police: 70,
      sentences: 55,
      justiceSpeed: 65,
      speech: 85,
      privacy: 80,
      association: 85,
      paperwork: 65,
      rules: 70,
      speed: 70,
    },
  },
  {
    id: "usa",
    name: "États-Unis",
    flag: "us",
    values: {
      business: 85,
      competition: 80,
      investment: 85,
      incomeTax: 45,
      companyTax: 45,
      localTax: 45,
      health: 40,
      housing: 35,
      unemployment: 35,
      retirement: 45,
      police: 75,
      sentences: 85,
      justiceSpeed: 55,
      speech: 90,
      privacy: 65,
      association: 85,
      paperwork: 65,
      rules: 60,
      speed: 60,
    },
  },
  {
    id: "finland",
    name: "Finlande",
    flag: "fi",
    values: {
      business: 70,
      competition: 70,
      investment: 65,
      incomeTax: 80,
      companyTax: 60,
      localTax: 75,
      health: 85,
      housing: 70,
      unemployment: 75,
      retirement: 80,
      police: 75,
      sentences: 60,
      justiceSpeed: 70,
      speech: 85,
      privacy: 80,
      association: 85,
      paperwork: 70,
      rules: 75,
      speed: 75,
    },
  },
];

type Category = typeof initialCategories[number];
type Country = typeof countryModels[number];

function average(values: number[]) {
  return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, value));
}

function getCountryDistance(categories: typeof initialCategories, model: Country) {
  const currentValues = categories.flatMap((cat) => cat.subs);

  const total = currentValues.reduce((sum, sub) => {
    const modelValue = model.values[sub.id as keyof typeof model.values] ?? 50;
    return sum + Math.abs(sub.value - modelValue);
  }, 0);

  return Math.round(total / currentValues.length);
}

function getClosestCountry(categories: typeof initialCategories) {
  return countryModels
    .map((country) => ({
      ...country,
      distance: getCountryDistance(categories, country),
    }))
    .sort((a, b) => a.distance - b.distance)[0];
}

function FlagIcon({ code }: { code: string }) {
  return (
    <span className="relative inline-flex h-4 w-6 shrink-0 items-center justify-center overflow-hidden rounded-[2px] border border-black/10 bg-white">
      {code === "fr" && (
        <span className="grid h-full w-full grid-cols-3">
          <span className="bg-blue-700" />
          <span className="bg-white" />
          <span className="bg-red-600" />
        </span>
      )}

      {code === "us" && (
        <span className="relative block h-full w-full bg-white">
          <span className="absolute inset-0 bg-[repeating-linear-gradient(to_bottom,#dc2626_0px,#dc2626_2px,#ffffff_2px,#ffffff_4px)]" />
          <span className="absolute left-0 top-0 h-[54%] w-[45%] bg-blue-800" />
        </span>
      )}

      {code === "ch" && (
        <span className="relative block h-4 w-4 bg-red-600">
          <span className="absolute left-1/2 top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 bg-white" />
          <span className="absolute left-1/2 top-1/2 h-1 w-3 -translate-x-1/2 -translate-y-1/2 bg-white" />
        </span>
      )}

      {code === "se" && (
        <span className="relative block h-full w-full bg-blue-700">
          <span className="absolute left-[32%] top-0 h-full w-1 bg-yellow-300" />
          <span className="absolute left-0 top-[42%] h-1 w-full bg-yellow-300" />
        </span>
      )}

      {code === "fi" && (
        <span className="relative block h-full w-full bg-white">
          <span className="absolute left-[32%] top-0 h-full w-1 bg-blue-700" />
          <span className="absolute left-0 top-[42%] h-1 w-full bg-blue-700" />
        </span>
      )}
    </span>
  );
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
        className="relative flex h-8 w-full touch-pan-y items-center"
      >
        <Slider.Track className="relative h-2 w-full rounded-[6px] bg-neutral-200">
          <Slider.Range className="absolute h-full rounded-[6px] bg-black" />
        </Slider.Track>
        <Slider.Thumb className="block h-6 w-6 rounded-[6px] bg-black shadow-md outline-none transition-transform active:scale-95 sm:h-5 sm:w-5" />
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

function MobileDialogContent({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="fixed inset-0 z-40 bg-black/30" />
      <Dialog.Content className="fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[16px] bg-white p-5 shadow-2xl sm:left-1/2 sm:top-1/2 sm:bottom-auto sm:w-[92vw] sm:max-w-3xl sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-[6px] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-4">
          <Dialog.Title className="text-xl font-semibold sm:text-2xl">
            {title}
          </Dialog.Title>
          <Dialog.Close className="rounded-[6px] p-2 text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900">
            <X size={18} />
          </Dialog.Close>
        </div>
        {children}
      </Dialog.Content>
    </Dialog.Portal>
  );
}

export default function Home() {
  const [screen, setScreen] = useState<"intro" | "game" | "result">("intro");
  const [categories, setCategories] = useState(initialCategories);
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(
    null
  );
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
      { subject: "Liberté économique", value: get("market") },
      {
        subject: "Cadre",
        value: average([get("security"), get("admin")]),
      },
      { subject: "Protection", value: get("support") },
      { subject: "Simplicité", value: get("admin") },
      { subject: "Dynamisme", value: get("market") },
      {
        subject: "Responsabilité",
        value: average([get("tax"), get("security")]),
      },
    ];
  }, [categoryScores]);

  const closestCountry = useMemo(
    () => getClosestCountry(categories),
    [categories]
  );

  const profileName = useMemo(() => {
    const economicFreedom =
      radarData.find((d) => d.subject === "Liberté économique")?.value ?? 50;
    const frame = radarData.find((d) => d.subject === "Cadre")?.value ?? 50;
    const protection =
      radarData.find((d) => d.subject === "Protection")?.value ?? 50;

    if (protection >= 70 && frame >= 60) return "Protecteur structuré";
    if (economicFreedom >= 70 && frame >= 60) return "Libéral cadré";
    if (economicFreedom >= 70 && frame < 45) return "Libéral dérégulé";
    if (frame >= 75) return "Ordre renforcé";
    return "Équilibriste pragmatique";
  }, [radarData]);

  function getCategoryAverage(next: Category[], id: string) {
    return average(
      next.find((cat) => cat.id === id)?.subs.map((sub) => sub.value) ?? [50]
    );
  }

  function applySystemCaps(next: Category[], categoryId: string, newValue: number) {
    const taxScore = getCategoryAverage(next, "tax");
    const supportScore = getCategoryAverage(next, "support");
    const securityScore = getCategoryAverage(next, "security");

    const isTaxExtreme = categoryId === "tax" && newValue >= 75;
    const isTaxMax = categoryId === "tax" && newValue >= 100;

    return next.map((cat) => {
      if ((isTaxMax || taxScore >= 90) && cat.id === "market") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, sub.id === "competition" ? 20 : 25),
          })),
        };
      }

      if ((isTaxExtreme || taxScore >= 75) && cat.id === "market") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, sub.id === "competition" ? 35 : 40),
          })),
        };
      }

      if ((isTaxExtreme || taxScore >= 75) && cat.id === "admin") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 45),
          })),
        };
      }

      if ((isTaxExtreme || taxScore >= 75) && cat.id === "freedoms") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 55),
          })),
        };
      }

      if (supportScore >= 75 && cat.id === "tax") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.max(sub.value, 65),
          })),
        };
      }

      if (securityScore >= 75 && cat.id === "freedoms") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 45),
          })),
        };
      }

      return cat;
    });
  }

  function applyImpactToCategories(
    currentCategories: Category[],
    categoryId: string,
    subId: string,
    newValue: number,
    delta: number
  ) {
    const impactMap: Record<string, Record<string, number>> = {
      tax: {
        market: -1.25,
        admin: -0.65,
        support: 0.65,
        security: 0.15,
        freedoms: -0.35,
      },
      support: {
        tax: 0.7,
        admin: -0.45,
        market: -0.65,
        security: 0.1,
        freedoms: -0.15,
      },
      security: {
        freedoms: -0.75,
        admin: -0.25,
        tax: 0.2,
      },
      freedoms: {
        security: -0.3,
        market: 0.3,
        admin: 0.2,
      },
      market: {
        tax: -0.45,
        support: -0.35,
        admin: 0.4,
        freedoms: 0.2,
      },
      admin: {
        market: 0.75,
        support: -0.35,
        security: 0.2,
        tax: -0.3,
      },
    };

    const next = currentCategories.map((cat) => ({
      ...cat,
      subs: cat.subs.map((sub) => {
        if (cat.id === categoryId && sub.id === subId) {
          return { ...sub, value: newValue };
        }

        const influence = impactMap[categoryId]?.[cat.id] ?? 0;
        if (influence === 0) return sub;

        return {
          ...sub,
          value: clamp(Math.round(sub.value + delta * influence)),
        };
      }),
    }));

    return applySystemCaps(next, categoryId, newValue);
  }

  function applyCountryModel(countryId: string) {
    const model = countryModels.find((country) => country.id === countryId);
    if (!model) return;

    setSelectedCountryId(countryId);

    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        subs: cat.subs.map((sub) => ({
          ...sub,
          value: model.values[sub.id as keyof typeof model.values] ?? sub.value,
        })),
      }))
    );
  }

  function updateSub(categoryId: string, subId: string, newValue: number) {
    setSelectedCountryId(null);

    setCategories((prev) => {
      const currentCategory = prev.find((cat) => cat.id === categoryId);
      const currentSub = currentCategory?.subs.find((sub) => sub.id === subId);
      const oldValue = currentSub?.value ?? newValue;
      const delta = newValue - oldValue;

      return applyImpactToCategories(prev, categoryId, subId, newValue, delta);
    });
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
    <main className="min-h-screen bg-white text-neutral-950">
      {screen === "intro" && (
        <section className="mx-auto flex min-h-[100svh] max-w-5xl flex-col items-center justify-center px-5 py-10 text-center sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full space-y-8"
          >
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.35em] text-neutral-500 sm:text-sm">
                CIVIS
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-6xl md:text-7xl">
                Testez vos arbitrages.
              </h1>
              <p className="mx-auto max-w-xl text-base leading-relaxed text-neutral-600 sm:text-lg">
                Ajustez différents paramètres publics et observez l’équilibre
                qu’ils produisent.
              </p>
            </div>

            <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:items-center sm:justify-center">
              <button
                onClick={() => setScreen("game")}
                className="w-full rounded-[6px] bg-black px-6 py-4 text-white transition hover:bg-neutral-800 sm:w-auto sm:py-3"
              >
                Commencer
              </button>

              <Dialog.Root>
                <Dialog.Trigger className="w-full rounded-[6px] border border-neutral-300 bg-white px-5 py-4 text-neutral-800 transition hover:bg-neutral-100 sm:w-auto sm:py-3">
                  La démarche
                </Dialog.Trigger>

                <MobileDialogContent title="Comprendre Civis">
                  <Dialog.Description className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                    Chaque choix politique a des conséquences. Certaines sont visibles
                    immédiatement, d’autres apparaissent plus tard. Civis
                    visualise ces interactions et permet d’explorer différents
                    équilibres à travers une série de paramètres liés entre eux.
                  </Dialog.Description>
                </MobileDialogContent>
              </Dialog.Root>
            </div>
          </motion.div>
        </section>
      )}

      {screen === "game" && (
        <section className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 sm:py-10">
          <div className="sticky top-0 z-30 -mx-4 mb-5 border-b border-neutral-200 bg-white/95 px-4 py-4 backdrop-blur sm:static sm:mx-0 sm:mb-8 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 sm:text-sm">
                  CIVIS
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
                  Ajustez les paramètres
                </h1>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-600 sm:mt-3 sm:text-base">
                  Chaque curseur peut influencer d’autres paramètres.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Dialog.Root>
                  <Dialog.Trigger className="inline-flex items-center justify-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-4 py-3 text-sm text-neutral-800 transition hover:bg-neutral-100 sm:px-5">
                    <Info size={16} />
                    Comment ça marche
                  </Dialog.Trigger>

                  <MobileDialogContent title="Comment fonctionne Civis">
                    <Dialog.Description className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                      Civis est une simulation volontairement simplifiée. Elle ne
                      cherche pas à prédire précisément le réel, mais à rendre
                      visibles les répercussions possibles d’un choix politique
                      sur d’autres équilibres.
                    </Dialog.Description>

                    <div className="mt-5 overflow-x-auto rounded-[6px] border border-neutral-200">
                      <table className="min-w-[660px] w-full border-collapse text-left text-sm">
                        <thead className="bg-neutral-100 text-neutral-600">
                          <tr>
                            <th className="p-3 font-medium">Modifié</th>
                            <th className="p-3 font-medium">Impacté</th>
                            <th className="p-3 font-medium">Coef.</th>
                            <th className="p-3 font-medium">Exemple</th>
                          </tr>
                        </thead>
                        <tbody>
                          {impactDocumentation.map((row) => (
                            <tr
                              key={`${row.source}-${row.target}`}
                              className="border-t border-neutral-200"
                            >
                              <td className="p-3 font-medium">{row.source}</td>
                              <td className="p-3 text-neutral-600">
                                {row.target}
                              </td>
                              <td className="p-3 font-mono text-neutral-900">
                                {row.coefficient}
                              </td>
                              <td className="p-3 text-neutral-600">
                                {row.example}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 rounded-[6px] bg-neutral-100 p-4 text-sm leading-relaxed text-neutral-700">
                      Chaque décision politique est un arbitrage. Elle peut améliorer un aspect du système tout en fragilisant autre chose. Les modèles qui promettent un équilibre parfait doivent donc être regardés avec prudence. Pour toute suggestion d'amélioration, veuillez nous contacter à civis.simulation@gmail.com.
                    </div>
                  </MobileDialogContent>
                </Dialog.Root>

                <button
  onClick={() => setScreen("result")}
  className="rounded-[6px] bg-black px-4 py-3 text-sm text-white transition hover:bg-neutral-800 sm:px-5"
>
  Résultat
</button>
              </div>
            </div>
          </div>

          <div className="-mx-4 mb-5 overflow-x-auto px-4 sm:mx-0 sm:mb-6 sm:px-0">
            <div className="flex min-w-max gap-2">
              {countryModels.map((country) => {
                const isSelected = selectedCountryId === country.id;
                const isClosest =
                  !selectedCountryId &&
                  closestCountry.id === country.id &&
                  closestCountry.distance <= 6;

                return (
                  <button
                    key={country.id}
                    onClick={() => applyCountryModel(country.id)}
                    className={`inline-flex items-center gap-2 rounded-[6px] border px-3 py-2 text-sm transition ${
                      isSelected || isClosest
                        ? "border-black bg-black text-white"
                        : "border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100"
                    }`}
                  >
                    <FlagIcon code={country.flag} />
                    {country.name}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.flatMap((cat) =>
              cat.subs.map((sub) => (
                <motion.div
                  key={sub.id}
                  layout
                  className="rounded-[6px] border border-neutral-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold">{sub.name}</h2>
                      <p className="mt-1 truncate text-xs text-neutral-500">
                        {cat.name}
                      </p>
                    </div>

                    <span className="rounded-[6px] bg-neutral-100 px-2 py-1 text-xs font-medium text-neutral-700">
                      {sub.value}
                    </span>
                  </div>

                  <StepSlider
                    value={sub.value}
                    onChange={(v) => updateSub(cat.id, sub.id, v)}
                  />
                </motion.div>
              ))
            )}
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 p-4 backdrop-blur sm:hidden">
            <button
              onClick={() => setScreen("result")}
              className="w-full rounded-[6px] bg-black px-5 py-4 text-white"
            >
              Voir le résultat
            </button>
          </div>
        </section>
      )}

      {screen === "result" && (
        <section className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
          <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 sm:text-sm">
                Résultat
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:mt-3 sm:text-4xl">
                Votre équilibre Civis
              </h1>
            </div>

            <button
              onClick={() => setScreen("game")}
              className="w-full rounded-[6px] border border-neutral-300 bg-white px-5 py-3 transition hover:bg-neutral-100 sm:w-auto"
            >
              Modifier
            </button>
          </div>

          <div className="grid gap-5 lg:grid-cols-[1fr_420px]">
            <div className="rounded-[6px] border border-neutral-200 bg-white p-4 shadow-sm sm:p-6">
              <h2 className="text-lg font-semibold sm:text-xl">
                Radar d’équilibre
              </h2>
              <div className="mt-4 h-[300px] sm:mt-6 sm:h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                    <Radar
                      dataKey="value"
                      fill="#111"
                      fillOpacity={0.22}
                      stroke="#111"
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div
                ref={cardRef}
                className="rounded-[6px] bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-600 p-6 text-white shadow-xl sm:p-8"
              >
                <p className="text-xs uppercase tracking-[0.35em] text-white/60 sm:text-sm">
                  CIVIS
                </p>
                <h2 className="mt-8 text-3xl font-semibold sm:mt-10 sm:text-4xl">
                  {profileName}
                </h2>

                <div className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-white/10 px-3 py-2 text-sm text-white/80">
                  <FlagIcon code={closestCountry.flag} />
                  Proche : {closestCountry.name}
                </div>

                <p className="mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
                  Un modèle construit autour de compromis entre liberté
                  économique, cadre, protection et responsabilité.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-4 sm:mt-10">
                  {radarData.slice(0, 4).map((item) => (
                    <div key={item.subject}>
                      <p className="text-2xl font-semibold sm:text-3xl">
                        {item.value}
                      </p>
                      <p className="text-xs text-white/60 sm:text-sm">
                        {item.subject}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <Dialog.Root>
                <Dialog.Trigger className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-5 py-3 text-neutral-800 transition hover:bg-neutral-100">
                  Comparer avec {closestCountry.name}
                </Dialog.Trigger>

                <MobileDialogContent title={`Comparaison avec ${closestCountry.name}`}>
                  <Dialog.Description className="text-sm leading-relaxed text-neutral-600 sm:text-base">
                    Cette comparaison mesure l’écart moyen entre vos curseurs et
                    le modèle simplifié du pays sélectionné.
                  </Dialog.Description>

                  <div className="mt-5 overflow-x-auto rounded-[6px] border border-neutral-200">
                    <table className="min-w-[620px] w-full border-collapse text-left text-sm">
                      <thead className="bg-neutral-100 text-neutral-600">
                        <tr>
                          <th className="p-3 font-medium">Paramètre</th>
                          <th className="p-3 font-medium">Votre modèle</th>
                          <th className="p-3 font-medium">
                            {closestCountry.name}
                          </th>
                          <th className="p-3 font-medium">Écart</th>
                        </tr>
                      </thead>
                      <tbody>
                        {categories.flatMap((cat) =>
                          cat.subs.map((sub) => {
                            const countryValue =
                              closestCountry.values[
                                sub.id as keyof typeof closestCountry.values
                              ] ?? 50;
                            const diff = Math.abs(sub.value - countryValue);

                            return (
                              <tr
                                key={sub.id}
                                className="border-t border-neutral-200"
                              >
                                <td className="p-3 font-medium">{sub.name}</td>
                                <td className="p-3 text-neutral-600">
                                  {sub.value}
                                </td>
                                <td className="p-3 text-neutral-600">
                                  {countryValue}
                                </td>
                                <td className="p-3 text-neutral-900">{diff}</td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </MobileDialogContent>
              </Dialog.Root>

              <button
                onClick={downloadCard}
                className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] bg-black px-5 py-3 text-white transition hover:bg-neutral-800"
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