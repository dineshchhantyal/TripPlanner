export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const origin = params.get("origin");
  const destination = params.get("destination");

  if (!origin || !destination) {
    return new Response("Missing origin or destination parameter", {
      status: 400,
    });
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.GOOGLE_PLACE_API}`
  );
  try {
    const data = await response.json();

    console.log(data);
    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    return new Response(e.message, { status: 500 });
  }
}
