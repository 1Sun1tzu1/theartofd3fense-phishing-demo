import React, { useMemo, useState, useEffect } from "react";

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({children, className=""}) => (
  <div className={`card ${className}`}>{children}</div>
);
const CardHeader: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div className="card-header">{children}</div>
);
const CardTitle: React.FC<{children: React.ReactNode}> = ({children}) => (
  <h3 className="card-title">{children}</h3>
);
const CardContent: React.FC<{children: React.ReactNode, className?: string}> = ({children, className=""}) => (
  <div className={`card-content ${className}`}>{children}</div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({className="", ...p}) => (
  <button {...p} className={`btn focus-ring ${className}`} />
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = ({className="", ...p}) => (
  <input {...p} className={`input focus-ring ${className}`} />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = ({className="", ...p}) => (
  <textarea {...p} className={`textarea focus-ring ${className}`} />
);

function HelpTip({label, children}:{label:string, children:React.ReactNode}){
  return (
    <span className="tooltip align-middle ml-2">
      <span className="help">❔<span className="sr-only">{label}</span></span>
      <span role="tooltip" className="tip">{children}</span>
    </span>
  );
}

function HeaderTabs({tab, setTab}:{tab:string, setTab:(t:any)=>void}){
  const mk = (id:string, label:string, tip:string) => (
    <div className="flex items-center gap-2">
      <Button onClick={()=>setTab(id)} className={tab===id ? "btn-tab-active" : "btn-tab"} aria-pressed={tab===id}>{label}</Button>
      <HelpTip label={`${label} help`}>{tip}</HelpTip>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {mk("phish","Live Phishing Demo","Click the button in the mock email, then see what an attacker learns.")}
      {mk("vuln","Vulnerability Sandbox","Try SQLi/XSS/SSRF safely. Switch between Insecure and Secure to compare.")}
      {mk("chain","Attack Chain Simulator","Click each step card to see Defend/Detect/Contain guidance.")}
    </div>
  );
}

function PhishingDemo(){
  const [clicks, setClicks] = useState<number>(() => {
    try { const v = localStorage.getItem("phish_clicks"); return v ? JSON.parse(v) : 0 } catch { return 0 }
  });
  const [showGotcha, setShowGotcha] = useState(false);
  const handleClick = () => {
    const next = clicks + 1; setClicks(next);
    try { localStorage.setItem("phish_clicks", JSON.stringify(next)); } catch {}
    setShowGotcha(true);
  };
  const attackerView = useMemo(() => ({
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    referrer: document.referrer || "(none)",
    url: window.location.href,
    screen: `${window.screen.width}x${window.screen.height}`,
    platform: (navigator as any).platform || "unknown",
  }), [showGotcha]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader><CardTitle>Mock Email</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-300">
            This is a <b>safe</b> demo email designed to teach why people click. Notice the urgency and brand look-alike.
          </p>
          <div className="rounded-xl border border-gray-800 p-4" style={{background:'var(--surface-3)'}}>
            <p className="text-sm"><b>From:</b> "IT Support" &lt;support@corp-secure.com&gt;</p>
            <p className="text-sm"><b>Subject:</b> Action required: MFA sync failure</p>
            <div className="my-4 text-sm space-y-2">
              <p>Hi there,</p>
              <p>We detected a mismatch with your multi-factor authentication. To keep your account active, please re-sync now.</p>
            </div>
            <Button onClick={handleClick} className="btn-primary rounded-2xl px-6" aria-label="Re-Sync MFA (demo)">Re-Sync MFA</Button>
            <p className="mt-3 text-xs text-gray-400">* In real attacks this would go to a look-alike domain.</p>
          </div>
          <div className="text-xs text-gray-400">Total demo clicks on this device: <span className="font-mono text-gray-300">{clicks}</span></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>“Gotcha” – Attacker’s View</CardTitle></CardHeader>
        <CardContent>
          {!showGotcha ? (
            <div className="text-sm text-gray-300">Click the button in the mock email to see what telemetry an attacker could log just from the click.</div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2" style={{color:'var(--brand)'}}>✔ Click captured</div>
              <div className="rounded-xl border border-gray-800 p-4" style={{background:'var(--surface-3)'}}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-400">Timestamp</span><div className="font-mono break-all">{attackerView.timestamp}</div></div>
                  <div><span className="text-gray-400">Language</span><div className="font-mono">{attackerView.language}</div></div>
                  <div className="col-span-2"><span className="text-gray-400">User-Agent</span><div className="font-mono break-all">{attackerView.userAgent}</div></div>
                  <div><span className="text-gray-400">Time-Zone</span><div className="font-mono">{attackerView.timeZone}</div></div>
                  <div><span className="text-gray-400">Screen</span><div className="font-mono">{attackerView.screen}</div></div>
                  <div className="col-span-2"><span className="text-gray-400">Referrer</span><div className="font-mono break-all">{attackerView.referrer}</div></div>
                  <div className="col-span-2"><span className="text-gray-400">URL</span><div className="font-mono break-all">{attackerView.url}</div></div>
                </div>
              </div>
              <p className="text-sm text-gray-300">In real campaigns, attackers also capture IP (→ geo), campaign ID, and session fingerprints.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function SqlInjectionPanel(){
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password");
  const [mode, setMode] = useState<"insecure"|"secure">("insecure");
  const simulate = () => {
    if (mode === "insecure"){
      const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
      const isBypass = /('|").*?OR.*?('1'='1|1=1)/i.test(username+" "+password);
      return {query, result: isBypass ? "Bypass: login granted via tautology" : "Login failed (no bypass)", ok: isBypass};
    }
    const query = "SELECT * FROM users WHERE username = ? AND password = ?";
    const isBypass = /('|").*?OR.*?('1'='1|1=1)/i.test(username+" "+password);
    return {query, result: isBypass ? "Blocked: injected tokens treated as data via parameters" : "Login failed (invalid creds)", ok: !isBypass && username==="admin" && password==="password"};
  };
  const out = simulate();
  return (
    <Card>
      <CardHeader><CardTitle>SQL Injection</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Mode:</span>
          <div className="flex gap-2">
            <Button onClick={()=>setMode("insecure")} className={mode==="insecure"?"btn-tab-active":"btn-tab"} aria-pressed={mode==="insecure"}>Insecure</Button>
            <Button onClick={()=>setMode("secure")} className={mode==="secure"?"btn-tab-active":"btn-tab"} aria-pressed={mode==="secure"}>Secure</Button>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Input value={username} onChange={e=>setUsername(e.target.value)} placeholder="username" />
          <Input value={password} onChange={e=>setPassword(e.target.value)} placeholder="password" />
        </div>
        <code className="block text-xs p-3 rounded-lg" style={{background:'var(--surface-3)', border:'1px solid #1f2937', overflowX:'auto'}}>{out.query}</code>
        <div className={`text-sm ${out.ok ? '' : ''}`} style={{color: out.ok ? 'var(--brand)' : '#facc15'}}>
          {out.ok ? '✓' : '⚠'} {out.result}
        </div>
        <p className="text-xs text-gray-400">Try: <code>' OR '1'='1</code> in the username or password field.</p>
      </CardContent>
    </Card>
  );
}

function XssPanel(){
  const [input, setInput] = useState("<b>Hello</b>");
  const [mode, setMode] = useState<"insecure"|"secure">("insecure");
  const escapeHtml = (html: string) => html.replace(/[<>&]/g, c => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" } as any)[c]);
  const neutralizeForPreview = (html: string) => {
    let s = html;
    s = s.replace(/<script[\\s\\S]*?>[\\s\\S]*?<\\/script>/gi, "[script removed]");
    s = s.replace(/\\son\\w+\\s*=\\s*(\"[^\"]*\"|'[^']*'|[^\\s>]+)/gi, "");
    s = s.replace(/javascript:/gi, "javascript-disabled:");
    return s;
  };
  const wouldExecute = useMemo(() => /<script|on\\w+=|javascript:/i.test(input), [input]);
  const insecureHtml = useMemo(() => neutralizeForPreview(input), [input]);
  const secureHtml = useMemo(() => escapeHtml(input), [input]);
  const status = mode === 'insecure'
    ? (wouldExecute ? {cls: 'text-red-400', msg: 'Would execute in a vulnerable app (events/script detected).'}
                    : {cls: 'text-yellow-400', msg: 'Rendered without encoding; benign HTML may still change the page.'})
    : {cls: '', msg: 'Safe: output encoded (tags shown as text), no execution.'};
  return (
    <Card>
      <CardHeader><CardTitle>Reflected XSS</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Mode:</span>
          <div className="flex gap-2">
            <Button onClick={()=>setMode("insecure")} className={mode==="insecure"?"btn-tab-active":"btn-tab"} aria-pressed={mode==="insecure"}>Insecure</Button>
            <Button onClick={()=>setMode("secure")} className={mode==="secure"?"btn-tab-active":"btn-tab"} aria-pressed={mode==="secure"}>Secure</Button>
          </div>
        </div>
        <Textarea value={input} onChange={e=>setInput(e.target.value)} placeholder="Try: <img src=x onerror=alert(1)>" />
        <div className="rounded-xl border border-gray-800 p-3" style={{background:'var(--surface-2)'}}>
          <div className="text-xs text-gray-400 mb-1">Rendered Output</div>
          <div className="p-3 rounded-lg" style={{background:'var(--surface-3)', border:'1px solid #1f2937'}}>
            {mode==='insecure' ? (
              <div className="prose prose-sm max-w-none text-gray-100" dangerouslySetInnerHTML={{__html: insecureHtml}} />
            ) : (
              <pre className="text-xs whitespace-pre-wrap break-words text-gray-300">{secureHtml}</pre>
            )}
          </div>
        </div>
        <div className={`text-sm ${status.cls}`}>{status.msg}</div>
        <p className="text-xs text-gray-400">Insecure shows DOM changes with unencoded input (dangerous bits neutralized). Secure shows encoded literal text.</p>
      </CardContent>
    </Card>
  );
}

function SsrfPanel(){
  const [url, setUrl] = useState("http://169.254.169.254/latest/meta-data/");
  const [policy, setPolicy] = useState<"insecure"|"secure">("insecure");
  const result = useMemo(() => {
    const internal = /^(?:http:\\/\\/)?(?:169\\.254\\.169\\.254|127\\.0\\.0\\.1|localhost|10\\.|192\\.168\\.|172\\.(1[6-9]|2\\d|3[0-1]))/i.test(url);
    if (policy === "insecure"){
      return internal ? {ok:true, text:"Internal resource accessed (metadata leaked)"} : {ok:true, text:"Fetched remote resource (no validation)"};
    }
    const allowed = /^https?:\\/\\/(?:example\\.com|api\\.yourbrand\\.io)\\//i.test(url);
    if (allowed) return {ok:true, text:"Allowed by hostname allowlist"};
    if (internal) return {ok:false, text:"Blocked: internal/metadata IP denied"};
    return {ok:false, text:"Blocked: domain not on allowlist"};
  }, [url, policy]);
  return (
    <Card>
      <CardHeader><CardTitle>SSRF</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-gray-400">Policy:</span>
          <div className="flex gap-2">
            <Button onClick={()=>setPolicy("insecure")} className={policy==="insecure"?"btn-tab-active":"btn-tab"} aria-pressed={policy==="insecure"}>Insecure</Button>
            <Button onClick={()=>setPolicy("secure")} className={policy==="secure"?"btn-tab-active":"btn-tab"} aria-pressed={policy==="secure"}>Secure</Button>
          </div>
        </div>
        <Input value={url} onChange={e=>setUrl(e.target.value)} placeholder="http://169.254.169.254/latest/meta-data/" />
        <div className="text-sm" style={{color: policy==='insecure' ? '#facc15' : 'var(--brand)'}}>{result.text}</div>
        <p className="text-xs text-gray-400">Lesson: Use allowlists, resolve & verify IPs, and block private ranges.</p>
      </CardContent>
    </Card>
  );
}

const steps = [
  { key: 'phishing', title: 'Phishing', desc: 'User receives a convincing email and clicks a link or opens an attachment.', defend:["Security awareness training","SPF/DKIM/DMARC","Attachment sandboxing"], detect:["SEG alerts","Link rewriting clicks"], contain:["Auto-quarantine","Block IOCs in proxy/DNS"]},
  { key: 'initial', title: 'Initial Access', desc: 'Landing page steals session or drops a downloader that beacons out.', defend:["FIDO2 MFA","Endpoint hardening"], detect:["EDR detections","Browser isolation"], contain:["Kill process, isolate host","Reset sessions"]},
  { key: 'priv', title: 'Privilege Escalation', desc: 'Attacker leverages misconfig or vuln to elevate privileges.', defend:["Least privilege","Patch mgmt"], detect:["Anomalous admin actions","Token misuse"], contain:["Revoke tokens","Rotate secrets"]},
  { key: 'exfil', title: 'Data Exfiltration', desc: 'Sensitive data is staged and exfiltrated to external storage.', defend:["DLP policies","Egress filtering"], detect:["Unusual upload volumes","DNS tunneling"], contain:["Block exfil destinations","Legal hold & IR"]},
];

function AttackChain(){
  const [active, setActive] = useState('phishing');
  const s = steps.find(x => x.key === active)!;
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl" style={{background:'var(--surface-3)', border:'1px solid #1f2937'}}>🛡️</div>
        <div>
          <h2 className="text-xl font-semibold leading-tight">Visual Attack Chain</h2>
          <p className="text-sm text-gray-400">Click a step to view Defend / Detect / Contain.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        {steps.map(step => (
          <button
            key={step.key}
            onClick={()=>setActive(step.key)}
            className="rounded-2xl p-4 text-left transition focus-ring"
            style={{
              background:'var(--surface-2)',
              border:'1px solid #1f2937',
              boxShadow: active===step.key ? '0 0 0 3px var(--brand-ring)' : 'none'
            }}
            title="Click to view details"
            aria-pressed={active===step.key}
            role="button"
          >
            <div className="font-semibold text-gray-100">{step.title}</div>
            <div className="text-xs text-gray-400 mt-1">{step.desc}</div>
          </button>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle>{s.title} – Defend / Detect / Contain</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-400 mb-1">Defend</div>
            <ul className="list-disc pl-5 space-y-1">{s.defend.map((d,i)=>(<li key={i}>{d}</li>))}</ul>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Detect</div>
            <ul className="list-disc pl-5 space-y-1">{s.detect.map((d,i)=>(<li key={i}>{d}</li>))}</ul>
          </div>
          <div>
            <div className="text-gray-400 mb-1">Contain</div>
            <ul className="list-disc pl-5 space-y-1">{s.contain.map((d,i)=>(<li key={i}>{d}</li>))}</ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function App(){
  useEffect(()=>{ document.title = "The Art of D3fense – Edu Demos"; },[]);
  const [tab, setTab] = useState<"phish"|"vuln"|"chain">("phish");
  return (
    <div className="min-h-screen p-4 md:p-8" style={{background:'var(--surface-1)'}}>
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">The Art of D3fense – Educational Demos</h1>
            <p className="text-sm text-gray-400">Safe, interactive demos you can embed anywhere.</p>
          </div>
        </header>

        <HeaderTabs tab={tab} setTab={setTab} />

        <div className="w-full mt-4">
          {tab==="phish" && <PhishingDemo/>}
          {tab==="vuln" && (
            <div className="grid lg:grid-cols-3 gap-6">
              <SqlInjectionPanel />
              <XssPanel />
              <SsrfPanel />
            </div>
          )}
          {tab==="chain" && <AttackChain/>}
        </div>

        <footer className="pt-4 text-xs text-gray-500">
          Tip: Host this on GitHub Pages or any static host, then embed in WordPress via an iframe.
        </footer>
      </div>
    </div>
  );
}