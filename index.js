import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import dayjs from "dayjs";

export const dynamic = "force-dynamic";

const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_CLOUD_PRIVATE_EMAIL,
    key: process.env.GOOGLE_CLOUD_PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

export async function POST(request) {
    const json = await request.json();

    const spreadsheet = new GoogleSpreadsheet(
        process.env.GOOGLE_SPREADSHEET_ID,
        serviceAccountAuth
    );
    await spreadsheet.loadInfo();

    const sheet = spreadsheet.sheetsByTitle["salmal심테"]; // 이 부분은 스프레드시트의 실제 시트 이름으로 변경하세요.

    await sheet.addRow({
        나이: json.age, // 추가
        성별: json.gender, // 추가
        최종페이지: json.finalPage, // 추가
        mbti: json.mbti, // 추가
        쿠팡버튼여부: json.coupangButton, // 추가
        공유버튼여부: json.shareButton, // 추가
        // 기존에 있던 다른 데이터 필드는 제거하거나 필요에 따라 유지합니다.
    });

    return Response.json({
        message: "처리되었습니다.",
    });
}
