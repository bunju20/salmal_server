const { GoogleSpreadsheet } = require('google-spreadsheet');

// Google 스프레드시트 인증 및 초기화
async function authenticateGoogleSpreadsheet() {
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID);

    await doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
        private_key: process.env.GOOGLE_CLOUD_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });

    await doc.loadInfo(); // 문서 정보 로드
    return doc;
}

// Vercel 서버리스 함수
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const json = req.body;
        const doc = await authenticateGoogleSpreadsheet();
        
        // 특정 시트 선택 (여기서는 시트 제목이 'salmal심테')
        const sheet = doc.sheetsByTitle["salmal심테"];
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