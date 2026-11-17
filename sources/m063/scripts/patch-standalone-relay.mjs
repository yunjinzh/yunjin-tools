import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const [inputArg, outputArg = inputArg] = process.argv.slice(2);

if (!inputArg) {
  throw new Error("Usage: node patch-standalone-relay.mjs <input.html> [output.html]");
}

const inputPath = resolve(inputArg);
const outputPath = resolve(outputArg);
let source = await readFile(inputPath, "utf8");

function replaceOnce(search, replacement, label) {
  const first = source.indexOf(search);
  if (first < 0) throw new Error(`Standalone relay patch target missing: ${label}`);
  if (source.indexOf(search, first + search.length) >= 0) {
    throw new Error(`Standalone relay patch target is ambiguous: ${label}`);
  }
  source = source.slice(0, first) + replacement + source.slice(first + search.length);
}

function replaceBetween(start, end, replacement, label) {
  const first = source.indexOf(start);
  if (first < 0) throw new Error(`Standalone relay patch start missing: ${label}`);
  const last = source.indexOf(end, first + start.length);
  if (last < 0) throw new Error(`Standalone relay patch end missing: ${label}`);
  source = source.slice(0, first) + replacement + source.slice(last);
}

replaceOnce(
  ".provider-pills button.active { border-color: var(--navy); color: #fff; background: var(--navy); }\n",
  `.provider-pills button.active { border-color: var(--navy); color: #fff; background: var(--navy); }
.connection-tip { margin: 8px 2px 0; color: #758995; font-size: 10px; line-height: 1.55; }
.text-input:disabled { color: #8b9aa4; background: #edf2f4; cursor: not-allowed; }
`,
  "connection styles",
);

replaceOnce(
  'T={tab:"input",provider:"openai",configs:structuredClone(dQ),prompt:au,pdfFile:null,pdfText:"",pdfInfo:"",sourceUrl:"https://doi.org/10.13284/j.cnki.rddl.20250811",qrDataUrl:"",data:structuredClone(CQ),busy:"",zoom:.82,showKey:!1}',
  'T={tab:"input",provider:"openai",connectionMode:"relay",relayUrl:"http://127.0.0.1:8765/api/model",configs:structuredClone(dQ),prompt:au,pdfFile:null,pdfText:"",pdfInfo:"",sourceUrl:"https://doi.org/10.13284/j.cnki.rddl.20250811",qrDataUrl:"",data:structuredClone(CQ),busy:"",zoom:.82,showKey:!1}',
  "standalone state",
);

replaceOnce(
  String.raw`\u672C\u5730\u5355\u6587\u4EF6\u7248 \xB7 \u81EA\u5E26\u6A21\u578B Key`,
  String.raw`\u672C\u5730\u5355\u6587\u4EF6\u7248 \xB7 \u8DE8\u57DF\u8F6C\u53D1\u5DF2\u542F\u7528`,
  "header status",
);

replaceOnce(
  String.raw`<p class="model-disclosure"><b>!</b><span>\u70B9\u51FB\u751F\u6210\u540E\uFF0C\u63D0\u53D6\u7684\u8BBA\u6587\u6587\u5B57\u5C06\u53D1\u9001\u7ED9\u5F53\u524D\u9009\u62E9\u7684\u6A21\u578B\u670D\u52A1\u5546\uFF1BPDF \u6587\u4EF6\u672C\u8EAB\u4E0D\u4F1A\u4E0A\u4F20\u5230\u672C\u9875\u9762\u7684\u670D\u52A1\u5668\u3002</span></p>`,
  '<p class="model-disclosure"><b>!</b><span id="model-disclosure-copy"></span></p>',
  "model disclosure",
);

replaceOnce(
  '<div id="provider-pills" class="provider-pills" role="list"></div>',
  `<div id="provider-pills" class="provider-pills" role="list"></div>
            <div class="field-group compact">
              <div class="field-label"><label for="connection-mode">连接方式</label><small>默认解决跨域</small></div>
              <div class="select-wrap"><select id="connection-mode" class="select-input"><option value="relay">本机转发（推荐）</option><option value="direct">浏览器直连</option></select></div>
              <p id="connection-tip" class="connection-tip"></p>
            </div>`,
  "connection controls",
);

