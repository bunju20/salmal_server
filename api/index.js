import dayjs from 'dayjs';
import express from 'express';
const {JWT} = require('google-auth-library');
const { GoogleSpreadsheet } = require('google-spreadsheet');

// Express 앱 생성
const app = express();
const cors = require('cors');

app.use(cors({
    origin: 'https://salkka-malkka.vercel.app', // 요청을 허용할 도메인
    methods: ['GET', 'POST', 'OPTIONS'], // 허용할 HTTP 메서드
    allowedHeaders: ['Content-Type', 'Authorization'] // 허용할 HTTP 헤더
}));

  
// 스프레드시트 인증 및 초기화 함수
async function authenticateGoogleSpreadsheet() {

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
    key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
    ],
});
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID,serviceAccountAuth);
    await doc.loadInfo(); // 문서 정보 로드
    console.log(Object.keys(doc.sheetsByTitle)); // 로드된 모든 시트의 제목을 출력

    return doc;
}

// Vercel 서버리스 함수
module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); // 모든 출처 허용
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS'); // 허용 메소드
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // 허용 헤더
  if (req.method === 'OPTIONS') {
    // OPTIONS 요청에 대한 응답
    return res.status(200).end();
  }

    try {
        const json = req.body;
        const doc = await authenticateGoogleSpreadsheet();
        
        // 특정 시트 선택 (여기서는 시트 제목이 'salmal심테')
        const sheet = doc.sheetsByTitle["\bsalmal"];
        if (!sheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        // 스프레드시트에 행 추가
        await sheet.addRow({
            나이: json.age,
            성별: json.gender,
            최종페이지: json.finalPage,
            mbti: json.mbti,
            쿠팡버튼여부: json.coupangButton,
            공유버튼여부: json.shareButton,
        });

        // 성공 응답
        res.status(200).json({ message: "Data added successfully" });
    } catch (error) {
        console.error(error);
        // 내부 서버 오류 응답
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};



