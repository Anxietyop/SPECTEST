import { useState, useRef } from 'react';

// ── Inline styles as JS objects ──────────────────────────────────────────────

const css = {
  root: {
    fontFamily: "'Syne', sans-serif",
    background: '#0c0e10',
    minHeight: '100vh',
    color: '#e8eaed',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'fixed',
    inset: 0,
    backgroundImage:
      'linear-gradient(rgba(0,229,160,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,160,0.03) 1px, transparent 1px)',
    backgroundSize: '40px 40px',
    pointerEvents: 'none',
    zIndex: 0,
  },
  content: { position: 'relative', zIndex: 1 },
  header: {
    padding: '18px 28px',
    borderBottom: '1px solid #252a32',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backdropFilter: 'blur(10px)',
  },
  logoArea: { display: 'flex', alignItems: 'center', gap: 10 },
  logoIcon: {
    width: 34,
    height: 34,
    background: '#00e5a0',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 15,
    fontWeight: 800,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  badge: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    padding: '3px 8px',
    borderRadius: 4,
    border: '1px solid #2e3540',
    color: '#6b7280',
    letterSpacing: '0.05em',
  },
  statusPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 7,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#00e5a0',
  },
  main: { padding: '24px 28px', maxWidth: 900, margin: '0 auto' },
  promptArea: (focused) => ({
    background: '#13161a',
    border: `1px solid ${focused ? '#00e5a0' : '#2e3540'}`,
    borderRadius: 10,
    padding: '14px 16px',
    marginBottom: 22,
    transition: 'border-color 0.2s',
  }),
  promptLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#6b7280',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  promptRow: { display: 'flex', gap: 10, alignItems: 'flex-start' },
  promptInput: {
    flex: 1,
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: '#e8eaed',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    lineHeight: 1.7,
    resize: 'none',
    minHeight: 44,
  },
  runBtn: (disabled) => ({
    background: disabled ? '#1a1e24' : '#00e5a0',
    border: 'none',
    borderRadius: 8,
    padding: '10px 20px',
    color: disabled ? '#6b7280' : '#000',
    fontFamily: "'Syne', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    letterSpacing: '0.04em',
    transition: 'opacity 0.15s',
  }),
  sectionLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: '#6b7280',
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    marginBottom: 10,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  sectionLine: { flex: 1, height: 1, background: '#252a32' },
  statRow: { display: 'flex', gap: 10, marginBottom: 16 },
  statChip: {
    flex: 1,
    background: '#1a1e24',
    border: '1px solid #252a32',
    borderRadius: 8,
    padding: '10px 12px',
    textAlign: 'center',
  },
  statNum: (color) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 22,
    fontWeight: 600,
    display: 'block',
    color: color || '#e8eaed',
  }),
  statLbl: {
    fontSize: 10,
    color: '#6b7280',
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 },
  panel: {
    background: '#13161a',
    border: '1px solid #252a32',
    borderRadius: 10,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  accentLine: (color) => ({
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 2,
    background: color,
  }),
  panelTitle: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: '#6b7280',
    marginBottom: 14,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  endpointPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: '#1a1e24',
    border: '1px solid #2e3540',
    borderRadius: 8,
    padding: '10px 14px',
  },
  methodPost: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    background: 'rgba(0,229,160,0.12)',
    color: '#00e5a0',
  },
  methodGet: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    fontWeight: 600,
    padding: '3px 8px',
    borderRadius: 4,
    background: 'rgba(0,119,255,0.12)',
    color: '#4da6ff',
  },
  pathText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 15,
    fontWeight: 500,
    color: '#e8eaed',
  },
  issueList: { display: 'flex', flexDirection: 'column', gap: 8 },
  issueRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 8,
    background: 'rgba(245,166,35,0.06)',
    border: '1px solid rgba(245,166,35,0.2)',
    borderRadius: 6,
    padding: '8px 10px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: '#d4a24c',
    lineHeight: 1.6,
  },
  issueDot: {
    width: 6, height: 6,
    borderRadius: '50%',
    background: '#f5a623',
    marginTop: 4,
    flexShrink: 0,
  },
  testGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  testCard: (pass) => ({
    background: '#1a1e24',
    borderRadius: 8,
    padding: 12,
    border: '1px solid #252a32',
    borderLeft: `3px solid ${pass ? '#00e5a0' : '#ff4b4b'}`,
  }),
  testTop: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 6,
  },
  testEndpoint: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: '#e8eaed',
  },
  statusBadge: (pass) => ({
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, fontWeight: 600,
    padding: '2px 8px', borderRadius: 4,
    background: pass ? 'rgba(0,229,160,0.12)' : 'rgba(255,75,75,0.12)',
    color: pass ? '#00e5a0' : '#ff4b4b',
  }),
  testMsg: { fontSize: 12, color: '#6b7280', lineHeight: 1.5 },
  rawPanel: {
    background: '#13161a',
    border: '1px solid #252a32',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 14,
  },
  rawHeader: {
    background: '#1a1e24',
    borderBottom: '1px solid #252a32',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rawHeaderLeft: {
    display: 'flex', alignItems: 'center', gap: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: '#6b7280',
  },
  dots: { display: 'flex', gap: 5 },
  rawBody: {
    padding: '14px 16px',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, lineHeight: 1.8,
    color: '#8b9bb4',
    whiteSpace: 'pre',
    overflowX: 'auto',
  },
  copyBtn: (copied) => ({
    background: 'transparent',
    border: '1px solid #2e3540',
    borderRadius: 4,
    padding: '3px 10px',
    color: copied ? '#00e5a0' : '#6b7280',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    cursor: 'pointer',
    transition: 'color 0.2s, border-color 0.2s',
    borderColor: copied ? '#00e5a0' : '#2e3540',
  }),
  thinking: {
    display: 'flex', alignItems: 'center',
    gap: 10, padding: '20px 0',
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 12, color: '#6b7280',
  },
  emptyState: { textAlign: 'center', padding: '48px 20px', color: '#6b7280' },
  emptyBig: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 40, fontWeight: 800,
    color: '#1a1e24', marginBottom: 10,
    letterSpacing: '-0.02em',
  },
};