replaceOnce(
  String.raw`<div class="security-note"><b>!</b><p><strong>\u5B89\u5168\u63D0\u793A</strong>\u8FD9\u662F\u6D4F\u89C8\u5668\u76F4\u8FDE\u7248\u672C\uFF0CKey \u53EA\u4FDD\u5B58\u5728\u5F53\u524D\u6D4F\u89C8\u5668\u3002\u8BF7\u52FF\u5728\u516C\u5171\u7535\u8111\u4FDD\u5B58\u5BC6\u94A5\uFF1B\u82E5\u63A5\u53E3\u9650\u5236\u6D4F\u89C8\u5668\u8DE8\u57DF\uFF0C\u8BF7\u6539\u7528\u652F\u6301\u76F4\u8FDE\u7684\u4EE3\u7406\u5730\u5740\u3002</p></div>`,
  '<div class="security-note"><b>!</b><p><strong>安全提示</strong><span id="security-note-copy"></span></p></div>',
  "security disclosure",
);

replaceBetween(
  "function QQ(){",
  "function Au(){",
  `function QQ(){try{let r=JSON.parse(localStorage.getItem("paper-digest-provider-configs")||"{}"),t=JSON.parse(sessionStorage.getItem("paper-digest-session-keys")||"{}"),e=localStorage.getItem("paper-digest-connection-mode");Object.keys(T.configs).forEach(i=>{T.configs[i]={...T.configs[i],...r[i]||{},apiKey:t[i]||r[i]?.apiKey||""}}),T.prompt=localStorage.getItem("paper-digest-prompt")||au,(e==="relay"||e==="direct")&&(T.connectionMode=e)}catch{}}`,
  "load saved settings",
);

replaceBetween(
  "function Au(){",
  "function fQ(){",
  `function Au(){let r={},t={};Object.entries(T.configs).forEach(([e,i])=>{r[e]={...i,apiKey:i.rememberKey?i.apiKey:""},t[e]=i.apiKey}),iu(localStorage,"setItem","paper-digest-provider-configs",JSON.stringify(r)),iu(localStorage,"setItem","paper-digest-prompt",T.prompt),iu(localStorage,"setItem","paper-digest-connection-mode",T.connectionMode),iu(sessionStorage,"setItem","paper-digest-session-keys",JSON.stringify(t))}`,
  "save settings",
);

replaceBetween(
  "function x1(r){",
  "function Hl(r){",
  `function x1(r){T.configs[r]&&(T.provider=r,T.provider==="custom"&&T.connectionMode==="relay"&&(T.connectionMode="direct"),Y("#provider-select").value=r,Hg("[data-provider]").forEach(t=>t.classList.toggle("active",t.dataset.provider===r)),Au(),v1())}function v1(){let r=T.configs[T.provider],t=T.connectionMode==="relay";Y("#model-name").value=r.model,Y("#base-url").value=r.baseUrl,Y("#base-url").disabled=t,Y("#api-key").value=r.apiKey,Y("#remember-key").checked=!!r.rememberKey,Y("#key-status").textContent=r.apiKey?"已填写":"未填写",Y("#connection-mode").value=T.connectionMode,Y("#connection-mode").querySelector('option[value="relay"]').disabled=T.provider==="custom",Y("#connection-tip").textContent=T.provider==="custom"?"自定义兼容接口仅支持浏览器直连，请确保地址允许跨域访问。":t?"通过压缩包内的本机服务连接官方接口，解决本地 HTML 的 Failed to fetch。":"由浏览器直接访问模型接口，接口未开放 CORS 时会失败。",Y("#security-note-copy").textContent=t?"本机转发时，Key 与论文文本只经过当前电脑上的本机服务再发给模型厂商，不经过第三方中转；PDF 文件始终只在本机解析。":"浏览器直连时，Key 不经过本机服务；若出现 Failed to fetch，请切回本机转发。",Y("#model-disclosure-copy").textContent=t?"Key 与提取后的论文文字会经当前电脑上的本机服务发送给模型厂商，不经过第三方中转；PDF 文件始终只在本机解析。":"Key 与提取后的论文文字由浏览器直接发送给模型厂商；PDF 文件始终只在本机解析。",su()}`,
  "provider and connection refresh",
);

