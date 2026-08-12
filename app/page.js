
"use client";

import { useState, useRef } from "react";

const STYLES = ["Realistično", "Cinematično", "Animirano", "Anime"];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState(STYLES[0]);
  const [status, setStatus] = useState("idle");
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
        body: JSON.stringify
          ({ pr
