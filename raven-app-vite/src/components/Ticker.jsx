export function Ticker() {
  const items = [
    "80% of small businesses had a cyberattack in 2025",
    "One attack every 11 seconds globally",
    "$120,000 average breach cost for SMBs",
    "41% of SMB attacks were AI-powered",
    "3.4 billion phishing emails sent daily",
    "95% of breaches caused by human error",
    "80% of small businesses have no security policy",
  ];
  const doubled = [...items, ...items];
  return (
    <div style={{
      background: "var(--bg)",
      borderTop: "1px solid var(--border2)",
      borderBottom: "1px solid var(--border2)",
      padding: "16px 0",
      overflow: "hidden",
      display: "flex",
      position: "relative",
    }}>
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(90deg, var(--bg), transparent)", zIndex: 10
      }} />
      <div style={{
        position: "absolute", right: 0, top: 0, bottom: 0, width: 80,
        background: "linear-gradient(-90deg, var(--bg), transparent)", zIndex: 10
      }} />
      
      <div style={{
        display: "flex", gap: 80, whiteSpace: "nowrap",
        animation: "ticker 32s linear infinite"
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            fontFamily: "var(--font-mono)", fontSize: 13,
            letterSpacing: "0.1em", color: "var(--text3)",
            display: "flex", alignItems: "center", gap: 16
          }}>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "var(--accent)" }} />
            {item}
          </span>
        ))}
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
      `}} />
    </div>
  );
}
