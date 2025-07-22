// app/api/user/route.ts

import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const userData = await req.json();

    const res = await fetch(`http://172.20.12.58:80/add-user`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Flask error: ${res.status} - ${errorText}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500 }
    );
  }
}
