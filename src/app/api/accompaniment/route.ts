// app/api/accompaniment/route.ts

import { NextRequest } from 'next/server';
import api from '@/lib/api/test';

export const dynamic = 'force-dynamic'; // ✅ Node.js 기능 강제 활성화


export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const uuid = searchParams.get('uuid');

  if (!uuid) {
    return new Response(JSON.stringify({ error: 'uuid 쿼리 파라미터가 필요합니다.' }), {
      status: 400,
    });
  }

  try {
    const publicPath = await api.downloadAccompaniment(uuid);
    return new Response(JSON.stringify({ success: true, path: publicPath }), {
      status: 200,
    });
  } catch (err: any) {
    console.error('🎯 다운로드 실패:', err.message || err);
    return new Response(JSON.stringify({ error: '파일 다운로드 중 오류 발생' }), { status: 500 });
  }
}
