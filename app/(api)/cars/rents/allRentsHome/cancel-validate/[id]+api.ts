import { useUser } from "@clerk/clerk-expo";
import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {

  const url = new URL(request.url);
  const value = url.searchParams.get("response");
    const userId = url.searchParams.get("userId");


  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
  UPDATE rentals
  SET validate = CASE WHEN ${value} = 'TRUE' THEN TRUE ELSE FALSE END
  WHERE agence_id = (
    SELECT id_agence FROM users WHERE clerk_id = ${userId}
  )
  AND rental_id = ${id};
`;


    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
