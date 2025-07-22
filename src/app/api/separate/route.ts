// app/api/separate/route.ts
import { NextRequest } from 'next/server';
import api from '@/lib/api/test';

export async function POST(req: NextRequest) {
  const body = await req.text(); // Extract the request body as a string
  const uuid = await api.requestSeparation(body); // 또는 requestSeparation_withdata()
  return new Response(JSON.stringify({ uuid }), { status: 200 });
}


