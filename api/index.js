// 필요한 모듈 임포트
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const dayjs = require('dayjs');

// Google 스프레드시트 인증 설정
async function authenticateGoogleSpreadsheet() {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);
    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/gm, '\n'),
    });
    return doc;
}

// Vercel 서버리스 함수 형식으로 API 엔드포인트 정의
module.exports = async (req, res) => {
    if (req.method === 'POST') {
        try {
            const json = req.body;

            const doc = await authenticateGoogleSpreadsheet();
            await doc.loadInfo(); // 스프레드시트 문서 정보 로드

            const sheet = doc.sheetsByTitle["salmal심테"]; // 시트 이름으로 시트 접근
            await sheet.addRow({
                나이: json.age,
                성별: json.gender,
                최종페이지: json.finalPage,
                mbti: json.mbti,
                쿠팡버튼여부: json.coupangButton,
                공유버튼여부: json.shareButton,
            });

            // 성공 응답 전송
            res.status(200).json({ message: "처리되었습니다." });
        } catch (error) {
            console.error(error);
            // 서버 오류 응답 전송
            res.status(500).json({ message: "서버 오류 발생" });
        }
    } else {
        // POST 메소드가 아닌 경우의 응답
        res.status(405).json({ message: "허용되지 않는 메소드입니다." });
    }
};