replaceBetween(
  "async function yQ(){",
  "async function wQ(){",
  `async function yQ(){let r=T.configs[T.provider],t=\`${"${T.prompt}"}\n\n补充要求：二维码来源网址为 ${"${T.sourceUrl||\"未提供\"}"}。网址只用于二维码与来源说明，不得据此编造论文内容。\`,e=\`请根据以下 PDF 抽取文本生成 JSON：\n\n${"${T.pdfText}"}\`,i=new AbortController,A=setTimeout(()=>i.abort(),15e4);try{if(T.connectionMode==="relay"){if(T.provider==="custom")throw new Error("自定义兼容接口不能使用在线转发，请选择浏览器直连。");let a=await fetch(T.relayUrl,{method:"POST",signal:i.signal,headers:{"content-type":"application/json"},body:JSON.stringify({provider:T.provider,apiKey:r.apiKey,model:r.model,system:t,user:e})}),s=await a.text(),n={};try{n=s?JSON.parse(s):{}}catch{throw new Error(\`转发服务返回了无法识别的内容（${"${a.status}"}）\`)}if(!a.ok)throw new Error(n?.error?.message||\`转发请求失败（${"${a.status}"}）\`);if(!n?.text)throw new Error("模型没有返回可用文本，请检查模型名称后重试。");return n.text}if(T.provider==="anthropic"){let a=r.baseUrl.replace(/\\\/$/,""),s=a.endsWith("/messages")?a:\`${"${a}"}/messages\`,n=await fetch(s,{method:"POST",signal:i.signal,headers:{"content-type":"application/json","x-api-key":r.apiKey,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:r.model,max_tokens:7e3,system:t,messages:[{role:"user",content:e}]})}),g=await n.text(),c={};try{c=g?JSON.parse(g):{}}catch{throw new Error(\`Claude 接口返回了无法识别的内容（${"${n.status}"}）\`)}if(!n.ok)throw new Error(c?.error?.message||\`Claude 请求失败（${"${n.status}"}）\`);return Array.isArray(c.content)?c.content.filter(l=>l.type==="text").map(l=>l.text||"").join("\\n"):""}let a=r.baseUrl.replace(/\\\/$/,""),s=a.endsWith("/chat/completions")?a:\`${"${a}"}/chat/completions\`,n=await fetch(s,{method:"POST",signal:i.signal,headers:{"content-type":"application/json",Authorization:\`Bearer ${"${r.apiKey}"}\`},body:JSON.stringify({model:r.model,messages:[{role:"system",content:t},{role:"user",content:e}],stream:!1})}),g=await n.text(),c={};try{c=g?JSON.parse(g):{}}catch{throw new Error(\`模型接口返回了无法识别的内容（${"${n.status}"}）\`)}if(!n.ok)throw new Error(c?.error?.message||\`模型请求失败（${"${n.status}"}）\`);return c?.choices?.[0]?.message?.content||""}catch(a){if(a instanceof TypeError&&/fetch|network|load failed/i.test(a.message))throw new Error(T.connectionMode==="direct"?"浏览器阻止了模型直连请求，请切换到在线转发。":"无法连接在线转发服务，请检查网络后重试。");throw a}finally{clearTimeout(A)}}`,
  "model request",
);

replaceBetween(
  "async function wQ(){",
  "function Ol(){",
  `async function wQ(){if(!T.pdfText){ei("error","请先上传并解析 PDF。");return}let r=T.configs[T.provider];if(!r.apiKey){R1("settings"),ei("error",\`请先填写 ${"${r.label}"} API Key。\`);return}T.busy="generating",Kl();let t=Y("#generate");t.disabled=!0,t.innerHTML='<span class="spin">◌</span><span>正在阅读与重组论文…</span>';try{let e=await yQ();T.data=EQ(mQ(e)),Pl(),ei("success","可视化解读已生成。请核对关键数据后再发布。")}catch(e){let i=e instanceof Error?e.name==="AbortError"?"请求超时，请缩短 PDF 或稍后重试。":e.message:"生成失败";ei("error",i)}finally{T.busy="",t.disabled=!1,t.innerHTML="<span>✦</span><span>生成可视化解读</span>"}}`,
  "generation error handling",
);

replaceOnce(
  'Y("#provider-select").addEventListener("change",r=>x1(r.target.value)),Y("#generate").addEventListener("click",wQ)',
  'Y("#provider-select").addEventListener("change",r=>x1(r.target.value)),Y("#connection-mode").addEventListener("change",r=>{T.connectionMode=r.target.value,Au(),v1()}),Y("#generate").addEventListener("click",wQ)',
  "connection event",
);

replaceOnce(
  "自定义兼容接口不能使用在线转发，请选择浏览器直连。",
  "自定义兼容接口不能使用本机转发，请选择浏览器直连。",
  "local relay custom-provider message",
);
replaceOnce(
  "转发服务返回了无法识别的内容",
  "本机服务返回了无法识别的内容",
  "local relay invalid response",
);
replaceOnce(
  "转发请求失败",
  "本机转发请求失败",
  "local relay request failure",
);
replaceOnce(
  "浏览器阻止了模型直连请求，请切换到在线转发。",
  "浏览器阻止了模型直连请求，请切换到本机转发。",
  "local relay direct-mode hint",
);
replaceOnce(
  "无法连接在线转发服务，请检查网络后重试。",
  "未检测到本机转发服务，请从完整包内双击“启动工具.cmd”。",
  "local relay launch hint",
);

await writeFile(outputPath, source);
console.log(JSON.stringify({ output: outputPath, bytes: Buffer.byteLength(source) }));
