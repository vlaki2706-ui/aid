"use client";

export const dynamic = "force-dynamic"; ,export const dynamic = "force-dynamic";"use client";

import { useState, useRef } from "react";

const STYLES = ["Realistično", "Cinematično", "Animirano", "Anime"];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [status, setStatus] = useState("idle"); // idle | starting | processing | succeeded | failed
  const [videoUrl, setVideoUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const pollRef = useRef(null);

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setErrorMsg(null);
    setVideoUrl(null);
    setStatus("starting");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMsg(data.error || "Nešto nije uspelo.");
        setStatus("failed");
        return;
      }

      setStatus("processing");
      pollStatus(data.id);
    } catch (e) {
      setErrorMsg("Greška u konekciji. Pokušaj ponovo.");
      setStatus("failed");
    }
  }

  function pollStatus(id) {
    pollRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/status?id=${id}`);
        const data = await res.json();

        if (data.status === "succeeded") {
          clearInterval(pollRef.current);
          const out = Array.isArray(data.output) ? data.output[0] : data.output;
          setVideoUrl(out);
          setStatus("succeeded");
        } else if (data.status === "failed" || data.status === "canceled") {
          clearInterval(pollRef.current);
          setErrorMsg(data.error || "Generisanje nije uspelo.");
          setStatus("failed");
        }
        // otherwise still "starting" / "processing" — keep polling
      } catch (e) {
        clearInterval(pollRef.current);
        setErrorMsg("Prekinuta konekcija tokom generisanja.");
        setStatus("failed");
      }
    }, 3000);
  }

  const isBusy = status === "starting" || status === "processing";

  return (
    <div style={styles.frame}>
      <style>{globalCss}</style>

      <header style={styles.header}>
        <div style={styles.wordmark}>
          <span style={styles.recDot} /> KADR
        </div>
      </header>

      <div style={styles.eyebrow}>Tekst → Video</div>
      <h1 style={styles.h1}>
        Opiši scenu.
        <br />
        Dobij snimak.
      </h1>
      <p style={styles.sub}>Ukucaj šta želiš da vidiš. AI generiše pravi video.</p>

      <label style={styles.label}>Opis scene</label>
      <textarea
        style={styles.textarea}
        placeholder="npr. mačka trči po plaži u zalasku sunca, usporeni snimak"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        disabled={isBusy}
      />

      <label style={styles.label}>Stil</label>
      <div style={styles.chipRow}>
        {STYLES.map((s) => (
          <div
            key={s}
            onClick={() => !isBusy && setStyle(s)}
            style={{ ...styles.chip, ...(style === s ? styles.chipActive : {}) }}
          >
            {s}
          </div>
        ))}
      </div>

      <button
        style={{ ...styles.goBtn, ...(isBusy ? styles.goBtnDisabled : {}) }}
        onClick={handleGenerate}
        disabled={isBusy}
      >
        {isBusy ? "RADI..." : "▶ GENERIŠI"}
      </button>

      {status !== "idle" && (
        <div style={styles.stage}>
          {isBusy && (
            <div style={styles.renderBox}>
              <div style={styles.renderLabel}>RENDERUJE SE</div>
              <div style={styles.renderSub}>Ovo može potrajati minut ili dva...</div>
            </div>
          )}

          {status === "succeeded" && videoUrl && (
            <div>
              <video src={videoUrl} controls style={styles.video} />
              <div style={styles.resultActions}>
                <a href={videoUrl} download style={styles.actionBtnPrimary}>
                  PREUZMI
                </a>
                <div style={styles.actionBtn} onClick={handleGenerate}>
                  GENERIŠI PONOVO
                </div>
              </div>
            </div>
          )}

          {status === "failed" && (
            <div style={styles.errorBox}>{errorMsg || "Nešto nije uspelo."}</div>
          )}
        </div>
      )}

      <div style={styles.footerTc}>KADR © 2026</div>
    </div>
  );
}

const globalCss = `
  * { box-sizing: border-box; }
  body { font-family: 'Inter', system-ui, sans-serif; }
  textarea:focus { outline: none; border-color: #2f6e68 !important; }
`;

const styles = {
  frame: {
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    padding: "18px 18px 48px",
    color: "#eef1ef",
  },
  header: {
    padding: "6px 2px 22px",
    borderBottom: "1px solid #2a3833",
    marginBottom: 24,
  },
  wordmark: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: 3,
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  recDot: {
    width: 9,
    height: 9,
    borderRadius: "50%",
    background: "#e2543f",
    display: "inline-block",
  },
  eyebrow: {
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 2,
    textTransform: "uppercase",
    color: "#4fd1c5",
    marginBottom: 8,
  },
  h1: { fontSize: 28, lineHeight: 1.1, margin: "0 0 6px" },
  sub: { color: "#a9b6b1", fontSize: 14, marginBottom: 24 },
  label: {
    display: "block",
    fontFamily: "monospace",
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    color: "#a9b6b1",
    marginBottom: 8,
    marginTop: 18,
  },
  textarea: {
    width: "100%",
    background: "#16201d",
    border: "1px solid #2a3833",
    borderRadius: 10,
    color: "#eef1ef",
    fontSize: 15,
    padding: 14,
    minHeight: 92,
    resize: "none",
  },
  chipRow: { display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 },
  chip: {
    fontFamily: "monospace",
    fontSize: 12,
    padding: "8px 13px",
    borderRadius: 20,
    border: "1px solid #2a3833",
    background: "#16201d",
    color: "#a9b6b1",
    cursor: "pointer",
  },
  chipActive: { borderColor: "#4fd1c5", color: "#4fd1c5", background: "rgba(79,209,197,0.08)" },
  goBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #4fd1c5 0%, #3bb8ab 100%)",
    color: "#06110e",
    border: "none",
    borderRadius: 10,
    padding: 16,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 2,
    cursor: "pointer",
    marginTop: 22,
  },
  goBtnDisabled: { opacity: 0.5, cursor: "not-allowed" },
  stage: {
    marginTop: 28,
    borderRadius: 12,
    border: "1px solid #2a3833",
    background: "#16201d",
    overflow: "hidden",
    padding: 16,
  },
  renderBox: { textAlign: "center", padding: "30px 10px" },
  renderLabel: { fontSize: 18, letterSpacing: 2, color: "#4fd1c5", marginBottom: 6 },
  renderSub: { fontSize: 12, color: "#a9b6b1", fontFamily: "monospace" },
  video: { width: "100%", borderRadius: 8, display: "block" },
  resultActions: { display: "flex", gap: 10, marginTop: 14 },
  actionBtnPrimary: {
    flex: 1,
    background: "#1c2823",
    border: "1px solid #7a5236",
    color: "#e8935a",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
    padding: 11,
    borderRadius: 8,
    textAlign: "center",
    textDecoration: "none",
  },
  actionBtn: {
    flex: 1,
    background: "#1c2823",
    border: "1px solid #2a3833",
    color: "#eef1ef",
    fontFamily: "monospace",
    fontSize: 12,
    letterSpacing: 1,
    padding: 11,
    borderRadius: 8,
    textAlign: "center",
    cursor: "pointer",
  },
  errorBox: { color: "#e2543f", fontSize: 13, textAlign: "center", padding: 10 },
  footerTc: {
    textAlign: "center",
    marginTop: 24,
    fontFamily: "monospace",
    fontSize: 10,
    letterSpacing: 1.5,
    color: "#3d4a45",
  },
};
