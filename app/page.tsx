"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Slider from "@radix-ui/react-slider";
import { motion } from "framer-motion";
import { Download, Info } from "lucide-react";
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

const impactDocumentation = [
  {
    source: "Contribution publique",
    target: "Économie productive",
    coefficient: "-0.85",
    example: "+25 points → -21 points",
  },
  {
    source: "Contribution publique",
    target: "Accompagnement social",
    coefficient: "+0.55",
    example: "+25 points → +14 points",
  },
  {
    source: "Contribution publique",
    target: "Simplicité administrative",
    coefficient: "-0.45",
    example: "+25 points → -11 points",
  },
  {
    source: "Contribution publique",
    target: "Libertés civiles",
    coefficient: "-0.25",
    example: "+25 points → -6 points",
  },
  {
    source: "Accompagnement social",
    target: "Contribution publique",
    coefficient: "+0.50",
    example: "+25 points → +13 points",
  },
  {
    source: "Accompagnement social",
    target: "Économie productive",
    coefficient: "-0.45",
    example: "+25 points → -11 points",
  },
  {
    source: "Sécurité et justice",
    target: "Libertés civiles",
    coefficient: "-0.55",
    example: "+25 points → -14 points",
  },
  {
    source: "Libertés civiles",
    target: "Économie productive",
    coefficient: "+0.25",
    example: "+25 points → +6 points",
  },
  {
    source: "Économie productive",
    target: "Contribution publique",
    coefficient: "-0.35",
    example: "+25 points → -9 points",
  },
  {
    source: "Simplicité administrative",
    target: "Économie productive",
    coefficient: "+0.55",
    example: "+25 points → +14 points",
  },
];


