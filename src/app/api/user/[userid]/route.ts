// app/api/user/[userid]/route.ts
import { NextRequest } from 'next/server';
import api from '@/lib/api/test';

export async function GET(
  req: NextRequest,
  context: { params: { userid: string } }
) {
  const { userid } = context.params;
  try {
    const res = await fetch(`http://172.20.12.58:80/users/${userid}`);
    if (!res.ok) throw new Error('Failed to fetch user data');
  
    const data = await res.json();

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userid: string } }
) {
  try {
    const body = await req.json();

    const res = await fetch(`http://172.20.12.58:80/users/${params.userid}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    
    if (!res.ok) {
      return new Response(JSON.stringify({ error: data.error || 'Failed to update user' }), {
        status: res.status,
      });
    }

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message || 'Unknown error' }),
      { status: 500 }
    );
  }
}