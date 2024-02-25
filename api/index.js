const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const dayjs = require('dayjs');

const app = express();
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
  key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'), // 개행 문자 처리
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
await doc.useServiceAccountAuth({
  client_email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
  private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
});


app.post('/update', async (req, res) => {
  try {
    const json = req.body;

    const spreadsheet = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
    await spreadsheet.useServiceAccountAuth({
      client_email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
      private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
    await spreadsheet.loadInfo();

    const sheet = spreadsheet.sheetsByTitle["salmal심테"];
    await sheet.addRow({
      나이: json.age,
      성별: json.gender,
      최종페이지: json.finalPage,
      mbti: json.mbti,
      쿠팡버튼여부: json.coupangButton,
      공유버튼여부: json.shareButton,
    });

    res.json({ message: "처리되었습니다." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류 발생" });
  }
});
