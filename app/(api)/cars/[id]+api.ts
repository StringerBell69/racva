import { data } from "@/constants";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id)
    return Response.json({ error: "Missing required fields" }, { status: 400 });

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
       
        SELECT *
        FROM voiture WHERE id_agence = 
        (SELECT id_agence from users WHERE clerk_id =${id})`;


    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
