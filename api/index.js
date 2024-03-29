import dayjs from "dayjs";
import express from "express";
const { JWT } = require("google-auth-library");
const { GoogleSpreadsheet } = require("google-spreadsheet");

// Express 앱 생성
const app = express();
const cors = require("cors");

app.use(
    cors({
        origin: "https://salkka-malkka.vercel.app", // 요청을 허용할 도메인
        methods: ["GET", "POST", "OPTIONS"], // 허용할 HTTP 메서드
        allowedHeaders: ["Content-Type", "Authorization"], // 허용할 HTTP 헤더
    })
);

// 스프레드시트 인증 및 초기화 함수
async function authenticateGoogleSpreadsheet() {
    const serviceAccountAuth = new JWT({
        email: process.env.GOOGLE_CLOUD_CLIENT_EMAIL,
        key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, "\n"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });
    const doc = new GoogleSpreadsheet(
        process.env.GOOGLE_SPREADSHEET_ID,
        serviceAccountAuth
    );
    await doc.loadInfo(); // 문서 정보 로드된 모든 시트의 제목을 출력

    return doc;
}

// Vercel 서버리스 함수
module.exports = async (req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*"); // 모든 출처 허용
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // 허용 메소드
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
    ); // 허용 헤더
    if (req.method === "OPTIONS") {
        // OPTIONS 요청에 대한 응답
        return res.status(200).end();
    }

    try {
        const json = req.body;
        const doc = await authenticateGoogleSpreadsheet();

        // 특정 시트 선택
        const sheet = doc.sheetsByTitle["\bsalmal_food"];
        if (!sheet) {
            return res.status(404).json({ message: "Sheet not found" });
        }

        // 모든 행 로드
        await sheet.loadCells(); // 셀 정보 로드
        const rows = await sheet.getRows();
        const existingRow = rows.find((row) => row._rawData[0] == json.uid);

        if (existingRow) {
            // 일치하는 행이 있는 경우, 해당 행 업데이트
            for (let i = 0; i < existingRow._rawData.length; i++) {
                console.log(existingRow._rawData[i]);
                let key = Object.keys(json)[i];
                console.log(json[key]);
                existingRow._rawData[i] = json[key];
            }
            await existingRow.save(); // 변경 사항 저장
            res.status(200).json({ message: "Data updated successfully" });
        } else {
            // 일치하는 uid가 없는 경우, 새로운 행 추가
            await sheet.addRow({
                접속자id: json.uid,
                접속날짜: json.date,
                접속시간: json.time,
                접속경로: json.referrer,
                접속기기: json.device,
                최종스크롤위치: json.finalScrollPosition,
                역최1: json.recent1,
                역최2: json.recent2,
                카특1: json.feature1,
                카특11: json.feature1_1,
                카특12: json.feature1_2,
                카특13: json.feature1_3,
                카특14: json.feature1_4,
                카특15: json.feature1_5,
                카특16: json.feature1_6,
                카특2: json.feature2,
                카특21: json.feature2_1,
                카특22: json.feature2_2,
                카특23: json.feature2_3,
                카특24: json.feature2_4,
                카특25: json.feature2_5,
                카특26: json.feature2_6,
                카특3: json.feature3,
                카특31: json.feature3_1,
                카특32: json.feature3_2,
                카특33: json.feature3_3,
                카특34: json.feature3_4,
                카특35: json.feature3_5,
                카특36: json.feature3_6,
                핫딜1: json.hotDeal1,
                핫딜2: json.hotDeal2,
                핫딜3: json.hotDeal3,
                핫딜4: json.hotDeal4,
                핫딜5: json.hotDeal5,
                핫딜6: json.hotDeal6,
                핫딜스크롤: json.hotDealScroll,
            });

            res.status(200).json({ message: "Data added successfully" });
        }
    } catch (error) {
        console.error(error);
        // 내부 서버 오류 응답
        res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
        });
    }
};