// ── Sub-components ────────────────────────────────────────────────────────────

const Pulse = () => (
  <span style={{
    width: 7, height: 7, borderRadius: '50%',
    background: '#00e5a0', display: 'inline-block',
    animation: 'spectest-pulse 2s ease-in-out infinite',
  }} />
);

const ThinkingDots = () => (
  <span style={{ display: 'inline-flex', gap: 3 }}>
    {[0, 1, 2].map(i => (
      <span key={i} style={{
        width: 5, height: 5, borderRadius: '50%',
        background: '#00e5a0', display: 'inline-block',
        animation: `spectest-blink 1.2s ease-in-out ${i * 0.2}s infinite`,
      }} />
    ))}
  </span>
);

const MacDots = () => (
  <div style={css.dots}>
    {['#ff5f57','#ffbd2e','#28c840'].map(c => (
      <div key={c} style={{ width: 9, height: 9, borderRadius: '50%', background: c }} />
    ))}
  </div>
);

const SectionLabel = ({ children }) => (
  <div style={css.sectionLabel}>
    {children}
    <div style={css.sectionLine} />
  </div>
);

const MethodTag = ({ method }) => {
  const style = method === 'GET' ? css.methodGet : css.methodPost;
  return <span style={style}>{method}</span>;
};

// ── Main component ────────────────────────────────────────────────────────────

