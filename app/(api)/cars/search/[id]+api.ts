import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id?: string }) {
  const url = new URL(request.url);
  const userLongitude = url.searchParams.get("longitude");
  const userLatitude = url.searchParams.get("latitude");

  // Validate required query parameters
  if (!userLongitude || !userLatitude) {
    return Response.json(
      { error: "Missing required parameters: latitude and/or longitude" },
      { status: 400 }
    );
  }

  // Initialize SQL connection
  const sql = neon(`${process.env.DATABASE_URL}`);

  try {
    let response;

    if (!id) {
      // Fetch all cars within a 50km radius when `id` is not provided
      response = await sql`
        SELECT v.*, v.modele, v.marque, a.latitude, a.longitude
        FROM voiture v
        JOIN agence a ON v.id_agence = a.id_agence
        WHERE (
          6371 * acos(
              cos(radians(${userLatitude})) *
              cos(radians(a.latitude)) *
              cos(radians(a.longitude) - radians(${userLongitude})) +
              sin(radians(${userLatitude})) *
              sin(radians(a.latitude))
          )
        ) <= 50
        LIMIT 10;
      `;
    } else {
      // Fetch filtered cars when `id` is provided
      response = await sql`
        SELECT v.*, v.modele, v.marque, a.latitude, a.longitude
        FROM voiture v
        JOIN agence a ON v.id_agence = a.id_agence
        WHERE (
          6371 * acos(
              cos(radians(${userLatitude})) *
              cos(radians(a.latitude)) *
              cos(radians(a.longitude) - radians(${userLongitude})) +
              sin(radians(${userLatitude})) *
              sin(radians(a.latitude))
          )
        ) <= 50 
        AND (
          v.marque ILIKE '%' || ${id} || '%' 
          OR v.modele ILIKE '%' || ${id} || '%'
        )
        LIMIT 10;
      `;
    }

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
