export async function POST(req) {
  const token = process.env.REPLICATE_API_TOKEN;

  if (!token) {
    return Response.json(
      { error: "REPLICATE_API_TOKEN nije podešen. Dodaj ga u Vercel → Settings → Environment Variables." },
      { status: 500 }
    );
  }

  const { prompt, style } = await req.json();

  if (!prompt || !prompt.trim()) {
    return Response.json({ error: "Nedostaje opis scene." }, { status: 400 });
  }

  const fullPrompt = style ? `${prompt}, stil: ${style}` : prompt;

  const res = await fetch(
    "https://api.replicate.com/v1/models/minimax/video-01/predictions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ input: { prompt: fullPrompt } }),
    }
  );

  const data = await res.json();

  if (!res.ok) {
    return Response.json(
      { error: data.detail || "Replicate je odbio zahtev. Proveri da li je kartica dodata na nalogu." },
      { status: res.status }
    );
  }

  return Response.json({ id: data.id, status: data.status });
}
