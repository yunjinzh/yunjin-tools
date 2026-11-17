/* Export projection is separate from browser download effects. */
const ResearchExport = Object.freeze({
  csv(records,{sources,topics}) {
    const cols=['基金','年度','项目名称','负责人','承担机构','原始项目类别','分析项目类别','原始学科','分析学科','批准号','资助金额(万元)','主题命中','源文件','工作表','Excel行号','来源附件','来源页','原始来源URL'];
    const cell=value=>'"'+String(value??'').replace(/^[\t\r\n ]*[=+\-@]/,"'$&").replace(/"/g,'""')+'"';
    const lines=[cols,...records.map(r=>[sources[r[0]].fund,sources[r[0]].year,r[1],r[2],r[3],r[5],r[6],r[7],r[8],r[9],r[10],r[16].map(t=>topics[t].name).join('；'),sources[r[0]].name,r[11],r[12],r[13],r[14],r[15]])];
    return '\ufeff'+lines.map(line=>line.map(cell).join(',')).join('\r\n');
  }
});
if(typeof module!=='undefined'&&module.exports)module.exports=ResearchExport;
