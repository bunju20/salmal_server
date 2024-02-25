const express = require('express');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const dayjs = require('dayjs');

const app = express();
app.use(express.json()); // JSON 요청 본문을 파싱하기 위해 필요

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
  key: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

app.post('/update', async (req, res) => {
    const json = req.body; // Express를 사용하여 요청 본문 접근

    const spreadsheet = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);
    await spreadsheet.loadInfo();

    const sheet = spreadsheet.sheetsByTitle["salmal심테"]; // 시트 이름 확인
    await sheet.addRow({
      나이: json.age,
      성별: json.gender,
      최종페이지: json.finalPage,
      mbti: json.mbti,
      쿠팡버튼여부: json.coupangButton,
      공유버튼여부: json.shareButton,
    });

    res.json({ message: "처리되었습니다." }); // Express 응답 메소드 사용
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
