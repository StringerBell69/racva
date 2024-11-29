import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id?: string }) {
  // Initialize SQL connection
  const sql = neon(`${process.env.DATABASE_URL}`);

  try {
    if (!id) {
      return Response.json(
        { error: "Missing required parameter: id" },
        { status: 400 }
      );
    }

    // Convert id to an integer (assuming id is expected to be an integer)
    const agencyId = parseInt(id, 10);

    if (isNaN(agencyId)) {
      return Response.json({ error: "Invalid id format" }, { status: 400 });
    }

    const response = await sql`
      SELECT v.*, a.latitude, a.longitude
      FROM voiture v
      JOIN agence a ON v.id_agence = a.id_agence
      WHERE v.id_agence = ${agencyId}
    `;

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
