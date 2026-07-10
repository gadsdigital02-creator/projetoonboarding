"use client";

import { useEffect, useMemo, useState } from "react";
import { assets, commercialFields, companyFields, journey, slides, statuses } from "../data";
import { DRIVE_INTEGRATION } from "../integration";

type Access = { status: string; id: string; note: string };
type Session = { company: Record<string, string>; commercial: Record<string, string>; audiences: string[]; access: Record<string, Access>; finalized?: string };
const STORAGE_KEY = "gads-onboarding-v1";
const blankSession: Session = { company: {}, commercial: {}, audiences: [], access: Object.fromEntries(assets.map((a) => [a, { status: "Pendente", id: "", note: "" }])) };

export function OnboardingPresentation() {
  const [index, setIndex] = useState(0);
  const [modal, setModal] = useState(false);
  const [tab, setTab] = useState<"company" | "access" | "summary">("company");
  const [session, setSession] = useState<Session>(blankSession);
  const [saved, setSaved] = useState(false);
  const [syncStatus, setSyncStatus] = useState<"idle" | "sending" | "sent" | "error" | "unconfigured">("idle");

  useEffect(() => { try { const data = localStorage.getItem(STORAGE_KEY); if (data) { const saved = JSON.parse(data); const normalizedAccess = Object.fromEntries(assets.map((asset) => [asset, saved.access?.[asset] || blankSession.access[asset]])); setSession({ ...blankSession, ...saved, access: normalizedAccess }); } } catch {} }, []);
  useEffect(() => { const id = setTimeout(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(session)); setSaved(true); setTimeout(() => setSaved(false), 1200); }, 250); return () => clearTimeout(id); }, [session]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === "Escape") setModal(false); if (!modal && e.key === "ArrowRight") setIndex((v) => Math.min(9, v + 1)); if (!modal && e.key === "ArrowLeft") setIndex((v) => Math.max(0, v - 1)); };
    addEventListener("keydown", key); return () => removeEventListener("keydown", key);
  }, [modal]);

  const received = assets.filter((a) => ["Recebido", "Não se aplica"].includes(session.access[a]?.status)).length;
  const progress = (index + 1) * 10;
  const journeyIndex = Math.min(4, Math.floor(index / 2));
  const essentialMissing = companyFields.filter((f) => f[2] && !session.company[f[0]]).map((f) => f[1]);
  const pending = assets.filter((a) => !["Recebido", "Não se aplica"].includes(session.access[a]?.status));

  const updateField = (area: "company" | "commercial", key: string, value: string) => setSession((s) => ({ ...s, [area]: { ...s[area], [key]: value } }));
  const updateAccess = (asset: string, key: keyof Access, value: string) => setSession((s) => ({ ...s, access: { ...s.access, [asset]: { ...s.access[asset], [key]: value } } }));
  const exportJson = () => { const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), ...session }, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `onboarding-gads-${session.company.storeName || "cliente"}.json`; a.click(); URL.revokeObjectURL(url); };
  const finish = async () => {
    setTab("summary");
    if (essentialMissing.length) return;
    if (!DRIVE_INTEGRATION.SCRIPT_URL) { setSyncStatus("unconfigured"); return; }
    setSyncStatus("sending");
    try {
      await fetch(DRIVE_INTEGRATION.SCRIPT_URL, {
        method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ token: DRIVE_INTEGRATION.TOKEN, session }),
      });
      setSession((s) => ({ ...s, finalized: new Date().toISOString() }));
      setSyncStatus("sent");
    } catch { setSyncStatus("error"); }
  };

  return <main className="app-shell">
    <SidebarJourney current={journeyIndex} progress={progress} received={received} />
    <section className="stage">
      <header className="topbar">
        <Brand />
        <div className="top-actions"><span className={`save-state ${saved ? "visible" : ""}`}>✓ salvo automaticamente</span><button className="access-button" onClick={() => setModal(true)}>COLETAR ACESSOS <b>{received}/{assets.length}</b></button></div>
      </header>
      <SlideLayout slide={slides[index]} index={index} />
      <NavigationControls index={index} progress={progress} onChange={setIndex} />
    </section>
    {modal && <AccessCollectionModal session={session} tab={tab} setTab={setTab} close={() => setModal(false)} updateField={updateField} updateAccess={updateAccess} setSession={setSession} received={received} missing={essentialMissing} pending={pending} finish={finish} exportJson={exportJson} syncStatus={syncStatus} />}
  </main>;
}

function Brand() { return <div className="brand"><img src="/gads-brand.png" alt="GADS Assessoria e Negócios Digitais" /><span>ONBOARDING</span></div>; }

