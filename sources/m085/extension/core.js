(function (root) {
  'use strict';
  const URL_HOME = 'https://jimeng.jianying.com/ai-tool/home?type=music';
  const CATALOG=root.MusicCatalog||(typeof require==='function'?require('./catalog.js'):null);
  if(!CATALOG?.styles?.length)throw Error('风格资料库未载入，请重新加载扩展');
  const BATCH_SIZE=10, STYLES=CATALOG.styles;
  const PACKS={all:STYLES,...Object.fromEntries(CATALOG.groups.map(g=>[g.name,STYLES.filter(s=>s.group===g.name)]))};
  const VOICES=[
    {label:'随风格搭配',note:''},
    {label:'温暖男中音独唱',note:'主歌贴近叙述，副歌舒展，保持自然男中音音区。'},
    {label:'清澈女声独唱',note:'咬字清楚，以明亮自然的女声完成主旋律。'},
    {label:'有颗粒感的男声独唱',note:'保留适度沙哑颗粒，旋律和歌词清晰。'},
    {label:'男女对唱',note:'男声与女声分别承担主歌，桥段互相回应，副歌共同合唱。'},
    {label:'混声合唱团',note:'分层进入，以清晰主旋律带动多声部和声。'},
    {label:'童声独唱',note:'自然清亮的童声音色，旋律易唱，使用舒适音域和短句。'},
    {label:'男童独唱',note:'清亮自然的男童声，发声轻松，句间留有呼吸。'},
    {label:'女童独唱',note:'清澈明亮的女童声，咬字清楚，旋律简洁。'},
    {label:'儿童合唱团',note:'多名儿童齐唱主旋律，副歌加入简单二声部，节奏整齐。'},
    {label:'男女童对唱',note:'男童与女童轮流演唱主歌，相互回应，副歌共同齐唱。'},
    {label:'儿童与成人对唱',note:'童声与温暖成人声轮流演唱主歌，桥段一问一答，副歌共同合唱；两种声线保持可分辨。'},
    {label:'儿童与成年女声对唱',note:'童声与温柔成年女声交替主歌，以呼应句连接，副歌共同合唱。'},
    {label:'儿童与成年男声对唱',note:'童声与温暖成年男声交替主歌，成人声以舒适低音区衬托童声，副歌共同合唱。'},
    {label:'儿童与成人混声合唱',note:'儿童声部与成人男女声分组呼应，末段合唱；主旋律保持清晰。'},
    {label:'童声领唱＋成人和声',note:'儿童独唱承担主旋律，成人声在副歌提供轻柔和声，保持童声突出。'},
    {label:'成人领唱＋童声回应',note:'成人声叙述主歌，童声以短句回应，副歌加入儿童齐唱。'},
    {label:'纯器乐',note:'由主要旋律乐器承担主题表达。'}
  ];
  // These are editable creative defaults, not historical definitions of musical genres.
  const ARRANGEMENTS={
    '中国戏曲与民歌':{bpm:84,color:'#a36150',voice:'咬字清晰、富有叙事感的独唱',instruments:'围绕所选戏曲或民歌描述中的传统乐器展开，保持唱腔与伴奏呼应',structure:'器乐引子—叙事段—主题段—过门—主题回归—收束'},
    '古典声乐':{bpm:76,color:'#7f738d',voice:'清晰自然的古典声乐演唱',instruments:'钢琴、弦乐与克制的管乐，依据具体类型调整声部',structure:'主题呈示—发展—对比段—再现—完整终止'},
    '世界音乐':{bpm:96,color:'#8c7a38',voice:'富有地域节奏感的独唱',instruments:'采用所选类型描述中的地域乐器与节奏型，旋律乐器适度点缀'},
    '爵士与蓝调':{bpm:94,color:'#527c88',voice:'松弛、有呼吸感的独唱',instruments:'钢琴、低音提琴、鼓组与少量管乐，安排呼应与器乐间奏'},
    '摇滚与民谣':{bpm:108,color:'#757443',voice:'自然、有叙事力量的男声独唱',instruments:'木吉他或电吉他、贝斯和鼓组，按所选类型控制失真与密度'},
    '流行与都市':{bpm:106,color:'#ad7169',voice:'明亮自然的女声独唱',instruments:'电钢琴、贝斯、节奏吉他、鼓组与温暖合成器'},
    '电子与节奏':{bpm:122,color:'#667d8e',voice:'清晰、有空间感的原创人声',instruments:'合成器、电子鼓与低频脉冲，依据具体类型安排音色层次'},
    '嘻哈与说唱':{bpm:92,color:'#956458',voice:'吐字清晰、节奏鲜明的说唱与旋律副歌',instruments:'鼓机、贝斯、键盘和切分节奏，给人声保留空间'},
    '拉丁与加勒比':{bpm:112,color:'#8c783f',voice:'富有律动感的独唱',instruments:'节奏吉他、贝斯与层次分明的打击乐，遵循所选类型的节奏特征'},
    '情绪与听感':{bpm:88,color:'#93717c',voice:'自然清晰的独唱',instruments:'钢琴、吉他、弦乐或合成器，围绕目标情绪调整动态与密度'},
    '乐器主导':{bpm:88,color:'#617b74',voice:'克制温柔的独唱',instruments:'以指定乐器为主要音色，其他声部轻量承托'},
    '节庆与场景':{bpm:100,color:'#a37d49',voice:'清晰明亮的独唱与副歌和声',instruments:'钢琴、弦乐、吉他与打击乐，按场景控制热闹程度'},
    '主题与文化':{bpm:102,color:'#6c7e94',voice:'自然、有画面感的独唱',instruments:'围绕具体主题描述选取音色，主旋律、低音和节奏层次清晰'},
    '用途与媒介':{bpm:92,color:'#8d8164',voice:'清晰、克制的独唱',instruments:'主题旋律与简洁节奏构成核心，按用途调整配器密度'}
  };
  function shuffle(values,rng=Math.random){
    const a=values.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;
  }
  function sampleStyles(scope='all',rng=Math.random){
    const pool=PACKS[scope]||STYLES;
    const chosen=shuffle(pool,rng).slice(0,BATCH_SIZE),used=new Set(chosen.map(s=>s.id));
    const fillCount=BATCH_SIZE-chosen.length;
    if(fillCount)chosen.push(...shuffle(STYLES.filter(s=>!used.has(s.id)),rng).slice(0,fillCount));
    return {styles:shuffle(chosen,rng),fillCount,scope:PACKS[scope]?scope:'all'};
  }
  function creativeStyle(s){
    const a=ARRANGEMENTS[s.group]||ARRANGEMENTS['流行与都市'];
    let bpm=a.bpm,voice=a.voice,instruments=a.instruments;
    const text=s.en+' '+s.name;
    if(/ambient|meditat|sleep|lullaby|冥想|安睡|摇篮/i.test(text))bpm=66;
    else if(/drum and bass|drum & bass|jungle|hardcore/i.test(text))bpm=170;
    else if(/dubstep|grime|trap/i.test(text))bpm=140;
    else if(/punk|metal|speed/i.test(text))bpm=144;
    else if(/house|techno|trance|disco/i.test(text))bpm=124;
    if(s.kind==='instruments')instruments=`以${s.name}（${s.en}）作为主要音色，间奏突出其旋律，其他配器轻量承托`;
    if(/children|kids|nursery|儿歌|儿童|童谣/i.test(text))voice='儿童合唱团';
    const frame=s.kind==='genres'?`以${s.name}（${s.en}）为主风格`:
      `以“${s.name}（${s.en}）”作为${s.kindLabel}创作方向，以旋律清晰、结构完整的歌曲编排承载该方向`;
    return {...s,...a,english:s.en,styleId:s.id,style:s.name,bpm,voice,instruments,
      structure:a.structure||'短前奏—主歌—副歌—第二主歌—桥段—副歌回归—完整尾奏',
      detail:s.description,frame,suffix:s.name};
  }
  const DEFAULT_SETTINGS = {folder:'即梦音乐', interval:12, timeout:20, settle:20, maxVariants:2, autoDownload:true,
    adapter:{prompt:'',submit:'',card:'',download:'',mode:''}};
  const STATUS = {draft:'待提交',preparing:'准备填写',submitting:'已记录提交意图',waiting:'等待音乐',downloading:'正在下载',done:'下载完成',generated:'已生成 · 待统一下载',ready:'音乐已就绪',uncertain:'待核对',skipped:'已跳过'};
  function safeName(value, max=56) {
    let s=String(value||'未命名').normalize('NFKC').replace(/[<>:"/\\|?*\x00-\x1f]/g,'_').replace(/\.{2,}/g,'_').replace(/^[. ]+|[. ]+$/g,'').slice(0,max);
    if(!s)s='未命名'; if(/^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i.test(s))s='_'+s;
    return s;
  }
  function folderName(value) {
    const s=String(value||'').trim();
    if(!s || /^[\\/]/.test(s)||/^[a-z]:/i.test(s)||s.split(/[\\/]/).some(v=>!v||v==='.'||v==='..')) throw Error('请输入下载目录下的相对子目录，例如 即梦音乐；请在浏览器设置中修改下载根目录。');
    return s.split(/[\\/]/).map(v=>safeName(v,64)).join('/');
  }
  function normalizeSettings(input={}) {
    const out={...DEFAULT_SETTINGS,...input,adapter:{...DEFAULT_SETTINGS.adapter,...input.adapter}};
    out.folder=folderName(out.folder);
    for(const [k,lo,hi] of [['interval',5,300],['timeout',2,120],['settle',10,90],['maxVariants',1,4]]){
      out[k]=Number(out[k]);if(!Number.isFinite(out[k]))throw Error('等待时间与数量须为数字');out[k]=Math.min(hi,Math.max(lo,Math.round(out[k])));
    }
    out.autoDownload=out.autoDownload!==false;return out;
  }
  function themeBrief(theme) {
    const rules=[
      [/校园|毕业|同学|青春|老师|大学/,['操场、树影、旧课桌与启程的车站','从相遇的轻快，到告别的不舍，再到共同奔赴未来']],
      [/山河|自然|森林|田野|秋|春|乡村|故乡|生态|地图/,['山风、溪流、田野与远处的灯火','从静静观察，到感受连接，再到珍惜与守护']],
      [/未来|科技|数字|智能|宇宙|星|机器人/,['城市灯光、星轨、跃动的信号与人们的笑脸','从好奇探索，到迎接挑战，再到带着温度向前']],
      [/爱情|恋|思念|相遇|婚|陪伴/,['窗边的光、雨后街道与两个人熟悉的日常','从细小心动，到思念回望，再到坚定陪伴']],
      [/梦想|奋斗|启程|出发|勇敢|团队/,['清晨的路、远方的光与并肩前行的人','从内心犹疑，到行动与突破，再到坚定而明亮']]
    ];
    const hit=rules.find(([re])=>re.test(theme));
    return hit?{imagery:hit[1][0],arc:hit[1][1]}:{imagery:`围绕“${theme}”选择三个具体可感的生活画面`,arc:'从细节叙述，到情感展开，再到清晰有力的主题回归'};
  }
  function makePrompt(job) {
    const instrumental=job.voice==='纯器乐'||job.language==='纯音乐';
    return [`创作一首完整的原创${instrumental?'器乐作品':'歌曲'}，主题：${job.theme}。`,
      `曲名：《${job.title}》。作品标记：${job.marker}。`,
      `风格：${job.frame||job.style+'（'+job.english+'）'}；创作速度约 ${job.bpm} BPM；情绪：${job.mood}。`,
      job.description?`类型特征：${job.description}`:'',
      instrumental?'演奏：纯器乐，由主要旋律乐器承担主题表达。':`演唱：${job.voice}；歌词语种：${job.language}；吐字清晰、表达自然。`,
      !instrumental&&job.voiceNote?`声部安排：${job.voiceNote}`:'',
      `编曲：${job.instruments}。结构：${job.structure}。`,
      `主题意象：${job.imagery}。叙事发展：${job.arc}。`,
      instrumental?'主题动机贯穿全曲，器乐层次有起伏。':'请依据主题创作完整原创歌词，主歌具体叙事，副歌突出核心主题并易于记忆。',
      `制作要求：${job.detail.replace(/[。；]+$/,'')}；${instrumental?'主要旋律与伴奏':'人声与伴奏'}平衡，结尾完整。${job.duration==='智能时长'?'长度按平台智能时长。':`目标时长约${job.duration}，以平台支持为准。`}`,
      job.extra?`补充要求：${job.extra}`:''].filter(Boolean).join('\n');
  }
  function generate(input={}, now=new Date()) {
    const theme=String(input.theme||'').trim();if(!theme)throw Error('先写下本次创作的主题');if(theme.length>240)throw Error('主题请控制在240字以内');
    const id=now.toISOString().replace(/[-:TZ.]/g,'').slice(0,17)+'-'+Math.random().toString(36).slice(2,6);
    const brief=themeBrief(theme), selection=sampleStyles(input.pack||'all'),styles=selection.styles.map(creativeStyle);
    const langs=['普通话','English','普通话','粤语','普通话与English双语'];
    const jobs=styles.map((style,i)=>{
      const marker='JM'+id.slice(-9).replace(/-/g,'').toUpperCase()+'-'+(i+1);
      const j={...style,...brief,id:id+'-'+i,marker,index:i+1,theme,title:theme.slice(0,20)+' · '+style.suffix,
        style:style.name,language:input.language==='组合语种'?langs[i%langs.length]:input.language||'普通话',voice:input.voice&&input.voice!=='随风格搭配'?input.voice:style.voice,
        mood:input.mood||'有画面感，情绪层次清晰',duration:input.duration||'智能时长',extra:String(input.extra||'').trim(),status:'draft',downloads:[],outputs:[],selected:true};
      j.voiceNote=VOICES.find(v=>v.label===j.voice)?.note||'';
      j.prompt=makePrompt(j);return j;
    });
    return {id,theme,createdAt:now.toISOString(),status:'idle',jobs,scope:selection.scope,fillCount:selection.fillCount,catalogCount:STYLES.length,logs:[{time:now.toISOString(),text:`已从${selection.scope==='all'?'全库':selection.scope}随机抽取${BATCH_SIZE}种不同类型${selection.fillCount?'，其中'+selection.fillCount+'种从其他分类补足':''}；提示词可编辑。`}]};
  }
  function audioUrl(url) {try {const u=new URL(url);return ['https:','http:'].includes(u.protocol)&&!u.username&&!u.password;}catch{return false;}}
  function fileExt(url,mime=''){
    const m=String(url).split(/[?#]/)[0].match(/\.(mp3|wav|m4a|aac|ogg|flac|opus)$/i);if(m)return m[1].toLowerCase();
    return ({'audio/mpeg':'mp3','audio/mp3':'mp3','audio/wav':'wav','audio/x-wav':'wav','audio/mp4':'m4a','audio/aac':'aac','audio/ogg':'ogg','audio/flac':'flac','audio/opus':'opus'})[mime]||'';
  }
  function batchFolder(batch,settings){return folderName(settings.folder)+'/'+safeName(batch.theme)+'/'+safeName(batch.id);}
  function downloadStem(batch,job,variant,settings){return batchFolder(batch,settings)+'/'+String(job.index).padStart(2,'0')+'_'+safeName(job.title)+'_'+String(variant).padStart(2,'0');}
  function actionable(batch){
    const jobs=batch.jobs.filter(j=>j.selected!==false);
    return jobs.find(j=>['submitting','uncertain','waiting','preparing'].includes(j.status))
      ||jobs.find(j=>j.status==='draft')
      ||jobs.find(j=>['generated','downloading'].includes(j.status));
  }
  function downloadMatches(item,p,extensionId,now=Date.now()){
    if(!p||now-p.startedAt>90000)return false;
    if(p.kind==='url')return item.byExtensionId===extensionId&&(item.url===p.url||item.finalUrl===p.url);
    const fromSite=[item.url,item.finalUrl,item.referrer].some(u=>/^blob:https:\/\/jimeng\.jianying\.com\//.test(u||'')||/^https:\/\/jimeng\.jianying\.com\//.test(u||''));
    const started=Date.parse(item.startTime||'');
    return fromSite&&(!Number.isFinite(started)||started>=p.startedAt-1000)
      &&((item.mime||'').startsWith('audio/')||(!/^(text\/|image\/|application\/(json|pdf))/.test(item.mime||'')&&!!fileExt(item.filename||item.url)));
  }
  function needsReview(job){return job.status==='submitting'||job.status==='uncertain';}
  function selectNew(outputs,baseline=[]){const old=new Set(baseline);return outputs.filter(o=>!old.has(o.key));}
  const api={URL_HOME,CATALOG,BATCH_SIZE,STYLES,PACKS,VOICES,sampleStyles,creativeStyle,DEFAULT_SETTINGS,STATUS,safeName,folderName,normalizeSettings,themeBrief,makePrompt,generate,audioUrl,fileExt,batchFolder,downloadStem,actionable,needsReview,selectNew,downloadMatches};
  root.MusicCore=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
