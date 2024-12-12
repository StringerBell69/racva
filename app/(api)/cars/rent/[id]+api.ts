import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
       
        SELECT 
    rentals.rental_start AS rental_start_date, 
        rentals.rental_end AS rental_end_date, 
            rentals.status, 
                rentals.paid, 
                    rentals.amount,
                        users.name AS renter
                        FROM 
                            rentals
                            JOIN 
                                users ON rentals.customer_id = users.id
                                WHERE 
                                    rentals.voiture_id = ${id}
                                    ORDER BY 
                                        ABS(EXTRACT(EPOCH FROM (rentals.rental_start::timestamp - CURRENT_DATE::timestamp))) ASC
                                        LIMIT 1`;
    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
