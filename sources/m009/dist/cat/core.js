/* Browser-independent learning rules. No remote calls or automatic pronunciation scores. */
(function(root){
  const key=(c,s)=>`${c}:${s}`;
  function initial(){return {chapter:0,sentence:0,read:[],heard:[],checkpoints:[],quiz:{},words:[],saved:[],match:[],builders:[],ordered:false,retellChecks:[],draft:'',activeSeconds:0,settings:{rate:.8,voice:'',chineseVoice:'',repeat:false,autoNext:false},advert:{},capsule:[],updatedAt:null};}
  function clean(raw,lesson){
    const p=initial();if(!raw||typeof raw!=='object')return p;
    const all=lesson.chapters.flatMap((ch,c)=>ch.sentences.map((_,s)=>key(c,s)));
    const set=(v,allowed)=>Array.isArray(v)?[...new Set(v.filter(x=>allowed.includes(x)))]:[];
    p.read=set(raw.read,all);p.heard=set(raw.heard,all);
    const chapters=lesson.chapters.map((_,i)=>i);
    p.checkpoints=set(raw.checkpoints,chapters);
    const words=lesson.vocabulary.map(w=>w[0]);p.words=set(raw.words,words);p.saved=set(raw.saved,words);p.match=set(raw.match,words);
    p.chapter=Number.isInteger(raw.chapter)&&chapters.includes(raw.chapter)?raw.chapter:0;
    p.sentence=Number.isInteger(raw.sentence)&&raw.sentence>=0&&raw.sentence<lesson.chapters[p.chapter].sentences.length?raw.sentence:0;
    p.builders=set(raw.builders,lesson.builders.map((_,i)=>i));p.ordered=raw.ordered===true;
    p.retellChecks=set(raw.retellChecks,[0,1,2,3]);p.draft=typeof raw.draft==='string'?raw.draft.slice(0,12000):'';
    p.activeSeconds=Number.isFinite(raw.activeSeconds)?Math.max(0,Math.min(raw.activeSeconds,10000000)):0;
    if(raw.quiz&&typeof raw.quiz==='object')for(const [id,q] of Object.entries(raw.quiz))if(/^q\d+$/.test(id)&&q&&Number(id.slice(1))<lesson.chapters.length+lesson.extraQuestions.length)p.quiz[id]={correct:q.correct===true,attempts:Number.isInteger(q.attempts)?Math.max(0,Math.min(q.attempts,10000)):0,firstCorrect:q.firstCorrect===true};
    if(raw.settings){if([.65,.8,1].includes(Number(raw.settings.rate)))p.settings.rate=Number(raw.settings.rate);p.settings.voice=String(raw.settings.voice||'').slice(0,300);p.settings.chineseVoice=String(raw.settings.chineseVoice||'').slice(0,300);p.settings.repeat=raw.settings.repeat===true;p.settings.autoNext=raw.settings.autoNext===true;}
    if(raw.advert&&typeof raw.advert==='object')for(const k of ['name','topic','exhibit','hours','extra'])p.advert[k]=typeof raw.advert[k]==='string'?raw.advert[k].slice(0,200):'';
    p.capsule=set(raw.capsule,['a mobile phone','a games console','a rucksack','a digital camera','a book','a toy','a postcard','a watch']).slice(0,4);
    return p;
  }
  function chapterComplete(p,lesson,c){return p.checkpoints.includes(c)&&lesson.chapters[c].sentences.every((_,s)=>p.read.includes(key(c,s)));}
  function stats(p,lesson){const total=lesson.chapters.reduce((n,c)=>n+c.sentences.length,0);return {total,read:p.read.length,heard:p.heard.length,stars:lesson.chapters.filter((_,c)=>chapterComplete(p,lesson,c)).length,quizCorrect:Object.values(p.quiz).filter(q=>q.correct).length,quizAttempted:Object.keys(p.quiz).length,firstCorrect:Object.values(p.quiz).filter(q=>q.firstCorrect).length,words:p.words.length,percent:Math.round(p.read.length/total*100)};}
  function answer(p,id,correct){const prev=p.quiz[id];p.quiz[id]={correct:!!prev?.correct||correct,attempts:(prev?.attempts||0)+1,firstCorrect:prev?prev.firstCorrect:correct};}
  function add(arr,value){if(!arr.includes(value))arr.push(value);return arr;}
  function toggle(arr,value){const i=arr.indexOf(value);if(i<0)arr.push(value);else arr.splice(i,1);}
  function shuffle(a,random=Math.random){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
  function escape(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function orderCorrect(a,len){return a.length===len&&a.every((v,i)=>v===i);}
  root.LearningCore={key,initial,clean,chapterComplete,stats,answer,add,toggle,shuffle,escape,orderCorrect};
})(typeof window!=='undefined'?window:globalThis);
