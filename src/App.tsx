import React, { useEffect, useMemo, useRef, useState } from "react";

/** ---------- Types ---------- */
type MailTpl = "hr" | "invoice" | "cv" | "promo";
type MailRow = {
  id: string;
  unread?: boolean;
  attack: boolean;
  from: string;
  when: string;
  subj: string;
  prev: string;
  tpl: MailTpl;
  avatar: { txt: string; kind: "in" | "ex" | "toad" };
};

/** ---------- Demo data ---------- */
const INBOX: MailRow[] = [
  {
    id: "hr",
    unread: true,
    attack: false,
    from: "HR Team",
    when: "09:14",
    subj: "Holiday schedule update",
    prev: "Please review the 2025 holiday policy. No action required today.",
    tpl: "hr",
    avatar: { txt: "HR", kind: "in" },
  },
  {
    id: "msbill",
    unread: true,
    attack: true,
    from: "Microsoft 365 Billing",
    when: "08:02",
    subj: "Action required: Microsoft 365 subscription payment failed",
    prev: "We couldn’t process your latest payment. Review to prevent service disruption.",
    tpl: "invoice",
    avatar: { txt: "MS", kind: "ex" },
  },
  {
    id: "cv",
    unread: true,
    attack: true,
    from: "Anna McLean via OneDrive",
    when: "Mon",
    subj: "Application – Senior Account Manager (CV attached)",
    prev: "Sharing CV_Anna_McLean.docm for your review.",
    tpl: "cv",
    avatar: { txt: "AM", kind: "ex" },
  },
  {
    id: "promo",
    unread: false,
    attack: false,
    from: "The Art of D3fense",
    when: "Today",
    subj: "Book your phishing simulation now",
    prev: "Run a safe, tailored campaign. Quick setup, real impact.",
    tpl: "promo",
    avatar: { txt: "TD", kind: "toad" },
  },
];

const JUNK: MailRow[] = [
  {
    id: "junk1",
    attack: false,
    from: "Crypto Riches",
    when: "Yesterday",
    subj: "💰 Double your coins in 24h!",
    prev: "Limited offer. No risk.",
    tpl: "hr",
    avatar: { txt: "CR", kind: "ex" },
  },
  {
    id: "junk2",
    attack: false,
    from: "Lucky Draw",
    when: "Yesterday",
    subj: "🎁 You won a prize!",
    prev: "Claim within 2 hours to avoid forfeit.",
    tpl: "hr",
    avatar: { txt: "LD", kind: "ex" },
  },
  {
    id: "junk3",
    attack: false,
    from: "Microsoft 365",
    when: "Mon",
    subj: "Security update confirmation",
    prev: "Your security defaults are enabled.",
    tpl: "hr",
    avatar: { txt: "MS", kind: "ex" },
  },
];

/** ---------- Helpers ---------- */
const IntroKey = "toad_demo_intro_seen";

const Avatar: React.FC<{ txt: string; kind: "in" | "ex" | "toad" }> = ({
  txt,
  kind,
}) => {
  const base =
    "flex-none grid place-items-center w-9 h-9 rounded-full font-extrabold text-xs";
  const cls =
    kind === "in"
      ? "bg-emerald-100 text-emerald-800"
      : kind === "ex"
      ? "bg-blue-100 text-blue-700"
      : "bg-emerald-50 text-emerald-800";
  return <div className={`${base} ${cls}`}>{txt}</div>;
};

const Line: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <article className="flex gap-3 p-4 border-b border-slate-100 bg-white">
    {children}
  </article>
);