const countryModels = [
  {
    id: "france",
    name: "France",
    flag: "fr",
    values: {
      business: 50,
      competition: 50,
      investment: 50,
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
      business: 75,
      competition: 75,
      investment: 70,
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
      business: 75,
      competition: 75,
      investment: 70,
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

function getCountryDistance(categories: typeof initialCategories, model: typeof countryModels[number]) {
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
  const flagClasses: Record<string, string> = {
    fr: "bg-gradient-to-r from-blue-700 via-white to-red-600",
    ch: "bg-red-600",
    se: "bg-blue-600",
    us: "bg-gradient-to-b from-red-600 via-white to-blue-700",
    fi: "bg-white",
  };

  return (
    <span
      className={`relative inline-block h-4 w-6 overflow-hidden rounded-[2px] border border-black/10 ${flagClasses[code]}`}
    >
      {code === "ch" && (
        <span className="absolute left-1/2 top-1/2 h-2.5 w-1 -translate-x-1/2 -translate-y-1/2 bg-white before:absolute before:left-1/2 before:top-1/2 before:h-1 before:w-3 before:-translate-x-1/2 before:-translate-y-1/2 before:bg-white" />
      )}
      {code === "se" && (
        <>
          <span className="absolute left-[32%] top-0 h-full w-1 bg-yellow-300" />
          <span className="absolute left-0 top-[42%] h-1 w-full bg-yellow-300" />
        </>
      )}
      {code === "fi" && (
        <>
          <span className="absolute left-[32%] top-0 h-full w-1 bg-blue-700" />
          <span className="absolute left-0 top-[42%] h-1 w-full bg-blue-700" />
        </>
      )}
    </span>
  );
}


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
        <Slider.Track className="relative h-2 w-full rounded-[6px] bg-neutral-200">
          <Slider.Range className="absolute h-full rounded-[6px] bg-black" />
        </Slider.Track>
        <Slider.Thumb className="block h-5 w-5 rounded-[6px] bg-black shadow-md outline-none transition-transform hover:scale-110 focus:ring-4 focus:ring-black/10" />
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
  const [selectedCountryId, setSelectedCountryId] = useState<string | null>(null);
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

  const closestCountry = useMemo(() => getClosestCountry(categories), [categories]);
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
  setSelectedCountryId(null);
  setCategories((prev) => {
    const currentCategory = prev.find((cat) => cat.id === categoryId);
    const currentSub = currentCategory?.subs.find((sub) => sub.id === subId);
    const oldValue = currentSub?.value ?? newValue;
    const delta = newValue - oldValue;

    const impactMap: Record<string, Record<string, number>> = {
      tax: {
        market: -0.85,
        admin: -0.45,
        support: 0.55,
        security: 0.1,
        freedoms: -0.25,
      },
      support: {
        tax: 0.5,
        admin: -0.35,
        market: -0.45,
        security: 0.05,
      },
      security: {
        freedoms: -0.55,
        admin: -0.2,
        tax: 0.15,
      },
      freedoms: {
        security: -0.25,
        market: 0.25,
        admin: 0.15,
      },
      market: {
        tax: -0.35,
        support: -0.25,
        admin: 0.3,
        freedoms: 0.15,
      },
      admin: {
        market: 0.55,
        support: -0.25,
        security: 0.15,
        tax: -0.2,
      },
    };

    const next = prev.map((cat) => ({
      ...cat,
      subs: cat.subs.map((sub) => {
        if (cat.id === categoryId && sub.id === subId) {
          return {
            ...sub,
            value: newValue,
          };
        }

        const influence = impactMap[categoryId]?.[cat.id] ?? 0;

        if (influence === 0) {
          return sub;
        }

        return {
          ...sub,
          value: clamp(
            Math.round(sub.value + delta * influence)
          ),
        };
      }),
    }));

    return next.map((cat) => {
      const taxScore =
        average(
          next
            .find((c) => c.id === "tax")
            ?.subs.map((s) => s.value) ?? [50]
        );

      const supportScore =
        average(
          next
            .find((c) => c.id === "support")
            ?.subs.map((s) => s.value) ?? [50]
        );

      const securityScore =
        average(
          next
            .find((c) => c.id === "security")
            ?.subs.map((s) => s.value) ?? [50]
        );

      if (taxScore >= 75 && cat.id === "market") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 50),
          })),
        };
      }

      if (taxScore >= 100 && cat.id === "market") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 25),
          })),
        };
      }

      if (supportScore >= 75 && cat.id === "tax") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.max(sub.value, 60),
          })),
        };
      }

      if (securityScore >= 75 && cat.id === "freedoms") {
        return {
          ...cat,
          subs: cat.subs.map((sub) => ({
            ...sub,
            value: Math.min(sub.value, 50),
          })),
        };
      }

      return cat;
    });
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
                className="rounded-[6px] bg-black px-6 py-3 text-white transition hover:bg-neutral-800"
              >
                Commencer
              </button>

              <Dialog.Root>
                <Dialog.Trigger className="inline-flex items-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-5 py-3 text-neutral-800 transition hover:bg-neutral-100">
                  La démarche
                </Dialog.Trigger>
                <Dialog.Portal>
                  <Dialog.Overlay className="fixed inset-0 bg-black/30" />
                  <Dialog.Content className="fixed left-1/2 top-1/2 w-[90vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[6px] bg-white p-6 shadow-xl">
                    <Dialog.Title className="text-xl font-semibold">
                      Comprendre Civis
                    </Dialog.Title>
                    <Dialog.Description className="mt-4 text-neutral-600">
                      Chaque choix a des conséquences. Certaines sont visibles
                      immédiatement, d’autres apparaissent plus tard. Civis
                      visualise ces interactions et permet d’explorer différents
                      équilibres à travers une série de paramètres liés entre eux. Vous pourrez découvrir la méthode de calcul lors de l'étape suivante.
                    </Dialog.Description>
                  </Dialog.Content>
                </Dialog.Portal>
              </Dialog.Root>
            </div>
          </motion.div>
        </section>
      )}

