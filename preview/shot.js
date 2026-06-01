const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--force-device-scale-factor=2'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 470, height: 900, deviceScaleFactor: 2 });
  const url = 'file://' + path.resolve(__dirname, 'index.html');
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const phone = await page.$('.phone');

  // 1. Feed
  await phone.screenshot({ path: path.resolve(__dirname, '01-feed.png') });

  // 2. Feed com odds selecionadas -> betslip
  await page.evaluate(() => { selectOdd('m1','home'); selectOdd('m3','away'); });
  await new Promise(r => setTimeout(r, 500));
  await phone.screenshot({ path: path.resolve(__dirname, '02-feed-betslip.png') });

  // 3. Apostas
  await page.evaluate(() => { store.betslip=[]; store.selectedOdds={}; setTab('apostas'); });
  await new Promise(r => setTimeout(r, 400));
  await phone.screenshot({ path: path.resolve(__dirname, '03-apostas.png') });

  // 4. Ranking
  await page.evaluate(() => setTab('ranking'));
  await new Promise(r => setTimeout(r, 400));
  await phone.screenshot({ path: path.resolve(__dirname, '04-ranking.png') });

  // 5. Perfil
  await page.evaluate(() => setTab('perfil'));
  await new Promise(r => setTimeout(r, 400));
  await phone.screenshot({ path: path.resolve(__dirname, '05-perfil.png') });

  await browser.close();
  console.log('done');
})();
