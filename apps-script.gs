/**
 * 그린벨리 견적서 메일 자동 발송 (Google Apps Script)
 * 1) PIN 을 원하는 발송 비밀번호로 바꾼다.
 * 2) 배포 → 새 배포 → 유형: 웹 앱 / 실행 계정: 나 / 액세스 권한: 모든 사용자 → 배포
 * 3) 나온 웹 앱 URL을 견적서 페이지의 SEND_URL 에 넣는다.
 */
const PIN = '여기에-발송-비밀번호';
const REPLY_TO = 'ldy5342@naver.com';
const SENDER_NAME = '그린벨리';

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.key !== PIN) return out({ ok: false, error: 'key' });
    const pdf = Utilities.newBlob(Utilities.base64Decode(d.pdf), 'application/pdf', d.filename);
    GmailApp.sendEmail(d.to, d.subject, d.body, {
      attachments: [pdf], name: SENDER_NAME, replyTo: REPLY_TO, bcc: REPLY_TO
    });
    return out({ ok: true });
  } catch (err) {
    return out({ ok: false, error: String(err) });
  }
}

function out(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
