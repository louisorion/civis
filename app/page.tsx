'use client';

import * as Dialog from '@radix-ui/react-dialog';
import * as Accordion from '@radix-ui/react-accordion';
import * as Slider from '@radix-ui/react-slider';
import { motion, AnimatePresence } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { ChevronDown, Download, Info, RotateCcw, Sparkles } from 'lucide-react';
import { toPng } from 'html-to-image';
import { useMemo, useRef, useState } from 'react';

type Sub = { id:string; label:string; value:number };
type Cat = { id:string; label:string; hint:string; value:number; subs:Sub[] };
type Scores = Record<string, number>;

const initial: Cat[] = [
  { id:'eco', label:'Liberté économique', hint:'Entre initiative, concurrence et capacité d’action.', value:58, subs:[
    {id:'creation', label:'Création d’entreprise', value:64}, {id:'reglementation', label:'Réglementation marché', value:48}, {id:'concurrence', label:'Concurrence', value:62}
  ]},
  { id:'social', label:'Protection sociale', hint:'Le niveau de soutien collectif et ses contreparties.', value:55, subs:[
    {id:'sante', label:'Santé', value:68}, {id:'retraites', label:'Retraites', value:52}, {id:'chomage', label:'Chômage', value:45}
  ]},
  { id:'security', label:'Sécurité', hint:'Ordre public, sanctions et prévention.', value:62, subs:[
    {id:'police', label:'Présence terrain', value:64}, {id:'sanctions', label:'Sanctions', value:58}, {id:'prevention', label:'Prévention', value:64}
  ]},
  { id:'civil', label:'Libertés individuelles', hint:'Expression, vie privée, autonomie personnelle.', value:65, subs:[
    {id:'expression', label:'Expression', value:78}, {id:'privacy', label:'Vie privée', value:62}, {id:'autonomie', label:'Autonomie', value:55}
  ]},
  { id:'tax', label:'Fiscalité', hint:'Financement public, pression et lisibilité.', value:50, subs:[
    {id:'income', label:'Impôt revenu', value:48}, {id:'business', label:'Fiscalité entreprises', value:44}, {id:'simplicity', label:'Simplicité fiscale', value:58}
  ]},
];

const clamp = (n:number)=>Math.max(0,Math.min(100,Math.round(n)));
const avg = (arr:Sub[]) => clamp(arr.reduce((a,b)=>a+b.value,0)/arr.length);

function deriveScores(cats:Cat[]): Scores{
  const v = Object.fromEntries(cats.map(c=>[c.id,c.value]));
  return {
    Liberté: clamp((v.eco*0.35)+(v.civil*0.45)+(100-v.tax)*0.2),
    Ordre: clamp((v.security*0.55)+(v.social*0.15)+(100-v.civil)*0.1+(100-v.eco)*0.2),
    Solidarité: clamp((v.social*0.7)+(v.tax*0.2)+(v.security*0.1)),
    Croissance: clamp((v.eco*0.55)+(100-v.tax)*0.25+(v.civil*0.1)+(100-v.social)*0.1),
    Simplicité: clamp((100-v.tax)*0.35+(v.eco*0.25)+(100-v.social)*0.2+(v.civil*0.2)),
    Responsabilité: clamp((v.eco*0.35)+(100-v.social)*0.25+(v.security*0.2)+(v.civil*0.2)),
    Sécurité: clamp((v.security*0.65)+(v.social*0.2)+(100-v.civil)*0.15),
    Innovation: clamp((v.eco*0.45)+(v.civil*0.25)+(100-v.tax)*0.2+(100-v.social)*0.1),
  };
}

function profile(scores: Scores){
  const top = Object.entries(scores).sort((a,b)=>b[1]-a[1]).slice(0,3).map(([k])=>k);
  if(top.includes('Liberté') && top.includes('Ordre')) return {name:'Libéral cadré', line:'La liberté progresse dans un cadre lisible.'};
  if(top.includes('Solidarité') && top.includes('Sécurité')) return {name:'Protecteur structuré', line:'Le collectif sert de filet et de colonne vertébrale.'};
  if(top.includes('Croissance') && top.includes('Innovation')) return {name:'Accélérateur productif', line:'L’énergie est mise sur l’initiative et le mouvement.'};
  if(top.includes('Simplicité') && top.includes('Responsabilité')) return {name:'Minimaliste responsable', line:'Peu de règles, mais des conséquences claires.'};
  return {name:'Équilibriste civique', line:'Aucun axe ne domine totalement les autres.'};
}

