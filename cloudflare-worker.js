/**
 * Airtable CRUD 프록시 (Cloudflare Worker)
 * - 토큰(AIRTABLE_TOKEN)은 Worker의 secret으로만 보관 → 브라우저/저장소에 노출 안 됨
 * - 프론트엔드는 이 Worker만 호출하고, Worker가 Airtable로 대신 요청
 *
 * 필요한 환경변수 (Cloudflare 대시보드 Settings → Variables):
 *   AIRTABLE_TOKEN    (Secret)   : pat... 토큰
 *   AIRTABLE_BASE_ID  (Variable) : app8uaN01e3TkNB0B
 *   AIRTABLE_TABLE    (Variable) : Jobmongz1
 *   ALLOWED_ORIGIN    (Variable) : https://yoonjikeun.github.io
 */

export default {
  async fetch(request, env) {
    const ALLOW = env.ALLOWED_ORIGIN || "*";

    const cors = {
      "Access-Control-Allow-Origin": ALLOW,
      "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }

    const base = env.AIRTABLE_BASE_ID;
    const table = encodeURIComponent(env.AIRTABLE_TABLE);
    const url = new URL(request.url);

    // 경로 마지막 조각이 레코드 id (PATCH/DELETE 시), 없으면 목록/생성
    const parts = url.pathname.split("/").filter(Boolean);
    const recId = parts.length ? parts[parts.length - 1] : "";
    const hasId = /^rec[A-Za-z0-9]+$/.test(recId);

    let airtableUrl = `https://api.airtable.com/v0/${base}/${table}`;
    if (hasId) airtableUrl += `/${recId}`;

    const init = {
      method: request.method,
      headers: {
        "Authorization": `Bearer ${env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
    };

    // 본문이 있는 메서드는 그대로 전달
    if (request.method === "POST" || request.method === "PATCH") {
      init.body = await request.text();
    }

    try {
      const res = await fetch(airtableUrl, init);
      const body = await res.text();
      return new Response(body, {
        status: res.status,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: String(e) }), {
        status: 502,
        headers: { ...cors, "Content-Type": "application/json" },
      });
    }
  },
};
