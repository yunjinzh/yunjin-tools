export const statuses=['待核验','已确认','核验失败','无法访问','需补充'];
export const checks=['人物面容一致性','人物动作与场景融合','衣着变化','图片清晰度','内容正确性'];
export const editions=['阅读版','PNG 原图版','历史 414 版'];
export const problemTypes=['缺失编号','重复图片','损坏文件','命名异常','版本不对应','目标字表','无法访问','内容质量','分卷异常','其他'];
export function validate(p) {
  if(!p || typeof p!=='object' || !['review','part','issue','version','baseline','resource'].includes(p.kind)) return '记录类型无效';
  if(!statuses.includes(p.status) || !p.title?.trim()) return '请填写记录名称和核验状态';
  if(!p.reviewer?.trim()) return '请填写复核人';
  if((p.status==='已确认'||p.status==='核验失败') && !p.evidence?.trim()) return '结论需要可追溯的证据位置';
  if(p.kind==='review'){
    if(!editions.includes(p.edition)||!p.filename?.trim()||!p.han?.trim()||!p.batch?.trim())return '请填写汉字、文件名或文件清单、资源版本及抽样批次';
    if(!['单张','批次'].includes(p.scope))return '复核范围无效';
    if(p.scope==='单张' && (!/^\d{4}$/.test(p.cardId)||Number(p.cardId)<1||Number(p.cardId)>1000||Array.from(p.han.trim()).length!==1))return '单张复核需要 0001—1000 的编号及一个汉字';
    if(p.status==='已确认'&&!checks.every(c=>p.criteria?.[c]==='通过'))return '五项内容均通过后，才能标记已确认';
    if(p.status==='核验失败'&&!checks.some(c=>p.criteria?.[c]==='不通过'))return '请指出未通过的复核项';
    if(!p.conclusion?.trim())return '请填写复核结论';
  }
  if(p.kind==='part'&&(!/^0(0[1-9]|1\d|2[0-5])$/.test(p.volume)||!Number.isSafeInteger(Number(p.bytes))||Number(p.bytes)<=0||!p.filename))return '分卷需要有效编号、原始文件名和正整数字节数';
  if(p.kind==='baseline'&&(!p.chars||!/^[\p{Script=Han}]+$/u.test(p.chars)||Array.from(p.chars).length>10000))return '目标字表需包含 1—10000 个汉字';
  return '';
}
