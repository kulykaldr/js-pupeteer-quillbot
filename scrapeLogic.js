const puppeteer = require("puppeteer");
require("dotenv").config();

function delay(time) {
  return new Promise(function (resolve) {
    setTimeout(resolve, time)
  });
}

const scrapeLogic = async (req, res) => {
  if (!req.body && !req.body.text && req.body.text.trim() === '') {
    res.send({ error: "No text sended!", ok: false });
    return;
  }

  const text = req.body.text;

  const browser = await puppeteer.launch({
    // headless: false,
    headless: 'new',
    args: [
      "--disable-setuid-sandbox",
      "--no-sandbox",
      "--single-process",
      "--no-zygote",
    ],
    executablePath:
      process.env.NODE_ENV === "production"
        ? process.env.PUPPETEER_EXECUTABLE_PATH
        : puppeteer.executablePath(),
  });
  try {
    const page = await browser.newPage();

    await page.goto("https://quillbot.com/");

    // Set screen size
    await page.setViewport({ width: 1024, height: 768 });

    // Type text for paraphrase
    const textBox = '#paraphraser-input-box';
    await page.click(textBox);
    await delay(1000);

    await page.keyboard.down('ControlLeft');
    await page.keyboard.press('A');
    await page.keyboard.up('ControlLeft');
    await page.keyboard.press('Delete');

    // With the help of QuillBot's paraphraser, you can rapidly and effectively rework and rephrase your content by taking your sentences and making adjustments!
    await page.keyboard.type(text, { delay: 10 });
    await delay(3000);

    await page.keyboard.down('ControlRight');
    await page.keyboard.press('Enter');
    await page.keyboard.up('ControlRight');

    // wait untill the copy button appears
    await page.waitForSelector('[aria-label="Copy Full Text"]');

    // Locate the full title with a unique string
    const textSelector = await page.waitForSelector("#paraphraser-output-box");
    let paraphraseText = await textSelector.evaluate((el) => el.textContent);
    paraphraseText = paraphraseText.trim();

    const wrongOutput = "With the help of QuillBot's paraphraser, you can rapidly and effectively rework and rephrase your content by taking your sentences and making adjustments!"
    if (!paraphraseText
      || !paraphraseText.length
      || paraphraseText === wrongOutput
      || paraphraseText === text) {
      res.status(500).json({ error: "No text found", ok: false });
      return;
    }

    // Print the full title
    const logStatement = { output: paraphraseText, ok: true };
    console.log(logStatement);
    res.json(logStatement);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e, ok: false });
  } finally {
    await browser.close();
  }
};

module.exports = { scrapeLogic };