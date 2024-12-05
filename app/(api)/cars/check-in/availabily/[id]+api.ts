import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  const url = new URL(request.url);
  const id_agence = url.searchParams.get("id_agence");


  if (!id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
            WITH calendar AS (
    SELECT generate_series(
        date_trunc('day', now())::date, 
        date_trunc('day', now() + INTERVAL '6 months')::date, 
        '1 day'::INTERVAL
    ) AS day
),
booked_days AS (
    SELECT generate_series(
        r.rental_start::date, 
        r.rental_end::date, 
        '1 day'::INTERVAL
    ) AS day
    FROM rentals r
    INNER JOIN voiture v ON r.voiture_id = v.id_voiture
    WHERE r.voiture_id = ${id} 
      AND v.id_agence = ${id_agence}
),
all_days AS (
    SELECT c.day, CASE WHEN b.day IS NOT NULL THEN TRUE ELSE FALSE END AS is_booked
    FROM calendar c
    LEFT JOIN booked_days b ON c.day = b.day
)
SELECT day AS booked_day
FROM all_days
WHERE is_booked = TRUE
ORDER BY day;


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
