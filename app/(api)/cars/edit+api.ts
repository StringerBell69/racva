import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Parse the request JSON data
    const {
      id_voiture,
      id_agence,
      marque,
      modele,
      annee,
      disponible,
      price_per_day,
      price_per_week,
      price_per_day_on_weekend,
      price_full_weekend,
    } = await request.json();

    // Validate required fields
    if (!marque || !modele || !annee || disponible === undefined) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields",
          details: {
            marque: !marque,
            modele: !modele,
            annee: !annee,
            disponible: disponible === undefined,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Additional validation for new price fields
    if (
      price_per_day === undefined ||
      price_per_week === undefined ||
      price_per_day_on_weekend === undefined ||
      price_full_weekend === undefined
    ) {
      return new Response(
        JSON.stringify({
          error: "Missing required pricing fields",
          details: {
            price_per_day: price_per_day === undefined,
            price_per_week: price_per_week === undefined,
            price_per_day_on_weekend: price_per_day_on_weekend === undefined,
            price_full_weekend: price_full_weekend === undefined,
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Correct the SQL UPDATE query with parameterized values
    const response = await sql`
      UPDATE voiture
      SET
        marque = ${marque},
        modele = ${modele},
        annee = ${annee},
        disponible = ${disponible},
        price_per_day = ${price_per_day || null},
        price_per_week = ${price_per_week || null},
        price_per_day_on_weekend = ${price_per_day_on_weekend || null},
        price_full_weekend = ${price_full_weekend || null}
      WHERE
        id_agence = ${id_agence}
        AND id_voiture = ${id_voiture}
      RETURNING *;
    `;

    // Return the successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: response[0], // Return the first item from the result
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error updating data in voiture:", error);

    // Return an error response
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
