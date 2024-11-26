import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Parse the request JSON data
   const {
     marque,
     modele,
     annee,
     disponible,
     photo_url,
     photo1,
     photo2,
     photo3,
     userId,
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

   // Additional validation for new price fields (optional, depending on your requirements)
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

   // Use a parameterized query to securely insert data
   const response = await sql`
  INSERT INTO voiture (
    marque,
    id_agence,
    modele,
    annee,
    disponible,
    photo_url,
    photo1,
    photo2,
    photo3,
    price_per_day,
    price_per_week,
    price_per_day_on_weekend,
    price_full_weekend
  )
  VALUES (
    ${marque},
    (SELECT id_agence FROM users WHERE clerk_id = ${userId}),
    ${modele},
    ${annee},
    ${disponible},
    ${photo_url || null},
    ${photo1 || null},
    ${photo2 || null},
    ${photo3 || null},
    ${price_per_day || null},                  
    ${price_per_week || null},
    ${price_per_day_on_weekend || null},
    ${price_full_weekend || null}
  )
  RETURNING *;
`;

    // Return the successful response
    return new Response(
      JSON.stringify({
        success: true,
        data: response[0], // Return the first item from the result
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("Error inserting data into voitures:", error);

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
