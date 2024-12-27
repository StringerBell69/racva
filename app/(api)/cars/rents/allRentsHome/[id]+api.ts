import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
       
        SELECT 
          rentals.rental_id AS id,
          rentals.rental_start AS date, 
          rentals.rental_end AS date_end, 
          rentals.status, 
          rentals.paid, 
          rentals.amount,
          (SELECT concat(marque, ' ', modele) FROM voiture WHERE id_voiture = rentals.voiture_id) AS renter
      FROM 
          rentals
      JOIN 
          users ON rentals.customer_id = users.id
      WHERE rentals.agence_id = (SELECT id_agence FROM users WHERE clerk_id = ${id})
      AND rentals.validate IS NULL
      ORDER BY 
          rentals.created_at DESC
          ;`;
    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
