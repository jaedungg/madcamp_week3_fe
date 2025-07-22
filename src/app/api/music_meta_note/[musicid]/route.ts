// app/api/music_meta_note/[musicid]/route.ts
import { NextRequest } from 'next/server';
import api from '@/lib/api/test';

export async function GET(
  req: NextRequest,
  { params }: { params: { musicid: string } }
) {
  try {
    const res = await fetch(`http://172.20.12.58:80/music_meta_note/${params.musicid}`);
    if (!res.ok) throw new Error('Failed to fetch music notes');
  
    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
