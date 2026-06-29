// 카드뉴스 HTML 5장 → 1080×1080 PNG 추출 (Playwright)
// 실행: node export.js
// playwright-core + 시스템에 설치된 Chrome(channel:'chrome') 사용 → 별도 브라우저 다운로드 불필요.

const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const SIZE = 1080;

// cards/ 안의 모든 *.html 을 같은 이름의 PNG로 추출 (여러 시리즈 공존 가능)
// 특정 시리즈만 뽑으려면: node export.js running   (이름에 'running' 포함된 것만)
const filter = process.argv[2];
const CARDS = fs
  .readdirSync(path.join(__dirname, 'cards'))
  .filter((f) => f.endsWith('.html'))
  .map((f) => path.basename(f, '.html'))
  .filter((n) => !filter || n.includes(filter))
  .sort();

(async () => {
  const outDir = path.join(__dirname, 'out');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ channel: 'chrome' });
  const page = await browser.newPage({
    viewport: { width: SIZE, height: SIZE },
    deviceScaleFactor: 1,
  });

  for (const n of CARDS) {
    const file = path.join(__dirname, 'cards', `${n}.html`);
    await page.goto(pathToFileURL(file).href, { waitUntil: 'networkidle' });

    // 미리보기용 축소(transform scale)·여백 제거 → 카드를 1080×1080로 꽉 채워 캡처
    await page.evaluate(() => {
      document.documentElement.style.setProperty('--s', '1');
      const stage = document.querySelector('.stage');
      if (stage) stage.style.padding = '0';
      document.body.style.margin = '0';
    });

    // 웹폰트 로딩 완료까지 대기
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(300);

    const out = path.join(outDir, `${n}.png`);
    await page.screenshot({ path: out, clip: { x: 0, y: 0, width: SIZE, height: SIZE } });
    console.log(`✓ ${n}.html → out/${n}.png`);
  }

  await browser.close();
  console.log(`\n완료: ${CARDS.length}장을 out/ 에 저장했습니다.`);
  if (CARDS.length === 0) console.log('(추출할 카드가 없습니다. 필터를 확인하세요.)');
})().catch((err) => {
  console.error('추출 실패:', err);
  process.exit(1);
});
