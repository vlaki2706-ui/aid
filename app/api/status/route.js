export async function GET(req) {
  const token = process.env.REPLICATE_API_TOKEN;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return Response.json({ error: "Nedostaje id predikcije." }, { status: 400 });
  }

  const res = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json();

  if (!res.ok) {
    return Response.json({ error: data.detail || "Greška pri proveri statusa." }, { status: res.status });
  }

  return Response.json({
    status: data.status,
    output: data.output,
    error: data.error,
  });
}
