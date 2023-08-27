export async function GET(request: Request) {
  // destination&origin&units&transit_mode&mode&departure_time
  const url = new URL(request.url);
  const params = url.searchParams;
  const origin = params.get("origin");
  const destination = params.get("destination");
  const units = params.get("units") || "metric"; // metric, imperial
  const transit_mode = params.get("transit_mode") || "bus"; // bus, subway, train, tram, rail
  const mode = params.get("mode") || "driving"; // driving, walking, bicycling, transit
  const departure_time = params.get("departure_time") || "now"; // seconds since midnight, January 1, 1970 UTC.

  if (!origin || !destination) {
    return new Response("Missing origin or destination parameter", {
      status: 400,
    });
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&key=${process.env.NEXT_PUBLIC_GOOGLE_PLACE_API}&units=${units}&transit_mode=${transit_mode}&mode=${mode}&departure_time=${departure_time}`
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