const MOCK_RESPONSE = {
  mapped_endpoint: { path: '/users', method: 'POST' },
  schema_issues: [
    "Field 'email' should be marked as required",
    "Field 'password' is missing from request schema",
  ],
  test_results: [
    { endpoint: 'POST /users', status: 200, msg: 'User created successfully — all required fields present.' },
    { endpoint: 'POST /users', status: 400, msg: "Missing 'password' field triggers validation error as expected." },
  ],
};

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef(null);

  const runTest = () => {
    if (!prompt.trim() || loading) return;
    setLoading(true);
    setOutput(null);
    setTimeout(() => {
      setOutput(MOCK_RESPONSE);
      setLoading(false);
    }, 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) runTest();
  };

  const copyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(output, null, 2)).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const pass = output?.test_results.filter(t => t.status === 200).length ?? 0;
  const fail = output?.test_results.filter(t => t.status !== 200).length ?? 0;

  return (
    <>
      {/* Keyframe injection */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Syne:wght@400;500;700;800&display=swap');
        @keyframes spectest-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.35; transform: scale(0.75); }
        }
        @keyframes spectest-blink {
          0%, 80%, 100% { opacity: 0.2; }
          40% { opacity: 1; }
        }
        @keyframes spectest-fadein {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        body { margin: 0; }
        textarea:focus { outline: none; }
        textarea { caret-color: #00e5a0; }
      `}</style>

      <div style={css.root}>
        <div style={css.gridBg} />
        <div style={css.content}>

          {/* ── Header ── */}
          <header style={css.header}>
            <div style={css.logoArea}>
              <div style={css.logoIcon}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <div style={css.brand}>
                Spec<span style={{ color: '#00e5a0' }}>Test</span>
              </div>
              <div style={css.badge}>PS-09</div>
            </div>
            <div style={css.statusPill}>
              <Pulse />
              AGENT READY
            </div>
          </header>

          {/* ── Main ── */}
          <main style={css.main}>

            {/* Prompt box */}
            <div style={css.promptArea(focused)}>
              <div style={css.promptLabel}>// Natural language requirement</div>
              <div style={css.promptRow}>
                <textarea
                  ref={textareaRef}
                  style={css.promptInput}
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleKeyDown}
                  rows={2}
                  placeholder="e.g. The API should allow creating a new user with email and password..."
                />
                <button style={css.runBtn(loading || !prompt.trim())} onClick={runTest}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  RUN
                </button>
              </div>
            </div>

            {/* Loading */}
            {loading && (
              <div style={css.thinking}>
                <ThinkingDots />
                Parsing requirement and mapping to OpenAPI spec...
              </div>
            )}

            {/* Output */}
            {output && (
              <div style={{ animation: 'spectest-fadein 0.4s ease forwards' }}>

                {/* Stats */}
                <SectionLabel>Stat summary</SectionLabel>
                <div style={css.statRow}>
                  {[
                    { num: pass, color: '#00e5a0', label: 'Passed' },
                    { num: fail, color: '#ff4b4b', label: 'Failed' },
                    { num: output.schema_issues.length, color: '#f5a623', label: 'Schema gaps' },
                    { num: output.test_results.length, color: null, label: 'Total tests' },
                  ].map(s => (
                    <div key={s.label} style={css.statChip}>
                      <span style={css.statNum(s.color)}>{s.num}</span>
                      <div style={css.statLbl}>{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Endpoint + Issues */}
                <SectionLabel>Endpoint mapping</SectionLabel>
                <div style={css.grid2}>
                  <div style={css.panel}>
                    <div style={css.accentLine('#00e5a0')} />
                    <div style={css.panelTitle}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      Resolved endpoint
                    </div>
                    <div style={css.endpointPill}>
                      <MethodTag method={output.mapped_endpoint.method} />
                      <span style={css.pathText}>{output.mapped_endpoint.path}</span>
                    </div>
                  </div>

                  <div style={css.panel}>
                    <div style={css.accentLine('#f5a623')} />
                    <div style={css.panelTitle}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                      Schema issues
                    </div>
                    <div style={css.issueList}>
                      {output.schema_issues.map((issue, i) => (
                        <div key={i} style={css.issueRow}>
                          <div style={css.issueDot} />
                          {issue}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Test results */}
                <SectionLabel>Test results</SectionLabel>
                <div style={{ ...css.panel, marginBottom: 14 }}>
                  <div style={css.testGrid}>
                    {output.test_results.map((t, i) => {
                      const isPass = t.status === 200;
                      return (
                        <div key={i} style={css.testCard(isPass)}>
                          <div style={css.testTop}>
                            <span style={css.testEndpoint}>{t.endpoint}</span>
                            <span style={css.statusBadge(isPass)}>{t.status}</span>
                          </div>
                          <div style={css.testMsg}>{t.msg}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Raw JSON */}
                <SectionLabel>Raw output</SectionLabel>
                <div style={css.rawPanel}>
                  <div style={css.rawHeader}>
                    <div style={css.rawHeaderLeft}>
                      <MacDots />
                      agent_response.json
                    </div>
                    <button style={css.copyBtn(copied)} onClick={copyJson}>
                      {copied ? 'copied!' : 'copy'}
                    </button>
                  </div>
                  <pre style={css.rawBody}>
                    {JSON.stringify(output, null, 2)}
                  </pre>
                </div>

              </div>
            )}

            {/* Empty state */}
            {!output && !loading && (
              <div style={css.emptyState}>
                <div style={css.emptyBig}>&gt;_</div>
                <p style={{ fontSize: 13 }}>
                  Describe a business requirement above and hit RUN —<br />
                  the agent will map it to an endpoint and generate tests.
                </p>
                <p style={{ fontSize: 11, color: '#3a4050', marginTop: 10, fontFamily: "'JetBrains Mono', monospace" }}>
                  ⌘ + Enter to run
                </p>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
}