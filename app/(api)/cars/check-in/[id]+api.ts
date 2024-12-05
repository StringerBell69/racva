import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  const url = new URL(request.url);
  const carId = url.searchParams.get("carId");

  if (!id || !carId) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
     SELECT 
    a.nom_agence, 
    v.description,
    v.places, 
    v.price_per_day, 
    v.price_per_day_on_weekend,
    COUNT(r.rating) AS nb_avis, 
    ROUND(AVG(r.rating), 2) AS moyenne_rating
FROM 
    voiture v 
INNER JOIN 
    agence a ON a.id_agence = v.id_agence
LEFT JOIN 
    rentals r ON r.voiture_id = v.id_voiture AND r.agence_id = a.id_agence
WHERE 
    a.id_agence = ${id} 
    AND v.id_voiture = ${carId}
GROUP BY 
    a.nom_agence, v.description,v.places, 
    v.price_per_day, 
    v.price_per_day_on_weekend;

    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching car data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}
