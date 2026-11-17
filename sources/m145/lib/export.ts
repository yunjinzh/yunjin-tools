import { zipSync, strToU8 } from "fflate";
import { detailPairs, displayTime } from "./detail-fields";
import { fieldNames, type Row } from "./model";
const xml = (v: unknown) =>
  String(v ?? "")
    .replace(
      /[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/gu,
      "",
    )
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
const pkg = "http://schemas.openxmlformats.org/package/2006/relationships";
const office =
  "http://schemas.openxmlformats.org/officeDocument/2006/relationships";
const types = "http://schemas.openxmlformats.org/package/2006/content-types";
const rel = (rows: string[][]) =>
  '<Relationships xmlns="' +
  pkg +
  '">' +
  rows
    .map(
      ([id, type, target]) =>
        '<Relationship Id="' +
        id +
        '" Type="' +
        office +
        "/" +
        type +
        '" Target="' +
        target +
        '"/>',
    )
    .join("") +
  "</Relationships>";
const ct = (items: string[][]) =>
  '<Types xmlns="' +
  types +
  '"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>' +
  items
    .map(
      ([name, type]) =>
        '<Override PartName="/' +
        name +
        '" ContentType="application/vnd.openxmlformats-officedocument.' +
        type +
        '+xml"/>',
    )
    .join("") +
  "</Types>";
export function buildOffice(
  format: "docx" | "xlsx",
  title: string,
  rows: Row[],
  all: Row[],
) {
  const files: Record<string, string> = {},
    project = (r: Row) =>
      r.type === "项目" ? r : all.find((a) => a.id === r.parent),
    lookup = (id: string) => all.find((a) => a.id === id)?.name || id;
  const keys = [
    "name",
    "kind",
    "status",
    "stage",
    "owner",
    "priority",
    "org",
    "scene",
    "tech",
    "due",
    "body",
    "resolution",
    "related",
    "evidence",
    "reviewer",
    "verifiedAt",
    "filename",
    "origin",
  ] as const;
  const value = (r: Row, k: (typeof keys)[number]) =>
    k === "related"
      ? lookup(r[k])
      : ["org", "scene", "tech"].includes(k)
        ? r[k] || project(r)?.[k] || ""
        : r[k];
  const exportLabel = rows[0]?.demo ? "示例工作区 · 演练数据" : "正式工作区";
  if (format === "docx") {
    const p = (s: string, size = 22, b = false) =>
      '<w:p><w:pPr><w:spacing w:after="100"/></w:pPr><w:r><w:rPr><w:rFonts w:ascii="Arial" w:eastAsia="等线"/><w:sz w:val="' +
      size +
      '"/>' +
      (b ? '<w:b/><w:color w:val="225A4C"/>' : "") +
      "</w:rPr>" +
      s
        .split("\n")
        .map(
          (v, i) =>
            (i ? "<w:br/>" : "") +
            '<w:t xml:space="preserve">' +
            xml(v) +
            "</w:t>",
        )
        .join("") +
      "</w:r></w:p>";
    files["_rels/.rels"] = rel([
      ["rId1", "officeDocument", "word/document.xml"],
    ]);
    files["[Content_Types].xml"] = ct([
      ["word/document.xml", "wordprocessingml.document.main"],
    ]);
    files["word/document.xml"] =
      '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>' +
      p(title, 34, true) +
      p(exportLabel + "  ·  " + rows.length + " 条记录", 20) +
      rows
        .map(
          (r) =>
            p(r.name + "  /  V" + r.rev, 28, true) +
            p(
              (project(r)?.name || "项目模板") +
                " · " +
                r.kind +
                " · " +
                r.status,
            ) +
            keys
              .filter(
                (k) => !["name", "kind", "status"].includes(k) && value(r, k),
              )
              .map((k) => p(fieldNames[k] + "　" + value(r, k)))
              .join("") +
            detailPairs(r.kind, r.details)
              .map(([k, v]) => p(k + "　" + v))
              .join("") +
            p("版本记录　" + displayTime(r.updated) + "　" + r.actor, 18),
        )
        .join("") +
      '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1100" w:right="1100" w:bottom="1100" w:left="1100"/></w:sectPr></w:body></w:document>';
  } else {
    const main = "http://schemas.openxmlformats.org/spreadsheetml/2006/main";
    const head = [
      "工作区",
      "所属项目",
      ...keys.map((k) => fieldNames[k]),
      "专项明细",
      "版本",
      "更新时间",
      "记录人",
    ];
    const data = [
      head,
      ...rows.map((r) => [
        exportLabel,
        project(r)?.name || "",
        ...keys.map((k) => value(r, k)),
        detailPairs(r.kind, r.details)
          .map(([k, v]) => k + "：" + v)
          .join("\n"),
        "V" + r.rev,
        displayTime(r.updated),
        r.actor,
      ]),
    ];
    files["_rels/.rels"] = rel([["rId1", "officeDocument", "xl/workbook.xml"]]);
    files["[Content_Types].xml"] = ct([
      ["xl/workbook.xml", "spreadsheetml.sheet.main"],
      ["xl/worksheets/sheet1.xml", "spreadsheetml.worksheet"],
      ["xl/styles.xml", "spreadsheetml.styles"],
    ]);
    files["xl/workbook.xml"] =
      '<workbook xmlns="' +
      main +
      '" xmlns:r="' +
      office +
      '"><sheets><sheet name="项目视图" sheetId="1" r:id="rId1"/></sheets></workbook>';
    files["xl/_rels/workbook.xml.rels"] = rel([
      ["rId1", "worksheet", "worksheets/sheet1.xml"],
      ["rId2", "styles", "styles.xml"],
    ]);
    files["xl/styles.xml"] =
      '<styleSheet xmlns="' +
      main +
      '"><fonts count="2"><font><sz val="11"/><name val="等线"/></font><font><b/><color rgb="FFFFFFFF"/><sz val="11"/><name val="等线"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF225A4C"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0" fillId="0" borderId="0" xfId="0"/><xf fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles></styleSheet>';
    files["xl/worksheets/sheet1.xml"] =
      '<worksheet xmlns="' +
      main +
      '"><sheetViews><sheetView workbookViewId="0"><pane xSplit="2" ySplit="1" topLeftCell="C2" activePane="bottomRight" state="frozen"/></sheetView></sheetViews><cols>' +
      head
        .map(
          (_, i) =>
            '<col min="' +
            (i + 1) +
            '" max="' +
            (i + 1) +
            '" width="' +
            ([1, 2, 12, 13, 15].includes(i) ? 42 : 20) +
            '" customWidth="1"/>',
        )
        .join("") +
      "</cols><sheetData>" +
      data
        .map(
          (line, i) =>
            '<row r="' +
            (i + 1) +
            '">' +
            line
              .map(
                (v, j) =>
                  '<c r="' +
                  String.fromCharCode(65 + j) +
                  (i + 1) +
                  '" t="inlineStr" s="' +
                  (i ? 0 : 1) +
                  '"><is><t xml:space="preserve">' +
                  xml(v) +
                  "</t></is></c>",
              )
              .join("") +
            "</row>",
        )
        .join("") +
      '</sheetData><autoFilter ref="A1:' +
      String.fromCharCode(64 + head.length) +
      data.length +
      '"/></worksheet>';
  }
  return zipSync(
    Object.fromEntries(
      Object.entries(files).map(([k, s]) => [
        k,
        strToU8('<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + s),
      ]),
    ),
  );
}
export function downloadOffice(
  format: "docx" | "xlsx",
  title: string,
  rows: Row[],
  all: Row[],
) {
  const bytes = buildOffice(format, title, rows, all);
  const url = URL.createObjectURL(
    new Blob([new Uint8Array(bytes)], {
      type:
        format === "docx"
          ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = title.replace(/[\\/:*?"<>|]/g, "-") + "." + format;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}