function SidebarJourney({ current, progress, received }: { current: number; progress: number; received: number }) {
  return <aside className="sidebar"><Brand /><div className="journey-heading"><span>JORNADA DO CLIENTE</span><b>{progress}%</b></div><div className="journey-progress"><i style={{ height: `${progress}%` }} /></div><nav>{journey.map((item, i) => <div key={item[0]} className={`journey-item ${i === current ? "active" : ""} ${i < current ? "done" : ""}`}><span>{i < current ? "✓" : i + 1}</span><div><b>{item[0]}</b><small>{item[1]}</small></div></div>)}</nav><div className="sidebar-status"><span>ACESSOS RECEBIDOS</span><b>{received} <small>DE {assets.length}</small></b><div><i style={{ width: `${received / assets.length * 100}%` }} /></div></div></aside>;
}

function SlideLayout({ slide, index }: { slide: any; index: number }) {
  return <article className={`slide kind-${slide.kind} slide-${index + 1}`} key={index}><div className="slide-no">{String(index + 1).padStart(2, "0")}</div><p className="eyebrow">{slide.eyebrow}</p><h1>{slide.title}</h1>{slide.subtitle && <p className="subtitle">{slide.subtitle}</p>}<SlideContent slide={slide} />{slide.footer && <p className="slide-footer">{slide.footer}</p>}{slide.quote && <blockquote>{slide.quote}</blockquote>}</article>;
}

function SlideContent({ slide }: { slide: any }) {
  if (slide.kind === "list") return <div className="tag-grid">{slide.items.map((x: string, i: number) => <div key={x}><span>{String(i + 1).padStart(2, "0")}</span>{x}</div>)}</div>;
  if (slide.kind === "metrics") return <div className="metric-grid">{slide.items.map((x: string, i: number) => <MetricCard key={x} n={i + 1} label={x} />)}</div>;
  if (slide.kind === "columns" || slide.kind === "comparison") return <div className={`content-grid ${slide.kind}`}>{slide.columns.map((col: string[], i: number) => <ComparisonCard key={col[0]} title={col[0]} items={col.slice(1)} tone={i} arrows={slide.kind === "comparison"} />)}</div>;
  return <div className={`content-grid ${slide.kind}`}>{slide.cards.map((card: string[], i: number) => <div className="feature-card" key={card[0]}><span className="card-index">0{i + 1}</span><h3>{card[0]}</h3><p>{card[1]}</p></div>)}</div>;
}

function MetricCard({ n, label }: { n: number; label: string }) { return <div className="metric-card"><b>{String(n).padStart(2, "0")}</b><span>{label}</span></div>; }
function ComparisonCard({ title, items, tone, arrows }: { title: string; items: string[]; tone: number; arrows: boolean }) { return <div className={`comparison-card tone-${tone}`}><h3>{title}</h3>{items.map((x, i) => <div className="flow-item" key={x}><span>{i + 1}</span><p>{x}</p>{arrows && i < items.length - 1 && <i>↓</i>}</div>)}</div>; }

function NavigationControls({ index, progress, onChange }: { index: number; progress: number; onChange: (n: number) => void }) {
  return <footer className="navigation"><button disabled={index === 0} onClick={() => onChange(index - 1)} aria-label="Slide anterior">←</button><div className="nav-progress"><span><b>{String(index + 1).padStart(2, "0")}</b> / 10</span><div><i style={{ width: `${progress}%` }} /></div></div><button disabled={index === 9} onClick={() => onChange(index + 1)} aria-label="Próximo slide">→</button></footer>;
}

