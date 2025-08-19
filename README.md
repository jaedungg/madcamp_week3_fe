# 🎤 Pitch 못할 사정: AI 기반 온라인 노래방

> **언제 어디서든 부를 수 있는, AI 기반 실시간 채점 노래방 서비스**

---

## 📌 Introduction

- 노래방 가기 귀찮을 때  
- 내가 좋아하는 곡이 노래방에 없을 때  
- 퍼펙트스코어 모드를 집에서 사용하고 싶을 때

**Pitch 못할 사정**은 사용자의 음성을 분석하고 실시간 피드백을 제공하는 온라인 노래방 플랫폼입니다.

---

## 👥 Team

| 이름   | 소속 및 학번           | 이메일                         | GitHub                           |
|--------|------------------------|--------------------------------|----------------------------------|
| 김승준 | KAIST 전산학부 21학번 | dmsdmswns@kaist.ac.kr          | [@k1shooter](https://github.com/k1shooter) |
| 이재현 | KAIST 전산학부 22학번 | jh5323565@kaist.ac.kr          | [@jaedungg](https://github.com/jaedungg)   |

---

## 🧱 Architecture

<img width="80%" alt="Architecture" src="https://github.com/user-attachments/assets/c882bcad-08d8-4f0f-9938-b1c1b5ad882c" />

### 핵심 기술 스택

- **YouTube Data API**: 검색 쿼리로 최적의 영상 추출  
- **yt_dlp**: YouTube에서 오디오 다운로드  
- **OpenAI Whisper**: 음성 기반 가사 추출 (시계열)  
- **Spleeter**: 보컬/반주 분리  
- **Librosa**: pitch 시계열 분석  

<details>
<summary>📄 ERD 보기</summary>

```sql
CREATE TABLE IF NOT EXISTS users (
    userid VARCHAR(100) PRIMARY KEY,
    passwd VARCHAR(100) NOT NULL,
    nickname VARCHAR(100),
    profile_url VARCHAR(300),
    is_online BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS musics (
    musicid VARCHAR(255) NOT NULL PRIMARY KEY,
    title VARCHAR(255),
    artist VARCHAR(100),
    genre VARCHAR(100),
    accompaniment_path VARCHAR(300),
    created_at TIMESTAMP DEFAULT NOW()
);


CREATE TABLE IF NOT EXISTS music_meta (
    musicid VARCHAR(255) NOT NULL PRIMARY KEY,
    pitch_vector FLOAT8[],
    onset_times FLOAT8[],
    lyrics TEXT
);

CREATE TABLE IF NOT EXISTS challenges (
    challengeid SERIAL NOT NULL PRIMARY KEY,
    title VARCHAR(255),
    descript VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS user_challenges(
    usrchalid SERIAL PRIMARY KEY,
    userid VARCHAR(100),
    challengeid SERIAL NOT NULL
);

CREATE TABLE IF NOT EXISTS user_records(
    recordid SERIAL PRIMARY KEY,
    userid VARCHAR(100),
    musicid VARCHAR(255),
    score FLOAT,
    audio_url VARCHAR(300),
    pitch_vector FLOAT8[],
    onset_times FLOAT8[],
    created_at TIMESTAMP DEFAULT NOW()
);
```
</details>

---

## 🚀 Features

### Tab 0: Login

- 로그인 필요 (회원가입 필수)  
<img width="80%" src="https://github.com/user-attachments/assets/f18bd210-33a9-4538-89f9-aa28409a2a40" />  
<img width="80%" src="https://github.com/user-attachments/assets/fac1f6ca-14db-4d80-b68d-2ca2ed220478" />


### Tab 1: Music Ranking

- 실시간 지니차트 기반 최신 곡 50위 제공  
- 클릭 시 해당 YouTube 링크 복사  
<img width="80%" src="https://github.com/user-attachments/assets/aa3a53b6-406a-4f97-b0dc-080ba7274c2a" />


### Tab 2: Fast Karaoke

- 분석 완료된 곡을 빠르게 노래할 수 있는 바로 부르기  
<img width="80%" src="https://github.com/user-attachments/assets/aa3a53b6-406a-4f97-b0dc-080ba7274c2a" />


### Tab 3-1: Music Separator

- mp3 파일 또는 YouTube 링크를 입력하여 보컬/반주 분리  
<img width="80%" src="https://github.com/user-attachments/assets/afcab25b-659a-4161-8eb5-b79edb8c898d" />  
<img width="80%" src="https://github.com/user-attachments/assets/b8c11504-fabb-41f5-ab8f-02c7e428a934" />


### Tab 3-2: Karaoke

- 실시간 피치 시각화, AI 채점 기능  
- 오토튠, 에코 효과 지원  
- Whisper 기반 가사 표시  
<img width="80%" src="https://github.com/user-attachments/assets/a3e7e0b6-c95a-49d9-8914-74babab8c553" />  
<img width="80%" src="https://github.com/user-attachments/assets/eb2a9446-7584-42ba-bd71-20f7696450c4" />  
<img width="80%" src="https://github.com/user-attachments/assets/8dd731fc-9734-408e-bd79-e9e8363aab9f" />


### Tab 4: Feedback

- AI 기반 보컬 피드백 리포트 제공  
- 사용자와 원곡 피치 비교  
<img width="80%" src="https://github.com/user-attachments/assets/10f51b5d-dffa-4093-bb13-0ad7e263d32b" />  
<img width="80%" src="https://github.com/user-attachments/assets/001d5df0-b108-4b0f-a5eb-bcfcbd9ce86e" />

> 📌 **전문 분석 포함**  
> 평균 Pitch, Jitter, Voiced Ratio 기반 피드백 제공  
> 예상 Voice Type, 발성 문제, 개선 포인트까지 정밀 분석


### Tab 5: Vocal Training

- 보컬 유튜브 채널 추천  
- 발성 훈련 리듬 게임 제공  
<img width="80%" src="https://github.com/user-attachments/assets/b10ef0ae-3d3c-42f0-850e-4ff19e63d75b" />  
<img width="80%" src="https://github.com/user-attachments/assets/d17da019-cc1c-4bf7-ad0f-f3bad52017b9" />


### Tab 6: User Ranking

- 동일 곡 사용자 간 점수 랭킹 확인  
<img width="80%" src="https://github.com/user-attachments/assets/4093e46b-4c89-43fd-9baa-062d2430cc74" />  
<img width="80%" src="https://github.com/user-attachments/assets/22cbd5d3-a9eb-4da4-9439-71eb2fba34f3" />



### Tab 7: Settings

- 닉네임, 프로필 이미지 변경  
- (디자인용) 다크모드 토글  
<img width="80%" src="https://github.com/user-attachments/assets/abfcb4a1-d6bd-4853-a170-c29de8757113" />
---

## 💬 느낀점

### 김승준
> \^_^/
> 백엔드 구축도 설계가 중요한 것 같습니다. 그냥 대책없이 API 막 써재끼니깐 스파게티 서버가 되었습니다.
> 그래서 프론트에다가 토스를 좀 했는데 미안하네요.
> 그래도 많이 배웠고 특이한 기술도 써보고 충분히 임팩트있고 개성있는걸 만든 거 같아서 너무 재미있었습니다.

### 이재현
> (•⌔•⑅)
> 기획을 충분히 다진 뒤에 개발하는 것이 얼마나 중요한지 깨달았습니다.
> 팀메이트가 API를 뚝딱뚝딱 잘 만들어줘서 정말 든든했어요.
> 로딩 바 같은 디테일이 좋은 UI를 만든다는 걸 다시금 느꼈습니다.

---

## 🧑‍💻 GitHub

- 백엔드: [https://github.com/k1shooter/mc_wk3_be](https://github.com/k1shooter/mc_wk3_be)
- 백엔드(GPU 서버용): [https://github.com/k1shooter/mc_wk3_GPUbe](https://github.com/k1shooter/mc_wk3_GPUbe)


