import { neon } from "@neondatabase/serverless";

export async function DELETE(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Parse the request body
    const { voiture_id, rental_start, rental_end, user_id } =
      await request.json();

    console.log("Request Body:", {
      voiture_id,
      rental_start,
      rental_end,
      user_id,
    });

    // Adjust rental start and end to local France timezone (Europe/Paris)
    const parsedRentalStart = new Date(rental_start).toLocaleDateString(
      "en-CA",
      { timeZone: "Europe/Paris" }
    );
    const parsedRentalEnd = new Date(rental_end).toLocaleDateString("en-CA", {
      timeZone: "Europe/Paris",
    });

    console.log("Parsed Dates:", { parsedRentalStart, parsedRentalEnd });

    // Validate inputs
    if (!voiture_id || !parsedRentalStart || !parsedRentalEnd || !user_id) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: voiture_id, rental_start, rental_end, and user_id",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch the customer_id from the users table
    const userResponse = await sql`
      SELECT id FROM users WHERE clerk_id = ${user_id};
    `;
    const customer_id = userResponse.length > 0 ? userResponse[0].id : null;

    if (!customer_id) {
      return new Response(
        JSON.stringify({
          error: "User not found",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    console.log("Customer ID:", customer_id);

    // Delete the rental record using voiture_id, parsedRentalStart, parsedRentalEnd, and customer_id
    const deleteResponse = await sql`
      DELETE FROM rentals
      WHERE voiture_id = ${voiture_id}
        AND rental_start::DATE = ${parsedRentalStart}::DATE
        AND rental_end::DATE = ${parsedRentalEnd}::DATE
        AND customer_id = ${customer_id}
      RETURNING *;
    `;

    console.log("Delete Response:", deleteResponse);

    // Success response
    return new Response(
      JSON.stringify({
        message: "Rental successfully deleted",
        deletedRental: deleteResponse[0],
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error deleting rental:", error);
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
