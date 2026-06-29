# MY-CARDS — 카드뉴스 제작 프로젝트

## 1. 이 프로젝트가 하는 일

레퍼런스 이미지와 카피(문구)를 입력받아, **인스타그램용 1080×1080 카드뉴스**를
HTML/CSS(Tailwind)로 디자인하고 **PNG로 추출**하는 프로젝트.

- 카드 1장 = HTML 파일 1개 (브라우저에서 보거나 PNG로 뽑음)
- 디자인은 "감성 인스타스토리" 톤 — 단색 파스텔 배경 + 거대한 볼드 헤드라인 + 톤온톤 사진 1장 + 과한 여백
- 최종 산출물: `out/01.png ~ out/05.png` (각 1080×1080)

현재 완성된 시리즈: **「물경력」 5장** (직장인 대상, 표지→후크→정보→감정→CTA 흐름)

---

## 2. 폴더 구조

```
MY-CARDS/
├── CLAUDE.md              ← 이 문서
├── package.json           ← playwright-core 의존성 + "export" 스크립트
├── export.js              ← HTML 5장 → PNG 추출기 (Playwright)
│
├── input/                 ← 제작 입력물 (사람이 준비)
│   ├── cards.md/          ← ⚠️ 파일 아니라 "폴더". 안에 카피 .md 들어있음
│   │   └── 물경력_카드뉴스_카피.md   ← 5장 카피 표 (eyebrow/title/body)
│   └── references/        ← 디자인 레퍼런스 이미지 (캡처본)
│       └── *.webp
│
├── sample.html            ← 시안: 브라운(크림) 톤 버전 (미채택, 보관용)
├── sample-blue.html       ← 시안: 블루 톤 버전 (★ 채택된 디자인 원본)
│
├── cards/                 ← 실제 카드 5장 (sample-blue 디자인을 카피별로 적용)
│   ├── 01.html ~ 05.html
│
├── assets/                ← 카드에 들어가는 사진
│   ├── photo-blue.jpg     ← 01번(표지)·시안용 블루 커피컷
│   ├── photo-brown.jpg    ← 브라운 시안용 (cards 미사용)
│   └── card-02.jpg ~ card-05.jpg  ← 02~05번 카드 사진
│
├── out/                   ← 추출된 PNG (생성물, git 무시 권장)
│   └── 01.png ~ 05.png
└── node_modules/          ← (생성물, git 무시 권장)
```

> **git 무시 권장**: `node_modules/`, `out/` (재생성 가능)

---

## 3. 각 파일 역할

| 경로 | 역할 |
|---|---|
| `input/cards.md/*.md` | **카피 원본.** 5장 각각의 eyebrow(작은 글)·title(큰 글)·body(본문) 표 |
| `input/references/*.webp` | 디자인 톤을 잡기 위한 레퍼런스 이미지 |
| `sample-blue.html` | **채택 디자인의 단일 시안.** 카드 디자인 스펙의 기준점 |
| `sample.html` | 브라운 톤 대안 시안 (보관) |
| `cards/0X.html` | sample-blue 레이아웃에 X번 카피+사진을 넣은 실제 카드 |
| `assets/*.jpg` | 카드 하단 사진 밴드에 들어가는 이미지 |
| `export.js` | 모든 `cards/*.html`을 1080×1080 PNG로 캡처 → `out/` |
| `package.json` | `npm run export` 정의, `playwright-core` 의존성 |

---

## 4. 디자인 시스템 (★ 카드 재현에 필요한 전부)

### 캔버스
- **1080 × 1080** 정사각. 미리보기는 `transform: scale(--s)`로 화면에 맞춰 축소, 추출 시 scale=1.

### 색상 (Tailwind config의 `extend.colors`)
| 이름 | HEX | 용도 |
|---|---|---|
| `sky` | `#AFC9DE` | 카드 배경 (파스텔 블루) |
| `navy` | `#2B3A4A` | 텍스트/먹색 |
| `accent` | `#E0A93B` | 머스터드 포인트 (제목 밑줄) — 카피의 "포인트 1색" 규칙 |
| (body bg) | `#9fb6c8` | 미리보기 시 카드 바깥 배경 (추출물엔 안 나옴) |