function AccessCollectionModal(props: any) {
  const { session, tab, setTab, close, updateField, updateAccess, setSession, received, missing, pending, finish, exportJson, syncStatus } = props;
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><section className="modal"><header><div><p className="eyebrow">CENTRAL DE ONBOARDING</p><h2>Coleta de informações e acessos</h2></div><div className="modal-progress"><b>{received} de {assets.length}</b><span>acessos recebidos</span><div><i style={{ width: `${received / assets.length * 100}%` }} /></div></div><button className="close" onClick={close} aria-label="Fechar">×</button></header><nav className="tabs"><button className={tab === "company" ? "active" : ""} onClick={() => setTab("company")}>01 • EMPRESA</button><button className={tab === "access" ? "active" : ""} onClick={() => setTab("access")}>02 • ACESSOS</button><button className={tab === "summary" ? "active" : ""} onClick={() => setTab("summary")}>03 • RESUMO</button></nav><div className="modal-body">
    {tab === "company" && <><FormSection title="DADOS DA EMPRESA" fields={companyFields} values={session.company} change={(k: string, v: string) => updateField("company", k, v)} /><FormSection title="INFORMAÇÕES COMERCIAIS" fields={commercialFields} values={session.commercial} change={(k: string, v: string) => updateField("commercial", k, v)} /></>}
    {tab === "access" && <div className="access-grid">{assets.map((a, i) => <AccessCard key={a} index={i} asset={a} data={session.access[a]} update={(k: keyof Access, v: string) => updateAccess(a, k, v)} />)}</div>}
    {tab === "summary" && <OnboardingSummary session={session} missing={missing} pending={pending} syncStatus={syncStatus} />}
  </div><footer><span>✓ Dados salvos automaticamente neste dispositivo</span><div><button className="secondary" onClick={exportJson}>EXPORTAR RESUMO</button><button className="primary" onClick={finish} disabled={syncStatus === "sending"}>{syncStatus === "sending" ? "ENVIANDO AO DRIVE..." : "FINALIZAR ONBOARDING"}</button></div></footer></section></div>;
}

function FormSection({ title, fields, values, change }: any) { return <section className="form-section"><h3>{title}</h3><div className="form-grid">{fields.map((f: any) => <label key={f[0]} className={f[3] === "textarea" ? "wide" : ""}><span>{f[1]}{f[2] && <em>*</em>}</span>{f[3] === "textarea" ? <textarea value={values[f[0]] || ""} onChange={(e) => change(f[0], e.target.value)} /> : <input value={values[f[0]] || ""} onChange={(e) => change(f[0], e.target.value)} />}</label>)}</div></section>; }

function AccessCard({ asset, data, update, index }: { asset: string; data: Access; update: (k: keyof Access, v: string) => void; index: number }) { const help: Record<string, string> = { "Perfil da Empresa no Google": "Adicionar a GADS como administradora no Perfil da Empresa.", "Google Ads": "Enviar o ID de 10 dígitos da conta para solicitação de vínculo." }; return <article className={`access-card status-${data.status.toLowerCase().replaceAll(" ", "-").normalize("NFD").replace(/[\u0300-\u036f]/g, "")}`}><div className="access-head"><span>{String(index + 1).padStart(2, "0")}</span><h3>{asset}</h3></div><label>Status<select value={data.status} onChange={(e) => update("status", e.target.value)}>{statuses.map((s) => <option key={s}>{s}</option>)}</select></label><label>E-mail ou ID<input value={data.id} onChange={(e) => update("id", e.target.value)} placeholder="Identificação do ativo" /></label><label>Observação<input value={data.note} onChange={(e) => update("note", e.target.value)} placeholder="Detalhes importantes" /></label>{help[asset] && <details><summary>Como conceder acesso?</summary><p>{help[asset]}</p></details>}</article>; }

function OnboardingSummary({ session, missing, pending, syncStatus }: { session: Session; missing: string[]; pending: string[]; syncStatus: string }) { const messages: Record<string,string> = { sent: "✓ Pasta do cliente criada e dados enviados ao Google Drive.", error: "Não foi possível enviar ao Drive. Os dados continuam salvos neste dispositivo.", unconfigured: "A conexão com o Google Drive ainda precisa ser publicada no Apps Script.", sending: "Criando a pasta do cliente no Google Drive..." }; return <div className="summary"><div className="summary-hero"><span>{session.finalized ? "ONBOARDING FINALIZADO" : "REVISÃO FINAL"}</span><h3>{session.company.storeName || "Cliente ainda não identificado"}</h3><p>{session.company.city || "Cidade não informada"} • {session.company.owner || "Responsável não informado"}</p></div>{messages[syncStatus] && <p className={`drive-message ${syncStatus}`}>{messages[syncStatus]}</p>}<div className="summary-grid"><article><h4>CAMPOS ESSENCIAIS</h4><b className={missing.length ? "warn" : "ok"}>{missing.length ? `${missing.length} pendente(s)` : "Tudo preenchido"}</b>{missing.map((x) => <p key={x}>• {x}</p>)}</article><article><h4>ACESSOS PENDENTES</h4><b className={pending.length ? "warn" : "ok"}>{pending.length ? `${pending.length} pendente(s)` : "Tudo recebido"}</b>{pending.map((x) => <p key={x}>• {x}</p>)}</article></div>{missing.length > 0 && <p className="validation-note">Preencha os campos essenciais marcados com * antes de confirmar a finalização.</p>}</div>; }
