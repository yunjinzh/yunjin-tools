import { blank, confirmed, validation, type Row } from "../../../lib/model";
import {
  currentRows,
  versions,
  projectHistory,
  database,
  error,
  sameOrigin,
  noCache,
} from "../../../lib/repository";
import { getChatGPTUser } from "../../chatgpt-auth";
export const dynamic = "force-dynamic";
export async function GET(req: Request) {
  const params = new URL(req.url).searchParams;
  const id = params.get("history");
  const project = params.get("timeline");
  if (project)
    return Response.json(await projectHistory(project), { headers: noCache });
  return Response.json(id ? await versions(id) : await currentRows(), {
    headers: noCache,
  });
}
export async function POST(req: Request) {
  if (!sameOrigin(req)) return error("请求来源无效。", 403);
  let data;
  try {
    data = (await req.json()) as {
      row?: Row;
      sourceId?: string;
      sourceRev?: number;
      affirm?: boolean;
    };
  } catch {
    return error("提交内容格式无效。");
  }
  if (!data?.row || typeof data.row !== "object") return error("缺少记录。");
  const rows = await currentRows();
  const input = data.row;
  if (
    !/^[a-zA-Z0-9-]{1,90}$/.test(input.id) ||
    !["项目", "记录", "模板"].includes(input.type) ||
    typeof input.demo !== "boolean"
  )
    return error("记录标识或类型无效。");
  const previous = rows.find((r) => r.id === input.id);
  if ((previous?.rev ?? 0) !== input.rev)
    return error("此记录已有新版本。请查看最新版本后重新提交。", 409);
  if (
    previous &&
    (previous.type !== input.type ||
      previous.demo !== input.demo ||
      previous.parent !== input.parent)
  )
    return error("记录归属无法修改。");
  const r = blank();
  for (const key of Object.keys(r) as (keyof Row)[]) {
    if (typeof r[key] === "string") {
      const val = input[key] ?? "";
      if (
        typeof val !== "string" ||
        val.length >
          (["body", "resolution", "evidence", "details"].includes(key)
            ? 40000
            : 1000)
      )
        return error("字段长度或格式无效。");
      Object.assign(r, { [key]: val.trim() });
    }
  }
  r.demo = input.demo;
  r.rev = (previous?.rev ?? 0) + 1;
  if (r.type === "项目") {
    r.kind = "项目";
    r.parent = "";
  }
  if (r.type === "模板") {
    const source = rows.find((a) => a.id === data.sourceId);
    if (
      previous ||
      !source ||
      source.type !== "记录" ||
      source.demo !== r.demo ||
      source.rev !== data.sourceRev ||
      !confirmed(source.status)
    )
      return error("请选择已核验的当前记录版本生成模板。");
    r.name = source.name;
    r.kind = source.kind;
    r.body = source.body;
    r.details = source.details;
    r.resolution = source.resolution;
    r.origin = source.id + "@V" + source.rev;
    r.parent = "";
    r.reviewer = source.reviewer;
    r.evidence = source.evidence;
    r.status = "已确认";
    r.related = "";
    r.attachment = source.attachment;
    r.filename = source.filename;
  }
  const invalid = validation(
    r,
    rows,
    r.type === "模板" || data.affirm === true,
  );
  if (invalid) return error(invalid);
  if (r.attachment) {
    const found = await database()
      .prepare("SELECT name FROM uploads WHERE id=?")
      .bind(r.attachment)
      .first<{ name: string }>();
    if (!found) return error("归档附件不存在。");
    r.filename = found.name;
  } else r.filename = "";
  r.updated = new Date().toISOString();
  r.verifiedAt = confirmed(r.status) ? r.updated : "";
  r.actor = (await getChatGPTUser())?.displayName || "工作区成员";
  try {
    await database()
      .prepare(
        "INSERT INTO revisions(id, revision, body, changed_at, actor) VALUES(?,?,?,?,?)",
      )
      .bind(r.id, r.rev, JSON.stringify(r), r.updated, r.actor)
      .run();
  } catch (ex) {
    if (String(ex).includes("UNIQUE"))
      return error("记录已被其他人修改，请核对最新版本。", 409);
    throw ex;
  }
  return Response.json(r, { headers: noCache, status: 201 });
}
