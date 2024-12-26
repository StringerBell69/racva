import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Updated query to include more information
    const response = await sql`
      SELECT 
        rentals.rental_id AS id,
        rentals.rental_start AS date, 
        rentals.rental_end AS date_end, 
        rentals.status, 
        rentals.paid, 
        rentals.amount,
        users.name AS renter,
        users.email AS renter_email,
        users.telephone AS renter_phone,
        voiture.marque AS vehicle_brand,
        voiture.modele AS vehicle_model,
        voiture.id_voiture AS vehicle_id,
        voiture.description AS vehicle_condition,
        agence.nom_agence AS agency_name,
        agence.adresse AS agency_address,
        agence.telephone AS agency_phone,
        agence.email AS agency_email
      FROM 
        rentals
        JOIN users ON rentals.customer_id = users.id
        JOIN voiture ON rentals.voiture_id = voiture.id_voiture
        JOIN agence ON rentals.agence_id = agence.id_agence
      WHERE 
        rentals.voiture_id = ${id}
      ORDER BY 
        ABS(EXTRACT(EPOCH FROM (rentals.rental_start::timestamp - CURRENT_DATE::timestamp))) ASC
      OFFSET 1`;

    if (response.length === 0) {
      return Response.json(
        { error: "No rental found for this vehicle" },
        { status: 404 }
      );
    }

    return Response.json({ data: response });
  } catch (error) {
    console.error("Error fetching recent cars:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
