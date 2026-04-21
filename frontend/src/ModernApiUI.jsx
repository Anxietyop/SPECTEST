import { useState, useRef } from 'react';

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  mono: "'JetBrains Mono', monospace",
  display: "'Syne', sans-serif",
};
const C = {
  bg:      '#0b0d10',
  surface: '#12151a',
  surf2:   '#181c23',
  border:  '#1e232d',
  border2: '#272e3a',
  green:   '#00e5a0',
  blue:    '#3b8bff',
  amber:   '#f5a623',
  red:     '#ff4d4d',
  purple:  '#a78bfa',
  text:    '#dde1e8',
  muted:   '#5a6272',
  faint:   '#1e2530',
};

// ─────────────────────────────────────────────
// STYLE HELPERS
// ─────────────────────────────────────────────
const panel = (accent) => ({
  background: C.surface,
  border: `1px solid ${C.border}`,
  borderTop: `2px solid ${accent || C.border2}`,
  borderRadius: 10,
  padding: 16,
  position: 'relative',
  overflow: 'hidden',
});

const methodColors = {
  GET:    { bg: `${C.blue}22`,   color: C.blue },
  POST:   { bg: `${C.green}22`,  color: C.green },
  PUT:    { bg: `${C.amber}22`,  color: C.amber },
  PATCH:  { bg: `${C.purple}22`, color: C.purple },
  DELETE: { bg: `${C.red}22`,    color: C.red },
};
const methodTag = (m, size = 11) => {
  const { bg, color } = methodColors[m] || methodColors.GET;
  return { fontFamily: T.mono, fontSize: size, fontWeight: 600, padding: '3px 8px', borderRadius: 4, background: bg, color };
};

const statusBadge = (ok) => ({
  fontFamily: T.mono, fontSize: 11, fontWeight: 600,
  padding: '2px 8px', borderRadius: 4,
  background: ok ? `${C.green}22` : `${C.red}22`,
  color: ok ? C.green : C.red,
});

// ─────────────────────────────────────────────
// TINY SVG ICONS
// ─────────────────────────────────────────────
const IconRoute  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>;
const IconWarn   = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconAmbig  = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
const IconCheck  = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const IconSchema = () => <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>;
const IconPlay   = () => <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>;

// ─────────────────────────────────────────────
// MICRO COMPONENTS
// ─────────────────────────────────────────────
const Pulse = () => (
  <span style={{ width: 7, height: 7, borderRadius: '50%', background: C.green, display: 'inline-block', animation: 'st-pulse 2s ease-in-out infinite' }} />
);

const ThinkDots = () => (
  <span style={{ display: 'inline-flex', gap: 3 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: C.green, display: 'inline-block', animation: `st-blink 1.2s ease-in-out ${i * 0.2}s infinite` }} />
    ))}
  </span>
);

const MacDots = () => (
  <div style={{ display: 'flex', gap: 5 }}>
    {['#ff5f57', '#ffbd2e', '#28c840'].map(c => <div key={c} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />)}
  </div>
);

