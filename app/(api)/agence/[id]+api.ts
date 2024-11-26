import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT
        nom_agence AS first_name,
        latitude,
        longitude
      FROM 
        agence
      WHERE 
        id_agence = (
          SELECT id_agence FROM users WHERE clerk_id = ${id}
        )
    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching agency data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