export default function Page(){
  const [screen,setScreen]=useState<'intro'|'game'|'result'>('intro');
  const [cats,setCats]=useState(initial);
  const scores = useMemo(()=>deriveScores(cats),[cats]);
  const radarData = Object.entries(scores).map(([axis,value])=>({axis,value}));
  const p = profile(scores);
  const cardRef = useRef<HTMLDivElement>(null);

  function updateCat(id:string, value:number){
    setCats(prev=>prev.map(c=> c.id===id ? {...c,value,subs:c.subs.map(s=>({...s,value:clamp(s.value+(value-c.value))}))} : linked(c,id,value-c.value)));
  }
  function updateSub(catId:string, subId:string, value:number){
    setCats(prev=>prev.map(c=>{
      if(c.id!==catId) return c;
      const subs=c.subs.map(s=>s.id===subId?{...s,value}:s);
      return {...c,subs,value:avg(subs)};
    }).map(c=> linked(c,catId,0)));
  }
  function linked(c:Cat, movedId:string, delta:number){
    if(!delta) return c;
    const rel:Record<string,Record<string,number>>={
      social:{tax:.22, eco:-.09}, tax:{eco:-.15, social:.08}, eco:{tax:-.08, social:-.05}, security:{civil:-.08}, civil:{security:-.06}
    };
    const factor=rel[movedId]?.[c.id] ?? 0;
    if(!factor) return c;
    const value=clamp(c.value+delta*factor);
    return {...c,value,subs:c.subs.map(s=>({...s,value:clamp(s.value+delta*factor)}))};
  }
  async function download(){
    if(!cardRef.current) return;
    const dataUrl = await toPng(cardRef.current,{pixelRatio:2,cacheBust:true});
    const a=document.createElement('a'); a.href=dataUrl; a.download='civis-profil.png'; a.click();
  }

  return <main className="min-h-screen overflow-hidden bg-[#f7f7f4] text-neutral-950">
    <AnimatePresence mode="wait">
      {screen==='intro' && <motion.section key="intro" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-16}} className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-8 rounded-full border bg-white px-4 py-2 text-sm shadow-sm">Civis</div>
        <h1 className="max-w-3xl text-5xl font-semibold tracking-tight md:text-7xl">Explorez les conséquences de vos choix politiques</h1>
        <p className="mt-6 max-w-xl text-lg text-neutral-600">Construisez votre modèle et découvrez les équilibres qu’il produit.</p>
        <div className="mt-10 flex items-center gap-3">
          <button onClick={()=>setScreen('game')} className="rounded-full bg-neutral-950 px-6 py-3 text-white shadow-soft transition hover:scale-[1.02]">Commencer</button>
          <Dialog.Root><Dialog.Trigger className="inline-flex items-center gap-2 rounded-full border bg-white px-5 py-3"><Info size={18}/>Comprendre Civis</Dialog.Trigger><Dialog.Portal><Dialog.Overlay className="fixed inset-0 bg-black/30 backdrop-blur-sm"/><Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-3xl bg-white p-7 shadow-soft"><Dialog.Title className="text-2xl font-semibold">Comprendre Civis</Dialog.Title><Dialog.Description className="mt-4 text-neutral-600 leading-relaxed">Chaque choix a des conséquences. Certaines sont visibles immédiatement. D’autres apparaissent plus loin. Civis visualise ces interactions et permet d’explorer différents équilibres à travers une série de paramètres liés entre eux. Construisez votre modèle et observez ce qu’il produit.</Dialog.Description></Dialog.Content></Dialog.Portal></Dialog.Root>
        </div>
      </motion.section>}

      {screen==='game' && <motion.section key="game" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[1fr_.9fr]">
        <div className="rounded-[2rem] bg-white p-5 shadow-soft md:p-8"><div className="mb-6 flex items-center justify-between"><div><p className="text-sm uppercase tracking-[.25em] text-neutral-400">Civis</p><h2 className="text-3xl font-semibold">Construisez votre modèle</h2></div><button onClick={()=>setCats(initial)} className="rounded-full border p-3"><RotateCcw size={18}/></button></div>
          <Accordion.Root type="multiple" defaultValue={["eco"]} className="space-y-3">{cats.map(c=><Accordion.Item key={c.id} value={c.id} className="overflow-hidden rounded-2xl border bg-[#fbfbf8]"><Accordion.Header><Accordion.Trigger className="group flex w-full items-center justify-between p-4 text-left"><div><div className="font-semibold">{c.label}</div><div className="text-sm text-neutral-500">{c.hint}</div></div><ChevronDown className="transition group-data-[state=open]:rotate-180"/></Accordion.Trigger></Accordion.Header><Accordion.Content className="px-4 pb-5 data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up"><Slider.Root value={[c.value]} max={100} step={1} onValueChange={([v])=>updateCat(c.id,v)} className="relative my-4 flex h-5 touch-none items-center"><Slider.Track className="relative h-2 grow rounded-full bg-neutral-200"><Slider.Range className="absolute h-full rounded-full bg-neutral-950"/></Slider.Track><Slider.Thumb className="block h-5 w-5 rounded-full bg-neutral-950 shadow"/></Slider.Root><div className="mb-4 text-sm font-medium">Score global {c.value}</div><div className="space-y-4">{c.subs.map(s=><div key={s.id}><div className="mb-2 flex justify-between text-sm"><span>{s.label}</span><span className="text-neutral-500">{s.value}</span></div><Slider.Root value={[s.value]} max={100} step={1} onValueChange={([v])=>updateSub(c.id,s.id,v)} className="relative flex h-4 touch-none items-center"><Slider.Track className="relative h-1.5 grow rounded-full bg-neutral-200"><Slider.Range className="absolute h-full rounded-full bg-neutral-500"/></Slider.Track><Slider.Thumb className="block h-4 w-4 rounded-full bg-neutral-900"/></Slider.Root></div>)}</div></Accordion.Content></Accordion.Item>)}</Accordion.Root>
        </div>
        <div className="flex flex-col gap-6"><div className="rounded-[2rem] bg-white p-6 shadow-soft"><h3 className="mb-2 text-xl font-semibold">Radar en direct</h3><p className="text-sm text-neutral-500">Votre équilibre se dessine à mesure que les curseurs évoluent.</p><div className="h-[430px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid/><PolarAngleAxis dataKey="axis" tick={{fontSize:12}}/><Radar dataKey="value" stroke="#171717" fill="#171717" fillOpacity={0.18}/></RadarChart></ResponsiveContainer></div></div><button onClick={()=>setScreen('result')} className="rounded-full bg-neutral-950 py-4 text-white shadow-soft">Voir mon profil</button></div>
      </motion.section>}

      {screen==='result' && <motion.section key="result" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="mx-auto grid min-h-screen max-w-7xl gap-6 px-5 py-5 lg:grid-cols-[.9fr_1fr]">
        <div className="flex flex-col gap-4"><div ref={cardRef} className="relative aspect-[1.6] overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#ff385c] via-[#d31672] to-[#621bd1] p-8 text-white shadow-soft"><div className="noise"/><div className="relative z-10 flex h-full flex-col justify-between"><div><p className="text-sm font-semibold tracking-[.25em]">CIVIS</p><p className="mt-2 text-white/70">Profil généré</p></div><div><h2 className="text-5xl font-semibold tracking-tight">{p.name}</h2><p className="mt-4 max-w-md text-2xl text-white/85">{p.line}</p></div><div className="flex items-end justify-between"><p className="text-white/70">Modèle politique simulé</p><div className="rounded-2xl bg-white/15 px-4 py-3 backdrop-blur"><div className="text-3xl font-semibold">{clamp(Object.values(scores).reduce((a,b)=>a+b,0)/8)}</div><div className="text-xs text-white/70">équilibre</div></div></div></div></div><button onClick={download} className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-white"><Download size={18}/>Télécharger la carte</button><button onClick={()=>setScreen('game')} className="rounded-full border bg-white px-5 py-3">Modifier mes curseurs</button></div>
        <div className="rounded-[2rem] bg-white p-6 shadow-soft"><div className="mb-4 flex items-center gap-2"><Sparkles size={19}/><h3 className="text-2xl font-semibold">Résultat détaillé</h3></div><div className="h-[360px]"><ResponsiveContainer width="100%" height="100%"><RadarChart data={radarData}><PolarGrid/><PolarAngleAxis dataKey="axis" tick={{fontSize:12}}/><Radar dataKey="value" stroke="#171717" fill="#171717" fillOpacity={0.18}/></RadarChart></ResponsiveContainer></div><div className="grid gap-3 sm:grid-cols-2">{Object.entries(scores).map(([k,v])=><div key={k} className="rounded-2xl border bg-[#fbfbf8] p-4"><div className="text-3xl font-semibold">{v}</div><div className="text-neutral-500">{k}</div></div>)}</div></div>
      </motion.section>}
    </AnimatePresence>
  </main>
}