{screen === "game" && (
  <section className="mx-auto max-w-6xl px-6 py-10">
    <div className="mb-8 flex items-end justify-between gap-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-neutral-500">
          CIVIS
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Ajustez les paramètres
        </h1>
        <p className="mt-3 max-w-xl text-neutral-600">
          Chaque curseur peut influencer d’autres paramètres. L’équilibre se
          construit par répercussion.
        </p>
      </div>

            <div className="flex items-center gap-3">
        <Dialog.Root>
          <Dialog.Trigger className="inline-flex items-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-5 py-3 text-neutral-800 transition hover:bg-neutral-100">
            <Info size={16} />
            Comment ça marche
          </Dialog.Trigger>

          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/30" />
            <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[6px] bg-white p-6 shadow-xl">
              <Dialog.Title className="text-2xl font-semibold">
                Comment fonctionne Civis
              </Dialog.Title>

              <Dialog.Description className="mt-3 text-neutral-600">
                Civis est une simulation volontairement simplifiée. Elle ne cherche pas à prédire précisément le réel, mais à rendre visibles les répercussions possibles d’un choix politique sur d’autres équilibres.
              </Dialog.Description>

              <div className="mt-6 overflow-hidden rounded-[6px] border border-neutral-200">
                <table className="w-full border-collapse text-left text-sm">
  <thead className="bg-neutral-100 text-neutral-600">
    <tr>
      <th className="p-3 font-medium">Paramètre modifié</th>
      <th className="p-3 font-medium">Paramètre impacté</th>
      <th className="p-3 font-medium">Coefficient</th>
      <th className="p-3 font-medium">Exemple</th>
    </tr>
  </thead>
  <tbody>
    {impactDocumentation.map((row) => (
      <tr key={`${row.source}-${row.target}`} className="border-t border-neutral-200">
        <td className="p-3 font-medium">{row.source}</td>
        <td className="p-3 text-neutral-600">{row.target}</td>
        <td className="p-3 font-mono text-neutral-900">{row.coefficient}</td>
        <td className="p-3 text-neutral-600">{row.example}</td>
      </tr>
    ))}
  </tbody>
</table>
              </div>

              <div className="mt-6 rounded-[6px] bg-neutral-100 p-4 text-sm text-neutral-700">
                Cette expérience sert surtout à rappeler que chaque décision politique est un arbitrage. Elle peut améliorer un aspect du système tout en fragilisant autre chose. Les modèles qui promettent un équilibre parfait doivent donc être regardés avec prudence. Choisir une direction politique, c’est accepter des priorités, des limites et des coûts. Pour toute suggestion d'amélioration de la méthode de calcul, veuillez nous envoyer un email à civis.simulation@gmail.com.

              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <button
          onClick={() => setScreen("result")}
          className="rounded-[6px] bg-black px-5 py-3 text-white transition hover:bg-neutral-800"
        >
          Voir le résultat
        </button>
      </div>
    </div>

    <div className="mb-6 flex flex-wrap gap-2">
      {countryModels.map((country) => {
        const isSelected = selectedCountryId === country.id;
        const isClosest = !selectedCountryId && closestCountry.id === country.id && closestCountry.distance <= 6;

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

    
    <div className="grid gap-3 md:grid-cols-2">
      {categories.flatMap((cat) =>
        cat.subs.map((sub) => (
          <motion.div
            key={sub.id}
            layout
            className="rounded-[6px] border border-neutral-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-sm font-semibold">{sub.name}</h2>
                <p className="mt-1 text-xs text-neutral-500">{cat.name}</p>
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
              className="rounded-[6px] border border-neutral-300 bg-white px-5 py-3 transition hover:bg-neutral-100"
            >
              Modifier
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
            <div className="rounded-[6px] border border-neutral-200 bg-white p-6 shadow-sm">
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
                className="rounded-[6px] bg-gradient-to-br from-neutral-950 via-neutral-800 to-neutral-600 p-8 text-white shadow-xl"
              >
                <p className="text-sm uppercase tracking-[0.35em] text-white/60">
                  CIVIS
                </p>
                <h2 className="mt-10 text-4xl font-semibold">{profileName}</h2>
                <div className="mt-4 inline-flex items-center gap-2 rounded-[6px] bg-white/10 px-3 py-2 text-sm text-white/80">
  <FlagIcon code={closestCountry.flag} />
  Modèle le plus proche : {closestCountry.name}
</div>
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


<Dialog.Root>
  <Dialog.Trigger className="inline-flex w-full items-center justify-center gap-2 rounded-[6px] border border-neutral-300 bg-white px-5 py-3 text-neutral-800 transition hover:bg-neutral-100">
    Comparer avec {closestCountry.name}
  </Dialog.Trigger>

  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/30" />
    <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[85vh] w-[92vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-[6px] bg-white p-6 shadow-xl">
      <Dialog.Title className="text-2xl font-semibold">
        Comparaison avec {closestCountry.name}
      </Dialog.Title>

      <Dialog.Description className="mt-3 text-neutral-600">
        Cette comparaison mesure l’écart moyen entre vos curseurs et le modèle simplifié du pays sélectionné.
      </Dialog.Description>

      <div className="mt-6 overflow-hidden rounded-[6px] border border-neutral-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-neutral-100 text-neutral-600">
            <tr>
              <th className="p-3 font-medium">Paramètre</th>
              <th className="p-3 font-medium">Votre modèle</th>
              <th className="p-3 font-medium">{closestCountry.name}</th>
              <th className="p-3 font-medium">Écart</th>
            </tr>
          </thead>
          <tbody>
            {categories.flatMap((cat) =>
              cat.subs.map((sub) => {
                const countryValue =
                  closestCountry.values[sub.id as keyof typeof closestCountry.values] ?? 50;
                const diff = Math.abs(sub.value - countryValue);

                return (
                  <tr key={sub.id} className="border-t border-neutral-200">
                    <td className="p-3 font-medium">{sub.name}</td>
                    <td className="p-3 text-neutral-600">{sub.value}</td>
                    <td className="p-3 text-neutral-600">{countryValue}</td>
                    <td className="p-3 text-neutral-900">{diff}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
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
