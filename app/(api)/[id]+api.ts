import { neon } from "@neondatabase/serverless";

export async function GET(request: Request, { id }: { id: string }) {
  if (!id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const sql = neon(`${process.env.DATABASE_URL}`);

    // Use parameterized query to avoid direct template literals
    const response = await sql`
      WITH LastMessage AS (
    SELECT 
        m.chat_id,
        m.sender_id,
        m.message AS last_message,
        m.timestamp,
        ROW_NUMBER() OVER (PARTITION BY m.chat_id ORDER BY m.timestamp DESC) AS rn
    FROM 
        messages m
)
SELECT DISTINCT
    u.id AS user_id,
    u.name AS user_name,
    c.chat_id,
    m.recipient_id,
    other_user.name AS other_user_name,
    lm.last_message AS last_message_from_other_user,
    lm.timestamp AS last_message_timestamp
FROM 
    users u
JOIN 
    messages m ON u.id = m.sender_id OR u.id = m.recipient_id
JOIN 
    chats c ON c.chat_id = m.chat_id
LEFT JOIN 
    users other_user ON (other_user.id = m.sender_id AND other_user.id != u.id) 
                     OR (other_user.id = m.recipient_id AND other_user.id != u.id)
LEFT JOIN 
    LastMessage lm ON lm.chat_id = c.chat_id AND lm.sender_id = other_user.id AND lm.rn = 1
WHERE 
    u.clerk_id = ${id};

    `;

    return new Response(JSON.stringify({ data: response }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error ", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