const SecLabel = ({ children }) => (
  <div style={{ fontFamily: T.mono, fontSize: 10, color: C.muted, letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
    {children}
    <div style={{ flex: 1, height: 1, background: C.border }} />
  </div>
);

const Chip = ({ color, label }) => (
  <div style={{ fontFamily: T.mono, fontSize: 10, padding: '2px 8px', borderRadius: 3, background: `${color}1a`, color, letterSpacing: '0.04em' }}>
    {label}
  </div>
);

// ─────────────────────────────────────────────
// ENTITY PANEL
// ─────────────────────────────────────────────
function EntityPanel({ entity }) {
  const ep      = entity.mapped_endpoint || {};
  const issues  = entity.schema_issues  || [];
  const tests   = entity.test_results   || [];
  const ambigs  = entity.ambiguities    || [];
  const schema  = ep.schema             || {};
  const required   = schema.required    || [];
  const properties = schema.properties  || {};

  const passTests  = tests.filter(t => t.status === 200);
  const failTests  = tests.filter(t => t.status && t.status !== 200);
  const issueTests = tests.filter(t => !t.status && t.issue);

  return (
    <div style={{ marginBottom: 12, animation: 'st-fadein 0.35s ease forwards' }}>

      {/* ── ENTITY HEADER ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: T.mono, fontSize: 10, padding: '2px 8px', borderRadius: 3, background: `${C.green}1a`, color: C.green, letterSpacing: '0.05em' }}>ENTITY</span>
        <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>{entity.entity}</span>
        <div style={{ flex: 1, height: 1, background: C.border, minWidth: 20 }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {passTests.length  > 0 && <Chip color={C.green}  label={`${passTests.length} passed`} />}
          {failTests.length  > 0 && <Chip color={C.red}    label={`${failTests.length} failed`} />}
          {issues.length     > 0 && <Chip color={C.amber}  label={`${issues.length} schema issues`} />}
          {ambigs.length     > 0 && <Chip color={C.purple} label={`${ambigs.length} ambiguous`} />}
        </div>
      </div>

      {/* ── ROW 1: Endpoint + Right column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>

        {/* Endpoint + schema */}
        <div style={panel(C.green)}>
          <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
            <IconRoute /> Mapped endpoint
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: C.surf2, border: `1px solid ${C.border2}`, borderRadius: 8, padding: '10px 14px', marginBottom: 14 }}>
            <span style={methodTag(ep.method)}>{ep.method || '?'}</span>
            <span style={{ fontFamily: T.mono, fontSize: 14, fontWeight: 500, color: C.text }}>{ep.path || '/'}</span>
          </div>

          {Object.keys(properties).length > 0 && (
            <>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: C.muted, letterSpacing: '0.08em', marginBottom: 7, display: 'flex', alignItems: 'center', gap: 5 }}>
                <IconSchema /> SCHEMA FIELDS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {Object.entries(properties).map(([key, val]) => (
                  <div key={key} style={{ fontFamily: T.mono, fontSize: 11, color: '#6abf8a', background: `${C.green}08`, borderRadius: 6, padding: '6px 10px', display: 'flex', alignItems: 'center', gap: 0 }}>
                    <span style={{ color: C.blue }}>{key}</span>
                    <span style={{ color: C.muted }}>:&nbsp;</span>
                    <span style={{ color: C.purple }}>{val.type}</span>
                    {required.includes(key) && (
                      <span style={{ marginLeft: 8, fontFamily: T.mono, fontSize: 9, padding: '1px 5px', borderRadius: 3, background: `${C.amber}1a`, color: C.amber }}>required</span>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Issues + Ambiguities stacked */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {issues.length > 0 && (
            <div style={panel(C.amber)}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconWarn /> Schema issues
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {issues.map((iss, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: `${C.amber}0d`, border: `1px solid ${C.amber}30`, borderRadius: 6, padding: '7px 10px', fontFamily: T.mono, fontSize: 11, color: '#c99040', lineHeight: 1.6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.amber, marginTop: 4, flexShrink: 0 }} />
                    {iss}
                  </div>
                ))}
              </div>
            </div>
          )}

          {ambigs.length > 0 && (
            <div style={panel(C.purple)}>
              <div style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                <IconAmbig /> Ambiguities flagged
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {ambigs.map((a, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: `${C.purple}0d`, border: `1px solid ${C.purple}30`, borderRadius: 6, padding: '7px 10px', fontFamily: T.mono, fontSize: 11, color: '#b09ee0', lineHeight: 1.6 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: C.purple, marginTop: 4, flexShrink: 0 }} />
                    {a}
                  </div>
                ))}
              </div>
            </div>
          )}

          {issues.length === 0 && ambigs.length === 0 && (
            <div style={{ ...panel(C.green), display: 'flex', alignItems: 'center', gap: 8, color: C.green, fontFamily: T.mono, fontSize: 12 }}>
              <IconCheck /> All clear — no schema issues or ambiguities
            </div>
          )}
        </div>
      </div>

      {/* ── TEST RESULTS ── */}
      <SecLabel>Test results</SecLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {tests.map((t, i) => {
          const hasStatus   = t.status !== undefined;
          const ok          = hasStatus ? t.status === 200 : null;
          const displayMethod = t.method || ep.method || 'GET';
          const hasBothStatus = t.valid_status !== undefined && t.invalid_status !== undefined;
          const mismatch    = hasBothStatus && t.valid_status === t.invalid_status;

          return (
            <div key={i} style={{
              background: C.surf2, borderRadius: 8,
              border: `1px solid ${C.border}`,
              borderLeft: `3px solid ${hasStatus ? (ok ? C.green : C.red) : C.amber}`,
              padding: '11px 14px',
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: C.muted, flex: 1, wordBreak: 'break-all', lineHeight: 1.5 }}>
                  {t.endpoint}
                </span>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                  <span style={methodTag(displayMethod, 10)}>{displayMethod}</span>
                  {hasStatus && (
                    <span style={statusBadge(ok)}>{t.status}</span>
                  )}
                  {hasBothStatus && (
                    <span style={{ fontFamily: T.mono, fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${C.amber}18`, color: C.amber }}>
                      valid {t.valid_status} · invalid {t.invalid_status}
                    </span>
                  )}
                </div>
              </div>
              {t.issue && (
                <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: C.amber, flexShrink: 0 }} />
                  <span style={{ fontFamily: T.mono, fontSize: 10, color: C.amber }}>{t.issue}</span>
                </div>
              )}
              {mismatch && !t.issue && (
                <div style={{ marginTop: 8, fontFamily: T.mono, fontSize: 10, color: C.amber }}>
                  ⚠ Valid and invalid responses return the same status — validation may not be enforced
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// API HELPERS  ← replace with real endpoints
// ─────────────────────────────────────────────
const delay = (ms) => new Promise(r => setTimeout(r, ms));

const sendPromptToAI = async (res1) => {
  const res = await fetch('http://localhost:3000/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: res1 }),
  });
  if (!res.ok) throw new Error(`AI request failed: ${res.status}`);
  return res.json();
};

const pollBackend = async () => {
  const res = await fetch('http://localhost:8000/auto-analyze/result');
  if (!res.ok) throw new Error(`Backend poll failed: ${res.status}`);
  const test = await res.json();
  console.log("Debug:", test);
  return res.json();
};

// ─────────────────────────────────────────────
// APP ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [prompt, setPrompt]     = useState('');
  const [focused, setFocused]   = useState(false);
  const [loading, setLoading]   = useState(false);
  const [output, setOutput]     = useState(null);   // always an array
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied]     = useState(false);
  const textareaRef = useRef(null);

  // aggregate stats across all entities
  const totalEntities = output?.length ?? 0;
  const totalPass     = output?.reduce((a, e) => a + (e.test_results || []).filter(t => t.status === 200).length, 0) ?? 0;
  const totalFail     = output?.reduce((a, e) => a + (e.test_results || []).filter(t => t.status && t.status !== 200).length, 0) ?? 0;
  const totalIssues   = output?.reduce((a, e) => a + (e.schema_issues || []).length, 0) ?? 0;
  const totalTests    = output?.reduce((a, e) => a + (e.test_results || []).length, 0) ?? 0;

  const runTest = async () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput(null);
    setActiveTab(0);

    try {
      await sendPromptToAI(prompt);

      let result = null;
      for (let i = 0; i < 10; i++) {
        await delay(800);
        result = await pollBackend();
        if (Array.isArray(result) ? result.length > 0 : result?.mapped_endpoint) break;
      }

      // normalise to array regardless of what backend returns
      setOutput(Array.isArray(result) ? result : [result]);
    } catch (err) {
      console.error(err);
      setOutput([{
        entity: 'Error',
        schema_issues: [err.message],
        test_results: [],
        ambiguities: [],
        mapped_endpoint: { path: '/', method: 'GET', schema: {} },
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runTest();
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const showRaw = activeTab === (output?.length ?? 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;500;700;800&display=swap');
        @keyframes st-pulse  { 0%,100%{opacity:1;transform:scale(1)}   50%{opacity:.3;transform:scale(.75)} }
        @keyframes st-blink  { 0%,80%,100%{opacity:.15} 40%{opacity:1} }
        @keyframes st-fadein { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        textarea { caret-color: #00e5a0; }
        textarea:focus { outline: none; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #1e2530; border-radius: 3px; }
      `}</style>

      <div style={{ fontFamily: T.display, background: C.bg, minHeight: '100vh', color: C.text, position: 'relative' }}>

        {/* grid background */}
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, backgroundImage: `linear-gradient(${C.green}07 1px,transparent 1px),linear-gradient(90deg,${C.green}07 1px,transparent 1px)`, backgroundSize: '48px 48px' }} />

        <div style={{ position: 'relative', zIndex: 1 }}>

          {/* ══ HEADER ══ */}
          <header style={{ padding: '16px 32px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 7, background: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: '0.09em', textTransform: 'uppercase' }}>
                Spec<span style={{ color: C.green }}>Test</span>
              </div>
              <div style={{ fontFamily: T.mono, fontSize: 10, padding: '2px 7px', borderRadius: 3, border: `1px solid ${C.border2}`, color: C.muted, letterSpacing: '0.05em' }}>PS-09</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: T.mono, fontSize: 11, color: C.green }}>
              <Pulse /> AGENT READY
            </div>
          </header>

          {/* ══ MAIN ══ */}
          <main style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 32px' }}>

            {/* Prompt input */}
            <div style={{ background: C.surface, border: `1px solid ${focused ? C.green : C.border2}`, borderRadius: 10, padding: '14px 16px', marginBottom: 24, transition: 'border-color 0.2s' }}>
              <div style={{ fontFamily: T.mono, fontSize: 10, color: C.muted, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>
                // Natural language requirement
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <textarea
                  ref={textareaRef}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: C.text, fontFamily: T.mono, fontSize: 13, lineHeight: 1.75, resize: 'none', minHeight: 48 }}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="e.g. The system should support user accounts with email login, and blog entries with title and body..."
                />
                <button
                  style={{ background: (loading || !prompt.trim()) ? C.surf2 : C.green, border: 'none', borderRadius: 8, padding: '10px 22px', color: (loading || !prompt.trim()) ? C.muted : '#000', fontFamily: T.display, fontSize: 13, fontWeight: 700, cursor: (loading || !prompt.trim()) ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap', letterSpacing: '0.04em' }}
                  onClick={runTest}
                >
                  <IconPlay /> RUN
                </button>
              </div>
            </div>

            {/* Loading indicator */}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', fontFamily: T.mono, fontSize: 12, color: C.muted }}>
                <ThinkDots />
                Parsing requirements · mapping endpoints · generating test suite...
              </div>
            )}

            {/* ══ OUTPUT ══ */}
            {output && (
              <div style={{ animation: 'st-fadein 0.35s ease forwards' }}>

                {/* Global stats bar */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
                  {[
                    { num: totalEntities, color: C.blue,   label: 'Entities' },
                    { num: totalTests,    color: null,      label: 'Total tests' },
                    { num: totalPass,     color: C.green,  label: 'Passed' },
                    { num: totalFail,     color: C.red,    label: 'Failed' },
                    { num: totalIssues,   color: C.amber,  label: 'Schema gaps' },
                  ].map(({ num, color, label }) => (
                    <div key={label} style={{ flex: 1, background: C.surface, border: `1px solid ${C.border}`, borderTop: `2px solid ${color || C.border2}`, borderRadius: 8, padding: '12px 14px', textAlign: 'center' }}>
                      <span style={{ fontFamily: T.mono, fontSize: 24, fontWeight: 600, display: 'block', color: color || C.text }}>{num}</span>
                      <div style={{ fontSize: 10, color: C.muted, letterSpacing: '0.07em', textTransform: 'uppercase', marginTop: 3 }}>{label}</div>
                    </div>
                  ))}
                </div>

                {/* Tab bar — one tab per entity + Raw JSON tab */}
                <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: `1px solid ${C.border}` }}>
                  {output.map((e, i) => {
                    const active = activeTab === i;
                    const eIssues = (e.schema_issues || []).length;
                    return (
                      <button key={i} onClick={() => setActiveTab(i)} style={{ fontFamily: T.mono, fontSize: 12, padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: active ? `2px solid ${C.green}` : '2px solid transparent', color: active ? C.green : C.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7, marginBottom: -1, letterSpacing: '0.03em', transition: 'color 0.15s' }}>
                        {e.entity}
                        <span style={{ fontFamily: T.mono, fontSize: 10, padding: '1px 6px', borderRadius: 3, background: active ? `${C.green}22` : C.faint, color: active ? C.green : C.muted }}>
                          {(e.test_results || []).length}t
                        </span>
                        {eIssues > 0 && (
                          <span style={{ fontFamily: T.mono, fontSize: 10, padding: '1px 6px', borderRadius: 3, background: `${C.amber}1a`, color: C.amber }}>
                            {eIssues}⚠
                          </span>
                        )}
                      </button>
                    );
                  })}
                  <button onClick={() => setActiveTab(output.length)} style={{ fontFamily: T.mono, fontSize: 12, padding: '10px 18px', background: 'transparent', border: 'none', borderBottom: showRaw ? `2px solid ${C.blue}` : '2px solid transparent', color: showRaw ? C.blue : C.muted, cursor: 'pointer', marginBottom: -1, letterSpacing: '0.03em', transition: 'color 0.15s', marginLeft: 'auto' }}>
                    {'{ }'} Raw JSON
                  </button>
                </div>

                {/* Active entity panel */}
                {!showRaw && output[activeTab] && (
                  <EntityPanel entity={output[activeTab]} />
                )}

                {/* Raw JSON view */}
                {showRaw && (
                  <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, overflow: 'hidden', animation: 'st-fadein 0.25s ease forwards' }}>
                    <div style={{ background: C.surf2, borderBottom: `1px solid ${C.border}`, padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: T.mono, fontSize: 11, color: C.muted }}>
                        <MacDots />
                        agent_response.json
                        <span style={{ color: C.faint }}>·</span>
                        <span>{output.length} {output.length === 1 ? 'entity' : 'entities'}</span>
                      </div>
                      <button
                        onClick={copyJson}
                        style={{ background: 'transparent', border: `1px solid ${copied ? C.green : C.border2}`, borderRadius: 4, padding: '3px 10px', color: copied ? C.green : C.muted, fontFamily: T.mono, fontSize: 10, cursor: 'pointer', transition: 'all 0.2s' }}
                      >
                        {copied ? 'copied!' : 'copy'}
                      </button>
                    </div>
                    <pre style={{ padding: '14px 16px', fontFamily: T.mono, fontSize: 11.5, lineHeight: 1.8, color: '#7a8ba4', whiteSpace: 'pre', overflowX: 'auto', maxHeight: 480, overflowY: 'auto', margin: 0 }}>
                      {JSON.stringify(output, null, 2)}
                    </pre>
                  </div>
                )}

              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div style={{ textAlign: 'center', padding: '64px 20px', color: C.muted }}>
                <div style={{ fontFamily: T.mono, fontSize: 44, fontWeight: 800, color: C.faint, marginBottom: 12 }}>&gt;_</div>
                <p style={{ fontSize: 13, lineHeight: 1.8, color: C.muted }}>
                  Describe your business requirements above and hit RUN.<br />
                  The agent maps each entity to an endpoint and generates a live test suite.
                </p>
                <p style={{ fontFamily: T.mono, fontSize: 11, color: C.faint, marginTop: 14 }}>⌘ + Enter to run</p>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}