### 폰트 (CDN)
- **Montserrat** (Google Fonts, `wght@500;600;800;900`) → `font-display`. 숫자·영문 전용.
- **Pretendard** (jsdelivr static) → `font-body`. 한글 본문/제목.
- 한글 제목은 `font-body font-black` (900) 사용.

### 레이아웃 (정사각 1:1 기준 — 카드 시리즈 표준)
콘텐츠 영역과 사진 밴드가 겹치지 않도록 아래 값 고정:

```
콘텐츠 div : absolute inset-0 flex flex-col px-24 pt-20 pb-[316px]
사진 밴드  : absolute bottom-0 left-0 right-0 h-[300px] overflow-hidden
사진 위 베일: absolute inset-0 bg-navy/15   (화려한 사진을 블루 톤으로 묶음)
```

구성 요소(위→아래):
1. **스텝 번호 블록** — 큰 숫자 `text-[80px] font-display font-black` + 옆에 작은 `STEP`/단계명 스택 + 우측 북마크 SVG
2. **Eyebrow** — `font-body font-semibold tracking-[0.12em] text-[26px] text-navy/55 mt-12`
3. **제목(headline)** — `font-body font-black tracking-tight leading-[1.05] text-[112px]` (표지 01은 `text-[140px]`)
   - 바로 아래 머스터드 밑줄: `<span class="block w-40 h-[6px] bg-accent mt-5"></span>`
4. **본문(body)** — `font-body text-[34px] leading-[1.55] text-navy/85 mt-9 max-w-[820px]`, 2줄 (`<br/>`)
5. **푸터** — `mt-auto mb-6 flex justify-between`: 좌측 `series / 물경력`, 우측 페이지 `0X / 05`
6. **사진 밴드** — 하단 300px, `object-cover saturate-[.92]` + navy/15 베일

> **왜 이 값인가**: 레퍼런스는 9:16(스토리)인데 카드는 1:1이라 세로가 짧다.
> 처음엔 본문·푸터가 사진에 가려졌다 → 헤드라인을 132→112px로 줄이고
> `pb`로 콘텐츠 바닥을 사진 위로 올려 해결. **이 간격을 함부로 키우지 말 것.**

### 미리보기 자동 축소 스크립트 (모든 카드 하단에 동일)
```js
function fit(){ const p=48; const s=Math.min(1,(innerWidth-p)/1080,(innerHeight-p)/1080);
  document.documentElement.style.setProperty('--s',s.toFixed(3)); }
addEventListener('resize',fit); fit();
```

가장 정확한 템플릿은 **`cards/02.html`** (사진 포함 표준형). 새 카드는 이걸 복제해 카피만 교체.

---

## 5. 카드뉴스 제작 전체 프로세스

### STEP 1 — 레퍼런스 수집
- 만들고 싶은 톤의 이미지를 `input/references/`에 저장.

### STEP 2 — 카피 작성
- `input/cards.md/` 안에 5장 카피를 표로 작성. 각 카드 = **eyebrow(작게) / title(크게) / body(짧게)**.
- 흐름 예시(물경력): **표지 → 후크 → 정보 → 감정 → CTA**. 한 카드 = 한 메시지, 5초 안에 읽히게.

### STEP 3 — 레퍼런스 분석 + 시안 1장
- references를 읽고(`Read` 툴로 이미지 직접 분석) 공통 "결"을 뽑는다: 배경색/헤드라인/여백/사진 톤.
- **단 1장**을 `sample-*.html`로 만들어 톤을 확정받는다. (전체 만들기 전에 방향 합의)
- 색 후보가 여러 개면 파일을 나눠 비교 (`sample.html` 브라운 / `sample-blue.html` 블루).

### STEP 4 — 시안 확정 → 5장 생성
- 확정된 시안 디자인으로 `cards/01.html ~ 05.html` 생성. 카피 표의 각 행을 그대로 매핑.
- 스텝 번호/단계명/페이지(0X/05)만 카드별로 변경.

