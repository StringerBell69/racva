import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
      SELECT SUM(amount) AS paid_count
      FROM rentals
      WHERE voiture_id = ${id} 
      AND rental_start >= DATE_TRUNC('week', CURRENT_DATE) 
      AND rental_end < DATE_TRUNC('week', CURRENT_DATE) + INTERVAL '1 week';
    `;
    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


