import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const response = await sql`
       SELECT 
        rentals.rental_id AS id,
        rentals.rental_start AS rental_start_date, 
        rentals.rental_end AS rental_end_date, 
        rentals.status, 
        rentals.paid, 
        rentals.amount,
        rentals.amount AS rental_price, -- for contract generation
        rentals.agence_id,
        users.name AS renter,
        users.email AS renter_email,
        users.telephone AS renter_phone,
        users.id AS renter_id,
        users.clerk_id,
        voiture.marque AS vehicle_brand,
        voiture.modele AS vehicle_model,
        voiture.id_voiture AS vehicle_id,
        voiture.photo_url AS vehicle_photo_url,
        voiture.price_per_day,
        voiture.price_per_week,
        voiture.price_per_day_on_weekend,
        voiture.price_full_weekend,
        voiture.description AS vehicle_description,
        agence.nom_agence AS agency_name,
        agence.adresse AS agency_address,
        agence.telephone AS agency_phone,
        agence.email AS agency_email
      FROM 
        rentals
        JOIN users ON rentals.customer_id = users.id
        JOIN voiture AS voiture ON rentals.voiture_id = voiture.id_voiture
        JOIN agence AS agence ON rentals.agence_id = agence.id_agence
      WHERE 
        rentals.voiture_id = ${id}
      AND rentals.validate = TRUE
      ORDER BY 
        ABS(EXTRACT(EPOCH FROM (rentals.rental_start::timestamp - CURRENT_DATE::timestamp))) ASC
      LIMIT 1
    
    `;
    return Response.json({ data: response });

  } catch (error) {
    console.error("Error fetching recent rentals:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
