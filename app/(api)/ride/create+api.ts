import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id_agence,
      id_voiture,
      start,
      end,
      amount,
      payment_status,
      user_id,
    } = body;

    if (
      (!id_agence || !id_voiture || !start || !end) && 
      (
        !payment_status ||
        !user_id) 
    ) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const sql = neon(`${process.env.DATABASE_URL}`);
    

    const response = await sql`
    INSERT INTO rentals (
      rental_id,
      voiture_id, 
      customer_id, 
      agence_id, 
      rental_start, 
      rental_end, 
      amount, 
      paid, 
      status, 
      created_at
    )
    VALUES (
      (SELECT MAX(rental_id) FROM rentals) + 1,
      ${id_voiture}, 
      (SELECT id FROM users WHERE clerk_id = ${user_id}),
      ${id_agence},
      ${start}::TIMESTAMP, 
      ${end}::TIMESTAMP, 
      ${amount},
      TRUE, 
      'upcoming', 
      CURRENT_TIMESTAMP
    )
    RETURNING *;

    `;

    return Response.json({ data: response[0] }, { status: 201 });
  } catch (error) {
    console.error("Error inserting data into recent_rides:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
