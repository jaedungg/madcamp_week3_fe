// app/api/all_musics/route.ts

export async function GET() {
  try {
    const res = await fetch(`http://172.20.12.58:80/all_musics`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Flask API error: ${res.status} ${errorText}`);
    }

    const data = await res.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err: any) {
    console.error('[Get all musics API error]', err); // 여기에 로그도 찍고
    return new Response(JSON.stringify({ error: err.message || 'Unknown error' }), {
      status: 500,
    });
  }
}