### STEP 5 — 사진 배치
- 카드별 사진을 `assets/card-0X.jpg`로 넣고 각 `cards/0X.html`의 `<img src>` 연결.
- **사진 톤이 배경과 안 맞으면**(화려한 컷) `bg-navy/15` 베일 + `saturate-[.92]`로 통일.
- **매핑은 카피의 감정 흐름 기준** (나열 순서가 아니라): 예) 후크=허탈 사진, CTA=성공 사진.
- 사진을 못 구하면 Unsplash CDN에서 받기 (아래 6번). 사용자가 직접 줄 때는 `assets/`에 지정 파일명으로 저장 요청.

### STEP 6 — PNG 추출
```bash
cd MY-CARDS
npm install          # 최초 1회 (playwright-core)
npm run export       # 또는: node export.js
# → out/01.png ~ 05.png (각 1080×1080)
```

---

## 6. 도구 사용법 & 알아둘 점 (재현 시 함정)

### PNG 추출 (export.js)
- **playwright-core + 시스템 Chrome** (`chromium.launch({channel:'chrome'})`) 사용 →
  Playwright 브라우저 대용량 다운로드 불필요. Chrome이 깔려 있어야 함.
- 로딩 대기: `waitUntil:'networkidle'` + `document.fonts.ready` (Tailwind CDN·폰트·이미지).
- 추출 직전 `--s=1` 세팅 + `.stage` 패딩 제거 → 카드를 1080×1080로 꽉 채워 `clip` 캡처.

### 빠른 미리보기(렌더 확인)가 필요할 때 (Bash로 헤드리스 캡처)
```bash
CHROME="/c/Program Files (x86)/Google/Chrome/Application/chrome.exe"
"$CHROME" --headless=new --disable-gpu --virtual-time-budget=6000 \
  --window-size=1080,1080 --screenshot=shot.png \
  "file:///C:/절대/Windows경로/0X.html"
```
- ⚠️ **Windows 파일 경로 함정**: Chrome엔 `file:///C:/...` 형식(드라이브 `C:/`)을 줘야 함.
  Git Bash식 `/c/...`는 `ERR_FILE_NOT_FOUND`. export.js는 `pathToFileURL()`로 자동 처리.
- ⚠️ 경로에 **한글·공백**(`바탕 화면`)이 있으면 file:// 인코딩 문제 → 필요시 ASCII 임시폴더로 복사 후 캡처.

### 레퍼런스/결과 이미지 분석
- 이미지는 `Read` 툴로 직접 보고 색·구도·톤을 판단. (webp/jpg/png 모두 가능)

### 사진 조달 (Unsplash)
- `WebFetch`로 `https://unsplash.com/s/photos/<검색어>` 페이지에서 `https://images.unsplash.com/photo-...` 직링크 추출.
- 다운로드: `curl -L "URL?w=1080&q=80&fit=crop"`. 여러 장 받아 `Read`로 톤온톤 맞는 것 선택.
- LoremFlickr 등은 워터마크/무관 이미지가 나오므로 비권장.

### 사용자가 채팅에 붙인 이미지
- 채팅 첨부 이미지는 디스크 파일로 **직접 추출 불가**. 사용자에게 `assets/`에 지정 파일명으로 저장 요청.
- Windows에서 저장 시 `card-02.jpg.jpg`처럼 **확장자 중복**이 자주 발생 → `Downloads`/바탕화면 확인 후 올바른 이름으로 `assets/`에 복사.

---

## 7. 현재 「물경력」 시리즈 매핑 (참고)

| 카드 | 단계 | 제목 | 사진(assets) |
|---|---|---|---|
| 01 | 표지 | 물경력 | photo-blue.jpg (블루 커피) |
| 02 | 후크 | 남는 게 없다 | card-02.jpg (전화·당황) |
| 03 | 정보 | 1년의 반복 | card-03.jpg (책상 업무) |
| 04 | 감정 | 방향의 문제 | card-04.jpg (계단 좌절) |
| 05 | CTA | 한 줄이면 충분 | card-05.jpg (하이파이브) |

흐름: 자각 → 반복 → 바닥 → 희망. 사진을 감정에 맞춰 배치한 결과.
