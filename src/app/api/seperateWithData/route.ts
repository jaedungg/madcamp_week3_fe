// app/api/separateWithData/route.ts
import { NextRequest } from 'next/server';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import api from '@/lib/api/test';

export const config = {
  api: {
    bodyParser: false,
    sizeLimit: '50mb', 
  },
};

export async function POST(req: NextRequest) {
  try {
    const form = new IncomingForm({ keepExtensions: true });
    const data: any = await new Promise((resolve, reject) => {
      form.parse(req as any, (err: any, fields: any, files: any) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const file = data?.files?.audio;
    if (!file) {
      return new Response(JSON.stringify({ error: '파일이 업로드되지 않았습니다.' }), { status: 400 });
    }

    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
    const uuid = await api.requestSeparation_withdata(filePath);

    return new Response(JSON.stringify({ uuid }), { status: 200 });
  } catch (err: any) {
    console.error('파일 처리 중 에러:', err);
    return new Response(JSON.stringify({ error: '서버 오류 발생' }), { status: 500 });
  }
}
