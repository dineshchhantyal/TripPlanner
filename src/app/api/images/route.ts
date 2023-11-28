export async function GET(request: Request) {
  // https://api.pexels.com/v1/search?query=${query}
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");
  try {
    const req = await fetch("https://api.pexels.com/v1/search?query=" + query, {
      headers: {
        Authorization: process.env.PEXELS_API_KEY ?? "",
      },
    });
    const data = await req.json();
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
}