/** ---------- Main App ---------- */
export default function App() {
  const [tab, setTab] = useState<"inbox" | "junk">("inbox");
  const [rows, setRows] = useState(INBOX);
  const [showIntro, setShowIntro] = useState(
    typeof window !== "undefined" ? localStorage.getItem(IntroKey) !== "1" : true
  );

  // overlay state
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<MailRow | null>(null);

  // login modal state
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginOrigin, setLoginOrigin] = useState<"microsoft" | "onedrive">(
    "microsoft"
  );
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [cap, setCap] = useState("Start typing…");
  const [clipMsg, setClipMsg] = useState("");
  const [notice, setNotice] = useState(false);

  // impact panel values
  const [impact, setImpact] = useState({
    ip: "(blocked)",
    loc: "(unknown)",
    isp: "(unknown)",
    dev: "Unknown",
    br: "Browser",
    tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    scr: `${window.screen.width}×${window.screen.height}`,
  });

  // swipe to dismiss intro
  const startX = useRef<number>(0);
  const onTouchStart = (e: React.TouchEvent) =>
    (startX.current = e.changedTouches[0].screenX);
  const onTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].screenX - startX.current;
    if (dx < -50) setShowIntro(false);
  };

  // helpers
  const dismissIntro = (persist: boolean) => {
    if (persist) localStorage.setItem(IntroKey, "1");
    setShowIntro(false);
  };

  const list = useMemo(() => (tab === "inbox" ? rows : JUNK), [tab, rows]);

  function openMessage(r: MailRow) {
    // mark read
    if (r.unread) {
      setRows((old) => old.map((x) => (x.id === r.id ? { ...x, unread: false } : x)));
    }
    setActive(r);
    setOpen(true);
    if (r.attack) fetchImpact();
  }

  async function fetchImpact() {
    const ua = navigator.userAgent;
    const dev =
      /Windows|Mac|Linux|Android|iPhone|iPad/.exec(ua)?.[0] || "Unknown";
    const br = /Edg|Chrome|Firefox|Safari/.exec(ua)?.[0] || "Browser";
    let ip = "(blocked)",
      loc = "(unknown)",
      isp = "(unknown)";

    const sources = [
      "https://api.ipify.org?format=json",
      "https://api64.ipify.org?format=json",
      "https://ifconfig.co/json",
    ];

    for (const u of sources) {
      try {
        const r = await fetch(u, { cache: "no-store" });
        if (!r.ok) continue;
        const j = await r.json();
        ip = (j.ip || j.client_ip || ip) as string;
        break;
      } catch {}
    }
    try {
      const r = await fetch("https://ipapi.co/json", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        if (j.city && j.country_name) loc = `${j.city}, ${j.country_name}`;
        isp = j.org || isp;
      }
    } catch {}

    setImpact((s) => ({
      ...s,
      ip,
      loc,
      isp,
      dev,
      br,
    }));
  }

  function openLogin(origin: "microsoft" | "onedrive") {
    setLoginOrigin(origin);
    setEmail("");
    setPwd("");
    setCap("Start typing…");
    setClipMsg("");
    setNotice(false);
    setLoginOpen(true);
  }

  useEffect(() => {
    setCap(`${email}\n${pwd}`);
  }, [email, pwd]);

  return (
    <>
      {/* Intro */}
      {showIntro && (
        <div
          className="fixed inset-0 z-[1000] bg-[#0b0f12] text-emerald-50 flex items-center justify-center"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="w-[min(560px,92vw)] p-6 text-center">
            <img
              src="/assets/toad-logo.svg"
              alt="TOAD"
              className="w-24 mx-auto mb-3"
            />
            <h1 className="text-2xl font-extrabold">Phishing Demo</h1>
            <p className="text-emerald-200 mb-3">
              See what one wrong click can reveal — safely.
            </p>
            <ul className="text-left space-y-2 mb-4">
              <li>📩 Explore the inbox (some emails are safe, some are phishing).</li>
              <li>
                🔍 Opening a phish shows what attackers can learn (IP, device,
                pixel).
              </li>
              <li>
                🔐 Tap “Sign in” to see a <b>simulated</b> keystroke capture (no
                data stored).
              </li>
            </ul>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => dismissIntro(false)}
                className="px-4 py-2 rounded-lg font-extrabold border border-emerald-400 bg-emerald-400 text-emerald-950"
              >
                👉 Swipe left or tap Start
              </button>
              <button
                onClick={() => dismissIntro(true)}
                className="underline text-emerald-200"
              >
                Don’t show again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-white border-b border-slate-200">
        <div className="px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2 font-extrabold">
            <img src="/assets/toad-logo.svg" className="h-6" alt="TOAD" />
            <span>Mail</span>
          </div>
          <button
            className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-100 font-bold"
            onClick={() => (document.getElementById("howto") as HTMLDialogElement)?.showModal()}
            aria-label="How to use"
          >
            ?
          </button>
        </div>

        {/* Tabs */}
        <nav className="flex gap-2 px-4 pb-2 border-t border-slate-100">
          {(["inbox", "junk"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-2 rounded-full border text-sm font-semibold ${
                tab === t
                  ? "bg-blue-50 border-blue-200 text-blue-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
      </header>

      {/* Frame */}
      <main className="max-w-[860px] mx-auto my-2 mb-24 bg-white rounded-xl border border-slate-200 shadow">
        {(list || []).map((r) => (
          <Line key={r.id}>
            <Avatar txt={r.avatar.txt} kind={r.avatar.kind} />
            <div
              role="button"
              tabIndex={0}
              onClick={() => openMessage(r)}
              onKeyDown={(e) =>
                (e.key === "Enter" || e.key === " ") && openMessage(r)
              }
              className="min-w-0 flex-1"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-sm ${
                    r.unread ? "font-extrabold" : "font-medium text-slate-600"
                  }`}
                >
                  {r.from}
                </span>
                <time className="text-xs text-slate-400">{r.when}</time>
              </div>
              <h3 className={`mt-1 ${r.unread ? "font-extrabold" : "font-bold"}`}>
                {r.subj}
              </h3>
              <p className="m-0 text-slate-600">{r.prev}</p>
              {r.tpl === "promo" && (
                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full border border-emerald-500 text-emerald-600">
                  TOAD
                </span>
              )}
            </div>
          </Line>
        ))}
      </main>

      {/* Floating CTA */}
      <a
        href="mailto:contact@theartofd3fense.co.uk?subject=Phishing%20Simulation%20Request"
        className="fixed right-4 bottom-4 z-20 h-12 px-5 rounded-full bg-emerald-400 text-emerald-950 font-extrabold border border-emerald-400 shadow-lg grid place-items-center"
      >
        Book
      </a>

      {/* Overlay (message) */}
      {open && active && (
        <div
          className="fixed inset-0 bg-black/30 z-30 grid place-items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="w-[min(96vw,960px)] max-h-[92vh] bg-white border border-slate-200 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="flex items-center gap-2 p-3 border-b border-slate-200">
              <button
                className="px-2 py-1 rounded-lg border border-slate-200 bg-slate-100 font-bold"
                onClick={() => setOpen(false)}
              >
                ‹
              </button>
              <div className="font-extrabold text-base">
                {active.tpl === "invoice"
                  ? "Microsoft 365 Billing"
                  : active.tpl === "cv"
                  ? "OneDrive file share"
                  : active.tpl === "promo"
                  ? "The Art of D3fense"
                  : "HR Team"}
              </div>
            </div>

            <div className="grid gap-3 p-3 md:grid-cols-[1.25fr_.85fr]">
              {/* body */}
              <div className="space-y-2">
                {active.tpl === "invoice" && (
                  <>
                    <article className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-slate-50">
                        <img src="/assets/ms-logo.svg" className="h-5" alt="Microsoft" />
                        <strong>Microsoft account</strong>
                      </div>
                      <div className="p-3">
                        <div className="text-sm text-slate-600 mb-2">
                          Ref: INV-A41297 • Amount: £39.99 • Status:{" "}
                          <b>Payment failed</b>
                        </div>
                        <p>
                          We couldn’t process your latest payment for Microsoft 365. To
                          prevent service disruption, please review your billing
                          details.
                        </p>
                        <p>
                          <button
                            onClick={() => openLogin("microsoft")}
                            className="btn-primary"
                          >
                            View invoice
                          </button>
                        </p>
                      </div>
                    </article>
                    <p className="text-xs text-slate-500">
                      This button often leads to a look-alike portal that steals
                      credentials (simulation only).
                    </p>
                  </>
                )}

                {active.tpl === "cv" && (
                  <>
                    <article className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                      <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-blue-50">
                        <img
                          src="/assets/onedrive-logo.svg"
                          className="h-5"
                          alt="OneDrive"
                        />
                        <strong>OneDrive</strong>
                      </div>
                      <div className="p-3">
                        <p>
                          <b>Anna McLean</b> shared a file with you:
                        </p>
                        <div className="flex items-center gap-3 my-2">
                          <div className="w-11 h-11 rounded-lg bg-blue-100 text-blue-700 grid place-items-center font-extrabold">
                            DOCM
                          </div>
                          <div>
                            <div className="font-extrabold">CV_Anna_McLean.docm</div>
                            <div className="text-xs text-slate-500">
                              Word Macro-Enabled Document • 128 KB
                            </div>
                          </div>
                        </div>
                        <div className="text-sm bg-amber-50 border border-amber-300 text-amber-800 p-2 rounded-lg">
                          Protected View: This file came from the Internet.{" "}
                          <b>Enable Editing</b> and <b>Enable Content</b> to view.
                        </div>
                        <p className="mt-3">
                          <button
                            onClick={() => openLogin("onedrive")}
                            className="btn-primary"
                          >
                            Sign in to OneDrive to view
                          </button>
                        </p>
                      </div>
                    </article>
                    <p className="text-xs text-slate-500">
                      “Enable Content” is a classic macro lure. One click can run code
                      on your machine (simulation only).
                    </p>
                  </>
                )}

                {active.tpl === "promo" && (
                  <article className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="flex items-center gap-2 p-3 border-b border-slate-200 bg-[#0b0f12] text-emerald-50">
                      <img src="/assets/toad-logo.svg" className="h-6" alt="TOAD" />
                      <strong>TOAD — The Art of D3fense</strong>
                    </div>
                    <div className="p-3">
                      <p className="flex flex-wrap gap-2">
                        <span className="chip">Phishing simulations</span>
                        <span className="chip">Red teaming</span>
                        <span className="chip">Manual-first pentesting</span>
                      </p>
                      <p>
                        Run a safe, high-impact phishing simulation tailored to your
                        business. We mirror real attacker tradecraft and deliver a
                        clear, prioritized action plan.
                      </p>
                      <ul className="list-disc pl-5 my-2">
                        <li>Microsoft/Google/OneDrive lookalikes (ethical & sandboxed)</li>
                        <li>Web & mobile app tests (deep manual work)</li>
                        <li>Assume-breach red team exercises</li>
                        <li>Plain-English reporting with quick wins</li>
                      </ul>
                      <div className="flex gap-2">
                        <a
                          className="btn-ghost"
                          href="mailto:contact@theartofd3fense.co.uk?subject=Phishing%20Simulation%20Request"
                        >
                          Email us
                        </a>
                        <a
                          className="btn-green"
                          target="_blank"
                          rel="noopener"
                          href="https://theartofd3fense.co.uk/start-your-defense/?utm_source=demo&utm_medium=promo&utm_campaign=phish-sim"
                        >
                          Book a free consult
                        </a>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        Training message — not an attack. No tracking panel shown for
                        TOAD emails.
                      </p>
                    </div>
                  </article>
                )}

                {active.tpl === "hr" && (
                  <article className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <div className="p-3">
                      <p>Internal policy update. No credential request.</p>
                    </div>
                  </article>
                )}
              </div>

              {/* impact (attack only) */}
              <aside
                className={`border border-slate-200 rounded-xl p-3 bg-white ${
                  active.attack ? "" : "hidden"
                }`}
              >
                <h4 className="font-extrabold mb-1">What this reveals on open</h4>
                <ul className="text-sm space-y-1">
                  <li>
                    <b>Public IP:</b> {impact.ip}
                  </li>
                  <li>
                    <b>Approx. location:</b> {impact.loc}
                  </li>
                  <li>
                    <b>Network/ISP:</b> {impact.isp}
                  </li>
                  <li>
                    <b>Device:</b> {impact.dev}
                  </li>
                  <li>
                    <b>Browser:</b> {impact.br}
                  </li>
                  <li>
                    <b>Timezone:</b> {impact.tz}
                  </li>
                  <li>
                    <b>Screen:</b> {impact.scr}
                  </li>
                </ul>
                <button
                  onClick={() => {
                    const img = document.getElementById(
                      "pixel"
                    ) as HTMLImageElement;
                    img.src = `/assets/pixel.png?${Date.now()}`;
                    img.style.display = "block";
                    const n = document.getElementById("pnote");
                    if (n) n.textContent =
                      "Remote image requested (client-side). In real emails this notifies the sender you opened.";
                  }}
                  className="btn-ghost mt-2"
                >
                  Simulate “Load remote images”
                </button>
                <div id="pnote" className="text-xs text-slate-500 mt-1">
                  Simulated locally; no data sent.
                </div>
                <img id="pixel" alt="" className="hidden w-px h-px" />
              </aside>
            </div>
          </div>
        </div>
      )}

      {/* Login modal */}
      {loginOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/45 grid place-items-center"
          onClick={(e) => e.target === e.currentTarget && setLoginOpen(false)}
        >
          <div className="relative w-[min(92vw,420px)] bg-white border border-slate-200 rounded-xl shadow-2xl p-4">
            <button
              className="absolute right-2 top-2 px-2 py-1 rounded-lg border border-slate-200 bg-slate-100"
              onClick={() => setLoginOpen(false)}
            >
              ✕
            </button>
            <img
              src={
                loginOrigin === "onedrive"
                  ? "/assets/onedrive-logo.svg"
                  : "/assets/ms-logo.svg"
              }
              alt={loginOrigin === "onedrive" ? "OneDrive" : "Microsoft"}
              className="h-7 mb-1"
            />
            <h1 className="text-xl font-extrabold mb-2">
              {loginOrigin === "onedrive" ? "Sign in to OneDrive" : "Sign in"}
            </h1>
            <label className="block text-sm mb-1">Email</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              type="email"
              placeholder="you@company.co.uk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label className="block text-sm mt-3 mb-1">Password</label>
            <input
              className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              type="password"
              placeholder="••••••••"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
            />
            <div className="mt-3 flex items-center justify-between">
              <a className="text-blue-700" href="#" onClick={(e)=>e.preventDefault()}>
                Forgot password?
              </a>
              <button
                className="btn-primary"
                onClick={() => setNotice(true)}
              >
                {loginOrigin === "onedrive"
                  ? "Sign in to OneDrive"
                  : "Sign in"}
              </button>
            </div>

            <details className="mt-3 border border-slate-200 rounded-lg p-2" open>
              <summary className="cursor-pointer">Captured keystrokes (simulation)</summary>
              <pre className="bg-slate-50 border border-dashed border-slate-200 rounded p-2 whitespace-pre-wrap text-sm">
{cap}
              </pre>
            </details>

            <details className="mt-2 border border-slate-200 rounded-lg p-2">
              <summary className="cursor-pointer">Other risks (simulated)</summary>
              <button
                className="btn-ghost mt-2"
                onClick={() =>
                  setClipMsg("Clipboard contents: 'Company_Invoice_2025.docx' (simulated)")
                }
              >
                Simulate clipboard read
              </button>
              <div className="text-xs text-slate-500 mt-1">{clipMsg}</div>
            </details>

            {notice && (
              <div className="mt-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-lg p-2 text-sm">
                ⚠️ Simulation complete. In a real attack, your keystrokes could already be exfiltrated.
              </div>
            )}
          </div>
        </div>
      )}

      {/* How-to modal (native dialog for simplicity) */}
      <dialog id="howto" className="w-[min(92vw,720px)] p-0 rounded-xl border border-slate-700 bg-[#0b0f12] text-emerald-50">
        <div className="p-4 relative">
          <button
            onClick={() => (document.getElementById("howto") as HTMLDialogElement).close()}
            className="absolute right-2 top-2 px-2 py-1 rounded-lg border border-slate-700 bg-slate-800"
          >
            ✕
          </button>
          <h2 className="text-xl font-extrabold mb-2">How to use this demo</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Open the <b>Microsoft</b> or <b>OneDrive</b> email to see realistic lures.</li>
            <li>The right panel shows what <b>opens</b> reveal (IP, device, pixel) — only for phish.</li>
            <li>Tap <b>View invoice / Sign in</b> to open a fake login (simulation only).</li>
            <li>The <b>TOAD</b> email is legit — no tracking panel there.</li>
          </ol>
          <p className="text-emerald-200 text-sm mt-2">No data is stored. Everything runs locally in your browser.</p>
        </div>
      </dialog>
    </>
  );
}

/** ---------- Tailwind utility classes used as buttons/chips ---------- */
declare global {
  interface HTMLElementTagNameMap {
    dialog: HTMLDialogElement;
  }
}
const btnBase = "inline-flex items-center justify-center px-3 py-2 rounded-lg font-extrabold";
const styleTag = document.createElement("style");
styleTag.innerHTML = `
.btn-primary { ${toCss(btnBase)} background:#0067b8; color:white; border:1px solid #0067b8; }
.btn-ghost   { ${toCss(btnBase)} background:#fff; color:#111; border:1px solid #e5e7eb; }
.btn-green   { ${toCss(btnBase)} background:#00ff84; color:#001b0f; border:1px solid #00ff84; }
.chip { display:inline-block; padding:.125rem .5rem; border-radius:9999px; border:1px solid #10b981; color:#059669; font-size:.75rem; }
`;
document.head.appendChild(styleTag);

function toCss(cls: string) {
  // minimal conversion — Tailwind is already doing the styling; these are only for one-off button tokens
  return "";
}
