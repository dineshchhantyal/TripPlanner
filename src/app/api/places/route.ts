export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const place = params.get("query");

  if (!place) {
    return new Response("Missing place parameter", { status: 400 });
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${place}&key=${process.env.GOOGLE_PLACE_API}&radius=50000`
  );
  try {
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
}
