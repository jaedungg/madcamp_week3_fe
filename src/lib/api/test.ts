import axios, { AxiosResponse } from 'axios';
import FormData from 'form-data';
import fs from 'fs';
import path from 'path';

async function requestSeparation(youtube_url?: string): Promise<string> {
  const form = new FormData();
  form.append('youtube_url', youtube_url ?? 'https://www.youtube.com/watch?v=PAE88urB1xs');

  const response: AxiosResponse = await axios.post(
    'http://172.20.12.58:80/accompaniment_with_ytlink',
    form,
    { headers: form.getHeaders() }
  );

  const uuid: string = response.data.uuid;
  return uuid;
}

async function requestSeparation_withdata(): Promise<string> {
  const form = new FormData();
  form.append('audio', fs.createReadStream('urrm.mp3'));

  const response: AxiosResponse = await axios.post(
    'http://172.20.12.58:80/accompaniment',
    form,
    { headers: form.getHeaders() }
  );

  const uuid: string = response.data.uuid;
  return uuid;
}

async function downloadAccompaniment(uuid: string): Promise<string> {
  const url = `http://172.20.12.58:80/get_accompaniment?musicid=${uuid}`;
  const response: AxiosResponse = await axios.get(url, { responseType: 'stream' });

  const outDir = path.join(process.cwd(), 'public', 'downloads');
  const outPath = path.join(outDir, `${uuid}.mp3`);
  fs.mkdirSync(outDir, { recursive: true });

  const writer = fs.createWriteStream(outPath);
  response.data.pipe(writer);

  await new Promise<void>((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });

  return `/downloads/${uuid}.mp3`; // ✅ 클라이언트가 접근할 수 있는 경로 반환
}

async function separateAndDownload(): Promise<void> {
  const uuid: string = await requestSeparation_withdata(); // Step 1
  if (!uuid) {
    console.error('uuid 획득 실패');
    return;
  }
  console.log(uuid, 'uuid 이렇다다');
  await downloadAccompaniment(uuid); // Step 2
}

async function getrank(): Promise<void> {
  try {
    const response: AxiosResponse = await axios.get('http://172.20.12.58:80/genie-chart');
    console.log(response.data);
  } catch (err: any) {
    console.error('요청 실패:', err.message);
  }
}

async function addUser(): Promise<void> {
  const data = {
    userid: 'testuser',
    passwd: '1234',
    nickname: '테스트계정',
  };

  try {
    const res: AxiosResponse = await axios.post('http://172.20.12.58:80/add-user', data);
    console.log(res.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

async function addMusic(): Promise<void> {
  const data = {
    artist: '노라조조',
    title: '락앤롤',
    accompaniment_path: './././././',
  };

  try {
    const res: AxiosResponse = await axios.post('http://172.20.12.58:80/add-music', data);
    console.log(res.data);
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

//addMusic();
//addUser();
//getrank();
// separateAndDownload();

export default {
  requestSeparation,
  requestSeparation_withdata,
  downloadAccompaniment,
  separateAndDownload,
  getrank,
  addUser,
  addMusic,
  // 다른 함수들도 필요시 추가
  // 예: uploadAudioFile, uploadYoutubeLink 등
  // 이 함수들은 Node.js 환경에서만 사용 가능하므로 웹에서는 직접 호출하지 않음
  // 웹 환경에서는 requestSeparation_withdata()와 같은 함수를 사용하여
  // 파일 업로드를 처리해야 함
  // 예: 웹에서 파일 업로드 후 requestSeparation_withdata() 호출
}