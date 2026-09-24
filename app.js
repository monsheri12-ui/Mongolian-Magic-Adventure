
(async()=>{
 const root=document.getElementById('mm-adventure'),$=s=>root.querySelector(s),$$=s=>[...root.querySelectorAll(s)];
 const data=await fetch('chapter.json').then(r=>{if(!r.ok)throw Error('Не удалось загрузить главу');return r.json();}),art={"bakery-alarmed": "art-bakery-alarmed.webp", "bakery-approach": "art-bakery-approach.webp", "bakery-name": "art-bakery-name.webp", "breakfast": "art-breakfast.webp", "cat-corner": "art-cat-corner.webp", "cat-watch": "art-cat-watch.webp", "cloaked-street": "art-cloaked-street.webp", "daylight-owls": "art-daylight-owls.webp", "departure": "art-departure.webp", "family": "art-family.webp", "house": "art-house.webp", "office": "art-office.webp", "office-hesitation": "art-office-hesitation.webp", "office-window": "art-office-window.webp", "owl": "art-owl.webp", "petunia": "art-petunia.webp", "potters": "art-potters.webp", "secret": "art-secret.webp", "purple-greeting": "art-purple-greeting.webp", "evening-news": "art-evening-news.webp", "night-cat": "art-night-cat.webp", "night-dumbledore": "art-night-dumbledore.webp", "night-professors": "art-night-professors.webp", "hagrid-arrival": "art-hagrid-arrival.webp", "baby-doorstep": "art-baby-doorstep.webp"};
 const TOTAL=data.scenes.length,LAST=TOTAL-1,legacyRefKeys=Object.keys(data.legacyRefs);
 const levels=['Начальный','Средний','Продвинутый'],byId=Object.fromEntries(data.scenes.map(s=>[s.id,s]));
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=n=>`<i data-lucide="${n}" aria-hidden="true"></i>`;
 const split=s=>s.match(/[А-Яа-яЁёӨөҮү]+|[^А-Яа-яЁёӨөҮү]+/g)||[],isWord=t=>/^[А-Яа-яЁёӨөҮү]+$/.test(t),getWords=s=>split(s).filter(isWord);
 const fresh=()=>({v:4,grammarAll:false,view:'play',scene:0,level:0,read:[],furthest:0,discoveries:{},focus:{},saved:[],finished:false,legacyProgress:null,reviews:{},study:freshStudy()});
 let state=fresh(),externalStateSignature='',help=null,selected=null,status='',lastScene=null,translations=new Set();
 function getScene(){return data.scenes[state.scene];}
 function entry(w,sceneId=getScene().id,tokenIndex=null,level=state.level){const low=w.toLowerCase(),scene=byId[sceneId];const token=scene?.tokenOverrides?.[level]?.[tokenIndex];if(token)return {...data.lex[low],...token};const contextual=scene?.lexOverrides?.[low];if(contextual)return {...data.lex[low],...contextual};const overrides={
 'unseen-child':{авч:{lemma:'авч',ru:'хотя; но',note:'В мэдэх авч — уступительная книжная связь «хотя знают». Здесь не глагол «взять».'}},
 'neighbors-fear':{бол:{lemma:'бол',ru:'же; интересно, что…',note:'Юу гэх бол — что же скажут? Частица передаёт размышление, а не тему предложения.'}},
 'tuesday':{гэдэг:{lemma:'гэдэг',ru:'что…; о том, что…',note:'Связывает содержание эхлэнэ «начнутся» со словом сэжиг «подозрение». Здесь не «по имени».'}},
 'distance':{хэрэг:{lemma:'хэрэг',ru:'дело в том; итоговое пояснение',note:'Болсон хэрэг завершает объяснение причины. Здесь не отдельное «дело».'}}
 };if(overrides[sceneId]?.[low])return {...data.lex[low],...overrides[sceneId][low]};
 if(low==='ч'&&['unseen-child','first-owl','denial','tuesday'].includes(sceneId))return {...data.lex[low],lemma:'ч',ru:'даже; тоже; частица в «никто / никогда»',note:sceneId==='unseen-child'?'Хэзээ ч + отрицание — никогда не.':sceneId==='first-owl'?'Хэн нь ч + отрицание — никто. В адаптации өнгөрсөн ч — хотя пролетела.':sceneId==='denial'?'Тэр ч байтугай — более того; ямар ч … -гүй — совсем никакой.':'Тэнгэр ч — даже небо; юу ч + отрицание — ничто.'};
 if(low==='л')return {...data.lex[low],lemma:'л',ru:'именно; только; лишь',note:'Выделяет слово перед собой: энэ хүүхэд л — именно этот ребёнок; энэ өглөө л — именно этим утром.'};
 if(low==='зуур')return {...data.lex[low],lemma:'зуур',ru:'пока; в течение',note:'Действие на -х + зуур — пока происходит это действие. Зүүж байх зуур — пока надевал.'};
 if(low==='түүний')return {...data.lex[low],lemma:'тэр',ru:'его; её',note:sceneId==='disapproval'?'Түүний дүү — её младшая сестра; речь о сестре Петуньи.':'Родительная форма тэр; род и лицо определяются контекстом.'};
 if(low==='түүнийг')return {...data.lex[low],lemma:'тэр',ru:'его; её; это',note:sceneId==='unseen-child'?'Здесь относится к сыну Поттеров: никогда его не видели.':'Форма определённого дополнения; может отсылать к человеку или упомянутой ситуации.'};if(low==='дахин'&&sceneId==='petunia')return {...data.lex[low],lemma:'дахин',ru:'раз; раза',note:'Хоёр дахин — в два раза. В других контекстах дахин может значить «снова».'};if(low==='нь')return {...data.lex[low],lemma:'нь',ru:'его; её; их; тематическая частица',note:sceneId==='nonsense'?'В учир нь: потому что; дело в том, что.':sceneId==='petunia'?'Отнесённость зависит от группы: хүзүү нь — её шея; яриаг нь — их разговоры.':sceneId==='dudley'?'Хүү нь — их сын, уже названный Дадли.':'Относит предмет к уже известному лицу или выделяет тему; точный перевод зависит от группы.'};return data.lex[low];}
 function savedDetail(w){
  if(w.kind==='oldref'){const ref=data.legacyRefs[w.ref],surface=ref?.words[w.index],en=data.oldLex[surface?.toLowerCase()];return en?{...en,surface,context:ref.context}:null;}
  if(w.kind==='legacy')return {lemma:w.lemma,ru:w.ru,note:'Слово из предыдущей версии игры.',context:''};
  const s=byId[w.scene];if(!s||![0,1,2].includes(w.level))return null;const surface=getWords(s.text[w.level])[w.index],en=surface&&entry(surface,s.id,w.index,w.level);return en?{...en,surface,context:s.text[w.level]}:null;
 }
  // Lossless fallback for a large vocabulary with review dates. Small states
 // keep the readable v4 format; no words or progress are dropped to fit.
 function compactSnapshot(game){
  const json=JSON.stringify(game),bytes=new TextEncoder().encode(json);
  if(bytes.length<12000)return game;
  const dictionary=new Map();let next=256,phrase='',codes=[];
  for(const byte of bytes){const ch=String.fromCharCode(byte),joined=phrase+ch;
   if(phrase===''||dictionary.has(joined)){phrase=joined;continue;}
   codes.push(phrase.length===1?phrase.charCodeAt(0):dictionary.get(phrase));
   if(next<65536)dictionary.set(joined,next++);phrase=ch;
  }
  if(phrase)codes.push(phrase.length===1?phrase.charCodeAt(0):dictionary.get(phrase));
  const binary=codes.map(n=>String.fromCharCode(n>>8,n&255)).join('');
  const packed={v:4,codec:'lzw16-v1',payload:btoa(binary)};
  return JSON.stringify(packed).length<bytes.length?packed:game;
 }
 function expandSnapshot(game){
  if(game?.codec!=='lzw16-v1')return game;
  const binary=atob(game.payload);if(binary.length%2)throw Error('Incomplete saved state');
  const dictionary=Array.from({length:256},(_,i)=>String.fromCharCode(i));let next=256,previous='',chunks=[];
  for(let i=0;i<binary.length;i+=2){const code=(binary.charCodeAt(i)<<8)|binary.charCodeAt(i+1),phrase=dictionary[code]??(code===next&&previous?previous+previous[0]:null);
   if(phrase===null)throw Error('Invalid saved state');chunks.push(phrase);
   if(previous&&next<65536)dictionary[next++]=previous+phrase[0];previous=phrase;
  }
  const text=chunks.join('');return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(text,c=>c.charCodeAt(0))));
 }

 function restore(raw){
  let s=raw?.privateContent?.game;if(!s||![1,3,4].includes(s.v))return false;externalStateSignature=JSON.stringify(s);try{s=expandSnapshot(s);}catch{return false;}
  if(s.v===4&&s.packed){
   if(s.packVersion===3){
    s={...s,read:(Array.isArray(s.read)?s.read:[]).map(i=>data.scenes[i]?.id).filter(Boolean),discoveries:Object.fromEntries((Array.isArray(s.discoveries)?s.discoveries:[]).filter(n=>Number.isInteger(n)&&data.scenes[Math.floor(n/4)]).map(n=>[data.scenes[Math.floor(n/4)].id,[0,1].filter(i=>n%4&(1<<i))])),focus:Object.fromEntries((Array.isArray(s.focus)?s.focus:[]).filter(n=>Number.isInteger(n)&&data.scenes[Math.floor(n/2)]).map(n=>[data.scenes[Math.floor(n/2)].id,n%2]))};
   }
   s={...s,saved:(s.saved||[]).map(w=>{
   let item;if(s.packVersion>=2&&Array.isArray(w)){
    item=w.length===3?{kind:'scene',scene:data.scenes[w[0]]?.id,level:w[1],index:w[2]}:{kind:'oldref',ref:legacyRefKeys[w[0]],index:w[1]};
    const detail=savedDetail(item);return detail?{...item,lemma:wordKey(detail)}:null;
   }
   return w?.s?{kind:'scene',lemma:w.l,scene:w.s,level:w.v,index:w.i}:w?.o?{kind:'oldref',lemma:w.l,ref:w.o,index:w.i}:w?{kind:'legacy',lemma:w.l,ru:w.r}:null;
  }).filter(Boolean)};delete s.packed;delete s.packVersion;}
  if(s.v===4){state={...fresh(),...s};state.grammarAll=s.grammarAll===true;state.storyQuery=typeof s.storyQuery==='string'?s.storyQuery.slice(0,160):'';state.storyChapter=data.scenes.some(x=>chapterOf(x)===s.storyChapter)?s.storyChapter:1;state.level=[0,1,2].includes(s.level)?s.level:0;state.scene=Number.isInteger(s.scene)?Math.max(0,Math.min(LAST,s.scene)):0;state.view=['play','words','story','practice','quiz'].includes(s.view)?s.view:'play';state.read=Array.isArray(s.read)?[...new Set(s.read.filter(id=>byId[id]))]:[];state.furthest=Math.max(state.scene,Math.min(LAST,Number(s.furthest)||0));state.discoveries=s.discoveries&&typeof s.discoveries==='object'?Object.fromEntries(Object.entries(s.discoveries).filter(([k])=>byId[k]).map(([k,v])=>[k,Array.isArray(v)?[...new Set(v.filter(x=>x===0||x===1))]:[]])):{};state.focus=s.focus&&typeof s.focus==='object'?Object.fromEntries(Object.entries(s.focus).filter(([k,v])=>byId[k]&&(v===0||v===1))):{};state.saved=Array.isArray(s.saved)?s.saved.filter(w=>w&&typeof w.lemma==='string'&&savedDetail(w)):[];state.finished=!!s.finished&&state.read.length===TOTAL;restoreStudy(s);delete state.studyPacked;return true;}
  state=fresh();state.level=[0,1,2].includes(s.level)?s.level:0;state.legacyProgress={version:s.v,read:Array.isArray(s.read)?s.read:[],solved:s.solved||s.legacyCompleted||[[],[],[]],episode:s.episode??0,line:s.line??0};
  if(s.v===1){for(const w of data.legacy){if(s.solved?.[w.level]?.includes(w.task)&&!state.saved.some(x=>x.lemma===w.mn))state.saved.push({kind:'legacy',lemma:w.mn,ru:w.ru});}}
  if(s.v===3){for(const w of s.saved||[]){const value=w.legacy?{kind:'legacy',lemma:w.lemma,ru:w.ru}:{kind:'oldref',lemma:w.lemma,ref:`${w.line}:${w.level}`,index:w.index};if(savedDetail(value)&&!state.saved.some(x=>x.lemma===value.lemma))state.saved.push(value);}}
  return true;
 }
 const sceneNumber=id=>data.scenes.findIndex(s=>s.id===id);
 function packed(){return {...state,packed:true,packVersion:3,read:state.read.map(sceneNumber),discoveries:Object.entries(state.discoveries).map(([id,v])=>sceneNumber(id)*4+v.reduce((mask,i)=>mask|(1<<i),0)),focus:Object.entries(state.focus).map(([id,i])=>sceneNumber(id)*2+i),studyPacked:true,reviews:packReviews(),study:packStudy(),saved:state.saved.map(w=>w.kind==='scene'?[sceneNumber(w.scene),w.level,w.index]:w.kind==='oldref'?[legacyRefKeys.indexOf(w.ref),w.index]:{l:w.lemma,r:w.ru})};}
 function save(){const payload={modelContent:{game:'По следам магии',format:'Сценическое исследование; сюжет книги сохраняется',level:levels[state.level],selectedChapter:chapterOf(getScene()),chapterPercent:chapterProgress().percent,sentenceStart:getScene().sentenceStart,sentenceEnd:getScene().sentenceEnd,scene:state.scene+1,sceneTitle:getScene().title,sourcePage:getScene().page,startsAtFirstSentence:true,scenesRead:state.read.length,totalScenes:TOTAL,savedWordCount:state.saved.length,savedWords:state.saved.slice(-30).map(w=>savedDetail(w)?.lemma||w.lemma),grammarMode:state.grammarAll?'Вся грамматика':'Чтение',practiceMode:state.study.mode,practiceRemaining:state.study.session?.queue.length??0},privateContent:{game:compactSnapshot(packed())}};externalStateSignature=JSON.stringify(payload.privateContent.game);try{window.openai?.setWidgetState?.(payload)?.catch?.(()=>{});}catch{}}

 const wordKey=en=>en.saveKey||en.lemma;
 const isSaved=en=>state.saved.some(w=>w.lemma===wordKey(en));
 function hydrate(){try{globalThis.lucide?.createIcons({attrs:{width:16,height:16}});}catch{}$$('button').forEach(b=>b.classList.add('cursor-interaction'));}
 function addWord(index){const s=getScene(),word=getWords(s.text[state.level])[index],en=word&&entry(word,s.id,index,state.level);if(!en)return;if(isSaved(en)){status=`«${en.lemma}» уже есть в словаре.`;}else{state.saved.push({kind:'scene',lemma:wordKey(en),scene:s.id,level:state.level,index});status=`«${en.lemma}» сохранено вместе с предложением.`;save();}render();}
 function renderText(){root.dataset.grammarMode=state.grammarAll?'all':'reading';const toggle=$('#cn-grammar-mode');toggle.setAttribute('aria-pressed',state.grammarAll);toggle.querySelector('.cn-grammar-check').textContent=state.grammarAll?'✓':'';$('#cn-grammar-legend').hidden=!state.grammarAll;let i=0;const s=getScene(),phrases=passagePhrases(),related=new Set(help==='words'&&selected!==null?relatedPhrases(selected).flatMap(p=>p.indices):[]);$('#cn-text').innerHTML=split(s.text[state.level]).map(t=>{if(!isWord(t))return esc(t);const index=i++,en=entry(t,s.id,index,state.level),marked=phrases.some(p=>p.kind!=='lexical'&&p.focus.includes(index)),particle=phrases.some(p=>p.kind==='particle'&&p.focus.includes(index));return `<button type="button" data-word="${index}" class="cn-word ${isSaved(en)?'saved':''} ${marked?'has-grammar':''} ${particle?'grammar-particle':''} ${related.has(index)?'is-related':''}" aria-label="Разобрать слово ${esc(t)}" aria-pressed="${help==='words'&&selected===index}">${wordForm(t,en)}</button>`;}).join('');}
 function renderHelp(){
  const s=getScene();$('#cn-question').setAttribute('aria-expanded',!!help);$('#cn-help').hidden=!help;if(!help){$('#cn-help').replaceChildren();return;}
  let content='';if(help==='grammar')content=`<p class="cn-translation">${esc(s.ru[state.level])}</p>${phraseDetails()}<details class="cn-sentence-grammar"><summary>Как устроено предложение</summary><div>${s.grammar[state.level]}</div></details>`;
  else{const ws=getWords(s.text[state.level]);let detail='';if(selected!==null&&ws[selected]){const en=entry(ws[selected],s.id,selected,state.level),saved=isSaved(en);detail=`<div class="cn-word-detail"><div class="cn-word-name"><strong lang="mn">${wordForm(ws[selected],en)}</strong><span>${lemmaLabel(en)}: <b lang="mn">${esc(en.lemma)}</b>${en.lemmaRu?` — ${esc(en.lemmaRu)}`:''}</span></div><p><b>${esc(en.ru)}</b></p>${wordParts(en)}${relatedPhrases(selected).some(p=>p.note===en.note)?'':`<p>${esc(en.note)}</p>`}${phraseDetails(selected)}<div class="cn-word-actions"><button type="button" class="${saved?'cn-secondary':'cn-primary'}" data-save="${selected}" ${saved?'disabled':''}>${icon(saved?'check':'plus')} ${saved?'Уже в моих словах':'Добавить в мои слова'}</button>${saved?'<button type="button" class="cn-primary" data-view="practice">Потренировать слова →</button>':''}</div></div>`;}
   const seen=new Set();content=detail||`<div class="cn-word-list">${ws.map((w,i)=>{if(seen.has(w.toLowerCase()))return '';seen.add(w.toLowerCase());const en=entry(w,s.id,i,state.level);return `<div class="cn-word-row"><button type="button" class="cn-word-entry" data-word="${i}"><strong lang="mn">${esc(w)}</strong><span>${esc(en.ru)}</span></button><button type="button" class="cn-small-save" data-save="${i}" aria-label="Добавить слово ${esc(w)}" aria-pressed="${isSaved(en)}">${isSaved(en)?'✓':'+'}</button></div>`;}).join('')}</div>`;
  }
  $('#cn-help').innerHTML=`<div class="cn-help-top"><div class="cn-tabs" role="tablist" aria-label="Разбор отрывка"><button type="button" role="tab" id="cn-tab-grammar" data-help="grammar" aria-selected="${help==='grammar'}" aria-controls="cn-help-content">Грамматика</button><button type="button" role="tab" id="cn-tab-words" data-help="words" aria-selected="${help==='words'}" aria-controls="cn-help-content">Слова</button></div><button type="button" class="cn-close" id="cn-close" aria-label="Закрыть разбор">${icon('x')}</button></div><div class="cn-help-content" role="tabpanel" id="cn-help-content" aria-labelledby="cn-tab-${help}">${content}</div>`;
 }
 function renderPlay(){const s=getScene();$('#cn-shot').dataset.asset=s.asset;renderOtherForms();
  if(lastScene!==s.id){$('#cn-art').src=art[s.asset];lastScene=s.id;translations.clear();}$('#cn-art').alt=`Иллюстрация сцены «${s.title}»`;$('#cn-speaker-name').textContent=s.speaker||'Рассказчик';renderText();renderHelp();
  const discovered=state.discoveries[s.id]||[],focus=state.focus[s.id];$('#cn-discovered').textContent=`Замечено ${discovered.length} / 2`;
  const promptShown=translations.has('prompt');$('#cn-prompt-ru').hidden=!promptShown;const promptButton=$('[data-translate="prompt"]');promptButton.setAttribute('aria-expanded',promptShown);promptButton.textContent=promptShown?'Скрыть':'Перевод';promptButton.setAttribute('aria-label',promptShown?'Скрыть перевод вопроса':'Показать перевод вопроса');
  $('#cn-choices').innerHTML=s.choices.map((c,i)=>{const shown=translations.has(String(i));return `<div class="cn-choice-wrap ${focus===i?'is-active':''}"><div class="cn-choice-top"><button type="button" class="cn-choice" data-choice="${i}" aria-pressed="${focus===i}"><span class="cn-choice-number">${i+1}</span><span lang="mn">${esc(c.labelMn)}</span><span class="cn-choice-check">${discovered.includes(i)?'✓':icon('eye')}</span></button><button type="button" class="cn-translate" data-translate="${i}" aria-expanded="${shown}" aria-controls="cn-choice-ru-${i}" aria-label="${shown?'Скрыть':'Показать'} перевод варианта ${i+1}">${shown?'Скрыть':'Перевод'}</button></div><p class="cn-choice-ru" lang="ru" id="cn-choice-ru-${i}" ${shown?'':'hidden'}>${esc(c.labelRu)}</p></div>`;}).join('');
  const choice=focus===0||focus===1?s.choices[focus]:null,observationShown=translations.has('observation-'+focus);$('#cn-observation').hidden=!choice;$('#cn-observation').innerHTML=choice?`<div class="cn-observation">${icon('notebook-pen')}<div class="cn-observation-body"><span class="cn-observation-label">Наблюдение</span><strong lang="mn">${esc(choice.phrase)}</strong><button type="button" class="cn-translate cn-observation-toggle" data-translate="observation-${focus}" aria-expanded="${observationShown}" aria-controls="cn-observation-note">${observationShown?'Скрыть перевод и разбор':'Перевод и разбор наблюдения'}</button><p id="cn-observation-note" lang="ru" ${observationShown?'':'hidden'}>${esc(choice.note)}</p></div></div>`:'';
  $('#cn-back').disabled=state.scene===0;$('#cn-next').textContent=state.scene<LAST?'Продолжить историю →':state.finished?'Перечитать главу ↻':'Завершить главу →';$('#cn-progress').textContent=`Глава ${chapterOf(s)} · прочитано ${chapterProgress().percent}%`;$('#cn-reading-position').textContent=`Глава ${chapterOf(s)} · ${sentenceLabel(s)} · отрывок ${state.scene+1} из ${TOTAL}`;
  $('#cn-end').hidden=state.scene!==LAST;$('#cn-end').innerHTML=`<h3>Конец первой главы</h3><p>Гарри Поттер и философский камень · Глава 1. Мальчик, который выжил</p><p>Харри спит на пороге дома Дурслей. По всей стране люди поднимают бокалы за мальчика, который выжил.</p><p>${state.finished?`Первая глава прочитана · 100%. Вы прошли все ${TOTAL} отрывков.`:'Это последний отрывок главы. Нажмите «Завершить главу», чтобы отметить его прочитанным.'} В «Хронике» можно найти любое предложение. Следующая глава пока не добавлена.</p><button type="button" class="cn-primary" data-view="words">Повторить мои слова ${icon('arrow-right')}</button>`;
 }
 function renderWords(){
  $('#cn-words').innerHTML=`<h2>Мои слова <span style="font-size:15px;color:var(--cn-muted)">${state.saved.length}</span></h2><p>Слова остаются с тобой между сценами. Сохраняются форма из текста, значение и предложение.</p>${state.saved.length?`${studyLauncher()}<div class="cn-journal">${state.saved.map((w,i)=>{const d=savedDetail(w);return `<article class="cn-entry"><div class="cn-entry-top"><h3 lang="mn">${esc(d.lemma)}</h3><button type="button" data-remove="${i}" aria-label="Убрать слово ${esc(d.lemma)}">${icon('x')}</button></div><p><b>${esc(d.ru)}</b></p>${d.surface?`<p>В тексте: <b lang="mn">${esc(d.surface)}</b></p>`:''}<p>${esc(d.note)}</p>${d.context?`<blockquote lang="mn">${esc(d.context)}</blockquote>`:''}${w.kind==='scene'?`<button type="button" data-return="${i}" class="cn-secondary">Вернуться в сцену ${icon('arrow-up-right')}</button>`:'<p style="color:var(--cn-muted);font-size:11px">Сохранено из предыдущей версии игры.</p>'}</article>`;}).join('')}</div>`:'<p>Нажми на незнакомое слово в реплике рассказчика, затем — «Добавить в мои слова».</p><button type="button" class="cn-primary" data-view="play">Вернуться к сцене →</button>'}`;
 }
  const chapterOf=s=>s.chapter||1;
 const readWeight=chapter=>data.scenes.reduce((n,s)=>n+(chapterOf(s)===chapter&&state.read.includes(s.id)?s.wordCount||getWords(s.text[2]).length:0),0);
 function chapterProgress(chapter=chapterOf(getScene())){
  const total=data.chapterTotals?.[chapter]||data.scenes.filter(s=>chapterOf(s)===chapter).reduce((n,s)=>n+(s.wordCount||getWords(s.text[2]).length),0);
  const read=readWeight(chapter),allRead=data.scenes.filter(s=>chapterOf(s)===chapter).every(s=>state.read.includes(s.id));
  return {read,total,percent:allRead&&data.chapterComplete?.includes(chapter)?100:Math.min(99,Math.floor(read/Math.max(1,total)*100))};
 }
 const sentenceLabel=s=>s.sentenceStart===s.sentenceEnd?`Предложение ${s.sentenceStart}`:`Предложения ${s.sentenceStart}–${s.sentenceEnd}`;
 const normalizeSearch=t=>String(t).replace(/№/g,'#').normalize('NFKC').toLocaleLowerCase().replace(/ё/g,'е').replace(/\s+/g,' ').trim();
 let storyLimit=30;
 function storyMatches(s,q){
  if(!q)return {level:state.level,field:'original'};
  const number=q.match(/^(?:№|#)?\s*(\d+)$/);
  if(number)return Number(number[1])>=s.sentenceStart&&Number(number[1])<=s.sentenceEnd?{level:2,field:'number'}:null;
  if(normalizeSearch(s.text[2]).includes(q))return {level:2,field:'original'};
  for(const level of [state.level,0,1,2])if(normalizeSearch(s.text[level]).includes(q))return {level,field:'adaptation'};
  for(const level of [state.level,0,1,2])if(normalizeSearch(s.ru[level]).includes(q))return {level,field:'translation'};
  return normalizeSearch(s.title).includes(q)?{level:state.level,field:'title'}:null;
 }
 function highlighted(text,query){
  if(!query||/^(?:№|#)?\s*\d+$/.test(query))return esc(text);
  const normalized=String(text).normalize('NFKC').toLocaleLowerCase().replace(/ё/g,'е'),index=normalized.indexOf(query);
  if(index<0)return esc(text);
  return esc(text.slice(0,index))+`<mark>${esc(text.slice(index,index+query.length))}</mark>`+esc(text.slice(index+query.length));
 }
 function renderStoryResults(){
  const q=normalizeSearch(state.storyQuery||''),chapter=Number(state.storyChapter)||1;
  const matches=data.scenes.map((s,index)=>({s,index,match:chapterOf(s)===chapter?storyMatches(s,q):null})).filter(x=>x.match);
  $('#cn-search-count').textContent=q?`Найдено отрывков: ${matches.length}`:`Отрывков в главе: ${matches.length}`;
  $('#cn-search-clear').hidden=!q;
  $('#cn-story-results').innerHTML=matches.length?`<ol class="cn-timeline">${matches.slice(0,storyLimit).map(({s,index,match})=>`<li><button type="button" data-scene="${index}" data-search-level="${match.level}" ${index===state.scene?'aria-current="step"':''}><span>${String(index+1).padStart(2,'0')}</span><span class="cn-search-row"><small>Глава ${chapterOf(s)} · ${sentenceLabel(s)} · ${state.read.includes(s.id)?'Прочитано':'Не прочитано'}</small><strong>${highlighted(s.title,q)}</strong><span class="cn-search-original" lang="mn">${highlighted(s.text[2],q)}</span>${match.field==='adaptation'?`<span class="cn-search-adaptation" lang="mn">${levels[match.level]}: ${highlighted(s.text[match.level],q)}</span>`:''}${q&&match.field==='translation'?`<span class="cn-search-translation">${highlighted(s.ru[match.level],q)}</span>`:''}</span></button></li>`).join('')}</ol>${matches.length>storyLimit?`<button type="button" class="cn-secondary cn-search-more" data-story-more>Показать ещё ${Math.min(30,matches.length-storyLimit)}</button>`:''}`:`<p class="cn-search-empty">Ничего не найдено. Попробуйте часть слова, фразу на другом языке или номер предложения.</p>`;
  hydrate();
 }
 function renderStory(){
  const chapter=Number(state.storyChapter)||chapterOf(getScene()),progress=chapterProgress(chapter),available=[...new Set(data.scenes.map(chapterOf))];
  $('#cn-story').innerHTML=`<h2>Хроника</h2><p>Найдите предложение по монгольскому тексту, русскому переводу или номеру. Переход к нему не отмечает пропущенный текст прочитанным.</p><div class="cn-story-chapter">${available.length>1?`<label for="cn-search-chapter">Глава</label><select id="cn-search-chapter">${available.map(c=>`<option value="${c}" ${c===chapter?'selected':''}>${c}. ${esc(data.chapters[c-1].title)}</option>`).join('')}</select>`:`<h3>Глава ${chapter}. ${esc(data.chapters[chapter-1].title)}</h3>`}<span>Прочитано ${progress.percent}%</span></div><div class="cn-chapter-track" role="progressbar" aria-label="Прочитано текста главы" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${progress.percent}"><span style="width:${progress.percent}%"></span></div><div class="cn-search-controls"><label for="cn-story-search">Поиск по предложениям</label><div><input id="cn-story-search" type="search" maxlength="160" value="${esc(state.storyQuery||'')}" placeholder="Слово, перевод или № предложения" autocomplete="off"><button id="cn-search-clear" type="button" class="cn-secondary" aria-label="Очистить поиск" ${state.storyQuery?'':'hidden'}>Очистить</button></div></div><p id="cn-search-count" role="status" aria-live="polite"></p><div id="cn-story-results"></div>`;
  renderStoryResults();
 }
 root.addEventListener('input',e=>{if(e.target.id==='cn-story-search'){state.storyQuery=e.target.value.slice(0,160);storyLimit=30;renderStoryResults();save();}});
 root.addEventListener('change',e=>{if(e.target.id==='cn-search-chapter'){state.storyChapter=Number(e.target.value);storyLimit=30;save();renderStory();}});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.id==='cn-search-clear'){state.storyQuery='';storyLimit=30;save();renderStory();$('#cn-story-search').focus();}else if(b.hasAttribute('data-story-more')){storyLimit+=30;renderStoryResults();}});

 function render(){const focused=document.activeElement,focusId=root.contains(focused)?focused.id:null,focusData=root.contains(focused)?Object.entries(focused.dataset||{}):[];
  $('#cn-play').hidden=state.view!=='play';$('#cn-words').hidden=state.view!=='words';$('#cn-story').hidden=state.view!=='story';$('#cn-practice').hidden=state.view!=='practice';$('.cn-toolbar').hidden=state.view!=='play';$('#cn-level').value=state.level;$('#cn-count').textContent=state.saved.length;$$('.cn-nav button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.view===(state.view==='practice'?'words':state.view)));renderPlay();if(state.view==='words')renderWords();if(state.view==='story')renderStory();if(state.view==='practice')renderStudy();$('#cn-status').textContent=status;renderSite();hydrate();
  if(focused&&!focused.isConnected){const next=focusId?document.getElementById(focusId):focusData.length?$$('button').find(b=>focusData.every(([k,v])=>b.dataset[k]===v)):null;if(next&&!next.disabled)next.focus({preventScroll:true});}
 }
 function navigate(index){state.scene=index;state.furthest=Math.max(state.furthest,index);state.view='play';help=null;selected=null;status='';save();render();}
 root.addEventListener('change',e=>{if(e.target.id==='cn-level'){state.level=Number(e.target.value);selected=null;status='';save();render();}});
 root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled||!root.contains(b))return;
  if(b.id==='cn-prepare-transfer'){const input=$('#cn-export-text');input.hidden=false;input.value=JSON.stringify({format:'mongolian-magic-progress',version:1,privateContent:{game:packed()}});input.focus();input.select();return;}
  if(studyClick(b))return;
  if(b.dataset.view){state.view=b.dataset.view;status='';save();render();return;}
  if(b.id==='cn-grammar-mode'){state.grammarAll=!state.grammarAll;save();render();return;}
  if(b.id==='cn-question'){help=help?null:'grammar';selected=null;render();return;}
  if(b.id==='cn-close'){help=null;selected=null;render();$('#cn-question').focus({preventScroll:true});return;}
  if(b.dataset.help){help=b.dataset.help;selected=null;render();return;}
  if(b.dataset.word!==undefined){help='words';selected=Number(b.dataset.word);status='';render();return;}
  if(b.dataset.save!==undefined){addWord(Number(b.dataset.save));return;}
  if(b.dataset.translate!==undefined){const key=b.dataset.translate;if(translations.has(key))translations.delete(key);else translations.add(key);render();return;}
  if(b.dataset.choice!==undefined){const id=getScene().id,index=Number(b.dataset.choice);state.focus[id]=index;translations.delete('observation-'+index);state.discoveries[id]=[...new Set([...(state.discoveries[id]||[]),index])];status='';save();render();return;}
  if(b.id==='cn-back'){navigate(state.scene-1);return;}
  if(b.id==='cn-next'){if(state.finished&&state.scene===LAST){navigate(0);return;}if(!state.read.includes(getScene().id))state.read.push(getScene().id);if(state.scene<LAST){navigate(state.scene+1);}else{const missing=data.scenes.findIndex(s=>!state.read.includes(s.id));if(missing>=0){navigate(missing);}else{state.finished=true;help=null;selected=null;save();render();}}return;}
  if(b.dataset.scene!==undefined){if(b.dataset.searchLevel!==undefined)state.level=Number(b.dataset.searchLevel);navigate(Number(b.dataset.scene));return;}
  if(b.dataset.remove!==undefined){const index=Number(b.dataset.remove);status=`«${state.saved[index].lemma}» убрано из словаря.`;const lemma=state.saved[index].lemma;state.saved.splice(index,1);pruneStudy(lemma);save();render();return;}
  if(b.dataset.return!==undefined){const w=state.saved[Number(b.dataset.return)];state.level=w.level;state.scene=data.scenes.findIndex(s=>s.id===w.scene);state.view='play';help='words';selected=w.index;status='';save();render();return;}
 });
 document.addEventListener('click',e=>{
  if(state.view!=='play'||selected===null||!(e.target instanceof Element))return;
  // Keep controls and the readable explanation usable; surrounding space dismisses the word.
  if(e.target.closest('button,a,input,select,textarea,label,summary,[role="button"],[contenteditable="true"],#cn-help-content,#cn-other-forms'))return;
  if(window.getSelection()?.isCollapsed===false)return;
  if(document.activeElement?.matches('.cn-word'))document.activeElement.blur();
  selected=null;help=null;status='';render();
 });
 root.addEventListener('keydown',e=>{const b=e.target.closest('[data-help]');if(b&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();help=e.key==='Home'?'grammar':e.key==='End'?'words':help==='grammar'?'words':'grammar';selected=null;render();$(`[data-help="${help}"]`).focus({preventScroll:true});}});
  function wordForm(surface,en){
  const parts=en.morph;let html=esc(surface);
  if(parts&&parts.map(p=>p.text).join('').toLowerCase()===surface.toLowerCase()){
   let offset=0;html=parts.map(p=>{const t=surface.slice(offset,offset+p.text.length);offset+=p.text.length;return `<span class="cn-morph-${p.role}${p.category?' cn-g-'+esc(p.category):''}"${p.category?` data-grammar-category="${esc(p.category)}"`:''}>${esc(t)}</span>`;}).join('');
  }
  const unit=en.grammarUnit;return unit?`<span class="cn-grammar-unit cn-g-${esc(unit.category)}" data-grammar-category="${esc(unit.category)}">${html}</span>`:html;
 }
 function lemmaLabel(en,capital=false){const text=en.lemmaLabel||'словарная форма';return esc(capital?text[0].toUpperCase()+text.slice(1):text);}
 function renderOtherForms(){
  const s=getScene(),seen=new Set(),rows=[];
  getWords(s.text[state.level]).forEach((surface,index)=>{
   const en=entry(surface,s.id,index,state.level),parts=(en.morph||[]).filter(p=>p.category==='form'),unit=en.grammarUnit?.category==='form'?en.grammarUnit:null;
   if(!parts.length&&!unit)return;
   const key=JSON.stringify([surface.toLowerCase(),en.ru,parts,unit]);if(seen.has(key))return;seen.add(key);
   const meanings=parts.map(p=>`<li><b class="cn-g-form" data-grammar-category="form" lang="mn">-${esc(p.text)}</b> — ${esc(p.label)}. ${esc(p.meaning)}</li>`).join('');
   rows.push(`<li class="cn-form-example"><div><button type="button" data-word="${index}" class="cn-form-word" aria-label="Открыть разбор слова ${esc(surface)}" lang="mn">${wordForm(surface,en)}</button><span class="cn-form-translation">${esc(en.ru)}</span></div>${parts.length?`<ul>${meanings}</ul>`:''}${unit?`<p><b>${esc(unit.label)}.</b> ${esc(en.note)}</p>`:''}</li>`);
  });
  const group=$('#cn-other-forms');group.hidden=rows.length===0;
  if(!rows.length)group.open=false;
  $('#cn-other-forms-label').textContent='Другие формы — пояснения';
  $('#cn-other-forms-content').innerHTML=rows.length?`<p class="cn-form-guide-label">В этом отрывке</p><ul class="cn-form-examples">${rows.join('')}</ul>`:'';
 }
 function derivationDetails(en){
  const d=en.derivation;if(!d)return '';
  return `<section class="cn-derivation"><h3>${esc(d.title)}</h3>${d.paragraphs.map(p=>`<p>${esc(p)}</p>`).join('')}<h4>Примеры с тем же суффиксом</h4><ul>${d.examples.map(x=>`<li><span lang="mn">${esc(x.base)}</span> «${esc(x.baseRu)}» + <b class="cn-g-form" data-grammar-category="form" lang="mn">-${esc(x.suffix)}</b> → <span lang="mn">${esc(x.word)}</span> «${esc(x.ru)}»</li>`).join('')}</ul><p>${esc(d.note)}</p><details class="cn-derivation-sources"><summary class="cursor-interaction">Источники разбора</summary><p>${esc(d.source)}</p><div>${d.links.map(x=>`<a href="${esc(x.url)}" target="_blank" rel="noopener noreferrer">${esc(x.title)}</a>`).join(' · ')}</div></details></section>`;
 }
 function wordParts(en){const unit=en.grammarUnit?`<div class="cn-unit-caption cn-g-${esc(en.grammarUnit.category)}">${esc(en.grammarUnit.label)}</div>`:'';return unit+(en.morph?`<div class="cn-morph-parts">${en.morph.map(p=>`<div><b class="cn-morph-${p.role}${p.category?' cn-g-'+esc(p.category):''}"${p.category?` data-grammar-category="${esc(p.category)}"`:''} lang="mn">${p.role==='suffix'?'-':''}${esc(p.text)}</b><span><strong>${esc(p.label)}</strong><span>${esc(p.meaning)}</span></span></div>`).join('')}</div>`:'')+derivationDetails(en);}
 function passagePhrases(){return getScene().phrases?.[state.level]||[];}
 function relatedPhrases(index){return passagePhrases().filter(p=>p.indices.includes(index));}
 function phraseText(p){let n=0;return split(p.text).map(t=>{if(!isWord(t))return esc(t);const i=p.indices[n++],en=entry(t,getScene().id,i,state.level);return `<span class="${p.kind!=='lexical'&&p.focus.includes(i)?'cn-phrase-mark':''}">${wordForm(t,en)}</span>`;}).join('');}
 function phraseDetails(index=null){const phrases=index===null?passagePhrases():relatedPhrases(index);if(!phrases.length)return '';
  if(index!==null)return `<section class="cn-word-phrases" aria-label="Разбор сочетаний с выбранным словом"><h3>В этом сочетании</h3>${phrases.map(p=>`<article class="cn-phrase-detail"><p class="cn-phrase-quote" lang="mn">${phraseText(p)}</p><h4>${esc(p.title)}</h4><p>${esc(p.note)}</p></article>`).join('')}</section>`;
  return `<section class="cn-phrase-list" aria-label="Частицы и конструкции отрывка"><h3>Разбор сочетаний</h3>${phrases.map(p=>`<details><summary><span lang="mn">${phraseText(p)}</span><small>${esc(p.title)}</small></summary><p>${esc(p.note)}</p></details>`).join('')}</section>`;
 }

  // Vocabulary practice uses saved surface forms and their contextual meanings.
 // Simple interval ladder, independent of Anki's scheduling algorithms.
 const studyIntervals=[1,10,1440,5760,10080,20160,43200,86400,172800,259200,525600];
 const studyModes={cards:'Карточки',quiz:'Выбрать перевод',write:'Написать перевод'};
 const studyDirections={both:'Оба направления',mn:'Монгольский → русский',ru:'Русский → монгольский'};
 function freshStudy(){return {mode:'cards',direction:'both',home:true,session:null};}
 function studyNow(){return Math.floor(Date.now()/60000);}
 function studyWord(lemma){const w=state.saved.find(w=>w.lemma===lemma),d=w&&savedDetail(w);return d?{...d,mn:d.surface||d.lemma}:null;}
 function normalizeAnswer(value){return String(value).normalize('NFC').toLowerCase().replace(/ё/g,'е').replace(/[«»“”"'.,!?;:()[\]{}]/g,' ').replace(/\s+/g,' ').trim();}
 function answerForms(d,dir){
  if(dir===1)return [normalizeAnswer(d.mn)];
  const forms=[];
  for(const part of d.ru.split(/;|,|\s\/\s/)){
   const p=part.trim();if(!p)continue;
   forms.push(normalizeAnswer(p.replace(/\([^)]*\)/g,'')));
   if(/\([а-яё]{1,3}\)/i.test(p))forms.push(normalizeAnswer(p.replace(/[()]/g,'')));
  }
  forms.push(normalizeAnswer(d.ru));
  if(d.lemmaRu&&normalizeAnswer(d.mn)===normalizeAnswer(d.lemma))for(const part of d.lemmaRu.split(/[;,]/))forms.push(normalizeAnswer(part));
  if(d.lemma==='ууль')forms.push('сова','филин');
  if(d.lemma==='том')forms.push('большой','крупный');
  return [...new Set(forms.filter(Boolean))];
 }
 function studyFront(d,dir){return dir===0?d.mn:d.ru;}
 function studyBack(d,dir){return dir===0?d.ru:d.mn;}
 function shuffleStudy(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
 function reviewRecord(task){return state.reviews?.[task[0]]?.[task[1]]||null;}
 function taskDue(task){const r=reviewRecord(task);return !r||r[0]<=studyNow();}
 function allStudyTasks(direction=state.study.direction){return state.saved.flatMap(w=>direction==='mn'?[[w.lemma,0]]:direction==='ru'?[[w.lemma,1]]:[[w.lemma,0],[w.lemma,1]]);}
 function shortInterval(minutes){if(minutes<60)return `${minutes} мин`;if(minutes<1440)return `${Math.round(minutes/60)} ч`;return `${Math.round(minutes/1440)} дн`;}
 function nextStudyStep(task,grade){const prev=reviewRecord(task)?.[1]??-1;if(grade===0)return 0;if(grade===1)return Math.max(1,prev);if(grade===2)return Math.min(studyIntervals.length-1,Math.max(2,prev+1));return Math.min(studyIntervals.length-1,Math.max(3,prev+2));}
 function scheduleTask(task,grade){const step=nextStudyStep(task,grade);state.reviews[task[0]]??=[null,null];state.reviews[task[0]][task[1]]=[studyNow()+studyIntervals[step],step];}
 function packReviews(){const base=studyNow(),previous=[base,base];return {v:2,base,data:state.saved.map(w=>(state.reviews[w.lemma]||[null,null]).map((r,dir)=>{if(!r)return '-';const delta=r[0]-previous[dir];previous[dir]=r[0];return `${delta.toString(36)}.${r[1].toString(36)}`;}).join('/')).join(',')};}
 function packStudy(){const s=state.study,p=s.session,index=k=>state.saved.findIndex(w=>w.lemma===k),tasks=q=>q.map(t=>[index(t[0]),t[1]]).filter(t=>t[0]>=0);return {...s,session:p?{...p,queue:tasks(p.queue),missed:tasks(p.missed),options:p.options.map(index).filter(i=>i>=0)}:null};}
 function restoreStudy(raw){
  state.reviews={};state.study=freshStudy();
  if(!raw.studyPacked)return;
  const deltaReviews=raw.reviews?.v===2&&Number.isFinite(raw.reviews.base),previous=[raw.reviews?.base,raw.reviews?.base],encoded=typeof raw.reviews==='string'?raw.reviews.split(','):deltaReviews&&typeof raw.reviews.data==='string'?raw.reviews.data.split(','):[];
  state.saved.forEach((w,i)=>{const pair=(encoded[i]||'').split('/').slice(0,2).map((x,dir)=>{const [a,b]=x.split('.'),value=parseInt(a,36),due=deltaReviews?previous[dir]+value:value,step=parseInt(b,36);if(Number.isFinite(due)&&due>=0&&Number.isInteger(step)&&step>=0&&step<studyIntervals.length){if(deltaReviews)previous[dir]=due;return[due,step];}return null;});if(pair.some(Boolean))state.reviews[w.lemma]=[pair[0]||null,pair[1]||null];});
  const rawStudy=raw.study;if(!rawStudy||typeof rawStudy!=='object')return;
  state.study.mode=Object.hasOwn(studyModes,rawStudy.mode)?rawStudy.mode:'cards';state.study.direction=Object.hasOwn(studyDirections,rawStudy.direction)?rawStudy.direction:'both';state.study.home=rawStudy.home!==false;
  const p=rawStudy.session;if(!p||!Object.hasOwn(studyModes,p.mode))return;
  const tasks=q=>(Array.isArray(q)?q:[]).slice(0,40).filter(t=>Array.isArray(t)&&state.saved[t[0]]&&[0,1].includes(t[1])).map(t=>[state.saved[t[0]].lemma,t[1]]);
  const count=x=>Number.isInteger(x)&&x>=0?x:0;
  state.study.session={mode:p.mode,queue:tasks(p.queue),missed:tasks(p.missed),options:(Array.isArray(p.options)?p.options:[]).slice(0,4).filter(i=>state.saved[i]).map(i=>state.saved[i].lemma),total:count(p.total),answered:count(p.answered),correct:count(p.correct),again:count(p.again),manual:count(p.manual),revealed:!!p.revealed,feedback:['correct','different','manual'].includes(p.feedback)?p.feedback:null,draft:typeof p.draft==='string'?p.draft.slice(0,160):'',picked:typeof p.picked==='string'?p.picked.slice(0,100):'',retry:!!p.retry};
  if(state.study.session.picked&&!studyWord(state.study.session.picked))state.study.session.picked='';
  if(state.study.session.mode==='quiz'&&state.study.session.queue.length&&!state.study.session.options.length)state.study.session.options=makeStudyOptions(state.study.session.queue[0]);
 }
 function makeStudyOptions(task){
  const correct=studyWord(task[0]),correctForms=new Set(answerForms(correct,task[1]));
  const used=[correctForms],pool=[];
  for(const w of shuffleStudy(state.saved)){
   if(w.lemma===task[0])continue;const d=studyWord(w.lemma);if(!d)continue;
   const forms=answerForms(d,task[1]);
   // Do not offer a synonym of the expected answer as a distractor.
   if(used.some(a=>forms.some(x=>a.has(x))))continue;
   if(task[1]===1&&answerForms(d,0).some(x=>answerForms(correct,0).includes(x)))continue;
   used.push(new Set(forms));pool.push(w.lemma);if(pool.length===3)break;
  }
  return shuffleStudy([task[0],...pool]);
 }
 function prepareStudyQuestion(){const s=state.study.session;if(!s)return;s.feedback=null;s.revealed=false;s.draft='';s.picked='';s.options=s.queue.length&&s.mode==='quiz'?makeStudyOptions(s.queue[0]):[];}
 function startStudy(all=false,retry=false){
  let tasks=[];const prior=state.study.session;
  if(retry&&prior){tasks=prior.missed.filter(t=>studyWord(t[0]));state.study.mode=prior.mode;}
  else{
   const pool=allStudyTasks().filter(t=>all||taskDue(t));
   const selected=shuffleStudy([...new Set(pool.map(t=>t[0]))]).slice(0,10);
   // Separate the two directions so the reverse is not simply the next card.
   for(const dir of [0,1])for(const lemma of selected)if(pool.some(t=>t[0]===lemma&&t[1]===dir))tasks.push([lemma,dir]);
  }
  if(!tasks.length){status='Сейчас нет слов для этого подхода.';render();return;}
  state.study.session={mode:state.study.mode,queue:tasks,missed:[],options:[],total:tasks.length,answered:0,correct:0,again:0,manual:0,revealed:false,feedback:null,draft:'',picked:'',retry};state.study.home=false;state.view='practice';status='';prepareStudyQuestion();save();render();focusStudyInput();
 }
 function focusStudyInput(){const el=$('#cn-study-answer');if(el&&!el.disabled)el.focus({preventScroll:true});}
 function studyUsesInput(s){return s.mode==='write'||(s.mode==='quiz'&&s.options.length<2);}
 function checkStudyAnswer(skip=false,picked=null){
  const s=state.study.session;if(!s?.queue.length||s.feedback||s.mode==='cards')return;
  const task=s.queue[0],d=studyWord(task[0]);
  if(studyUsesInput(s)&&!skip){s.draft=($('#cn-study-answer')?.value||s.draft).slice(0,160);if(!normalizeAnswer(s.draft)){status='Напиши ответ или нажми «Не помню».';render();focusStudyInput();return;}}
  s.picked=picked||'';s.feedback=!skip&&(picked!==null?picked===task[0]:answerForms(d,task[1]).includes(normalizeAnswer(s.draft)))?'correct':'different';s.revealed=true;status='';save();render();
 }
 function advanceStudy(grade=null){
  const s=state.study.session;if(!s?.queue.length)return;
  if(s.mode==='cards'&&(!s.revealed||![0,1,2,3].includes(grade)))return;
  if(s.mode!=='cards'&&!s.feedback)return;
  const task=s.queue.shift();const correct=s.mode==='cards'?grade>0:s.feedback!=='different';
  if(s.mode==='cards'){
   s.answered++;if(grade===0){s.again++;s.queue.splice(Math.min(2,s.queue.length),0,task);}else s.correct++;
  }else{
   s.answered++;if(correct)s.correct++;else if(!s.missed.some(t=>t[0]===task[0]&&t[1]===task[1]))s.missed.push(task);
   if(s.feedback==='manual')s.manual++;grade=correct?2:0;
  }
  scheduleTask(task,grade);prepareStudyQuestion();status='';save();render();focusStudyInput();
 }
 function pruneStudy(lemma){
  delete state.reviews[lemma];const s=state.study.session;if(!s)return;
  const wasCurrent=s.queue[0]?.[0]===lemma,before=s.queue.length;s.queue=s.queue.filter(t=>t[0]!==lemma);s.total=Math.max(s.answered,s.total-before+s.queue.length);s.missed=s.missed.filter(t=>t[0]!==lemma);s.options=s.options.filter(k=>k!==lemma);if(s.picked===lemma)s.picked='';
  if(wasCurrent)prepareStudyQuestion();else if(s.mode==='quiz'&&!s.feedback&&s.queue.length&&s.options.length<2)s.options=makeStudyOptions(s.queue[0]);
 }
 function studyOverview(){
  const tasks=allStudyTasks(),due=tasks.filter(taskDue),fresh=tasks.filter(t=>!reviewRecord(t)),dates=tasks.map(t=>reviewRecord(t)?.[0]).filter(d=>d>studyNow());
  const next=dates.length?new Date(Math.min(...dates)*60000).toLocaleString('ru-RU',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):null;
  return {tasks:tasks.length,due:due.length,fresh:fresh.length,next};
 }
 function studyLauncher(){const n=allStudyTasks('both').filter(taskDue).length;return `<div class="cn-study-launch"><div><strong>Закрепить слова</strong><p>Карточки, тест и письменный перевод в обе стороны. К повторению: ${n}.</p></div><button type="button" class="cn-primary" data-view="practice">Тренировать слова ${icon('arrow-right')}</button></div>`;}
 function renderStudy(){
  const area=$('#cn-practice'),s=state.study.session;
  const top=`<div class="cn-study-heading"><h2>Тренировка слов</h2><button type="button" class="cn-secondary" data-view="words">← Мои слова</button></div>`;
  if(!state.saved.length){area.innerHTML=top+`<div class="cn-study-empty"><h3>Сначала сохрани слово из истории</h3><p>Нажми на незнакомое слово и выбери «Добавить в мои слова». Оно появится здесь для повторения.</p><button type="button" class="cn-primary" data-view="play">Вернуться к чтению →</button></div>`;return;}
  if(state.study.home||!s){const info=studyOverview();area.innerHTML=top+`<p class="cn-study-intro">Вспоминай значение до подсказки. В одном подходе — до 10 слов; в двух направлениях это до 20 заданий.</p>${s?.queue.length?`<div class="cn-study-resume"><span>Есть незавершённое занятие · осталось ${s.queue.length}</span><button type="button" class="cn-primary" data-study-action="resume">Продолжить занятие →</button></div>`:''}<div class="cn-study-settings"><label>Как тренироваться<select id="cn-study-mode">${Object.entries(studyModes).map(([v,t])=>`<option value="${v}" ${state.study.mode===v?'selected':''}>${t}</option>`).join('')}</select></label><label>Направление<select id="cn-study-direction">${Object.entries(studyDirections).map(([v,t])=>`<option value="${v}" ${state.study.direction===v?'selected':''}>${t}</option>`).join('')}</select></label></div><p class="cn-study-due">Готово к повторению: <b>${info.due}</b> · из них новых: ${info.fresh}${!info.due&&info.next?`<br>Ближайшее повторение: ${esc(info.next)}`:''}</p><div class="cn-study-actions"><button type="button" class="cn-primary" data-study-action="start" ${!info.due?'disabled':''}>${s?.queue.length?'Начать новый подход':'Начать повторение'} →</button><button type="button" class="cn-secondary" data-study-action="all">Потренироваться сейчас</button></div><p class="cn-study-hint">«Потренироваться сейчас» включает и слова, срок повторения которых ещё не наступил. У каждого направления свой срок.</p>`;return;}
  if(!s.queue.length){const missed=s.missed.filter(t=>studyWord(t[0]));area.innerHTML=top+`<div class="cn-study-result"><span class="cn-study-kicker">${s.mode==='cards'?'Повторение завершено':'Результат теста'}</span><h3>${s.mode==='cards'?`Повторено карточек: ${s.correct}`:`Верно ${s.correct} из ${s.answered}`}</h3><p>${s.mode==='cards'?`Возвратов к сложным карточкам: ${s.again}. Следующие сроки повторения сохранены.`:`${s.manual?`Ответов засчитано вручную: ${s.manual}. `:''}Слова и результаты повторения сохранены.`}</p>${missed.length?`<h4>Что повторить</h4><ul class="cn-study-missed">${missed.map(t=>{const d=studyWord(t[0]);return `<li><span>${esc(studyFront(d,t[1]))}</span> → <b>${esc(studyBack(d,t[1]))}</b></li>`;}).join('')}</ul>`:''}<div class="cn-study-actions">${missed.length?'<button type="button" class="cn-primary" data-study-action="retry">Повторить ошибки →</button>':''}<button type="button" class="cn-secondary" data-study-action="home">Выбрать тренировку</button><button type="button" class="cn-secondary" data-view="play">Продолжить историю →</button></div></div>`;return;}
  const task=s.queue[0],d=studyWord(task[0]),dir=task[1],input=studyUsesInput(s),shown=s.revealed||!!s.feedback;
  let controls='';
  if(s.mode==='cards')controls=shown?`<div class="cn-study-ratings">${['Ещё раз','Трудно','Знаю','Легко'].map((label,i)=>`<button type="button" data-study-grade="${i}"><strong>${label}</strong><small>${i===0?'в этом подходе':shortInterval(studyIntervals[nextStudyStep(task,i)])}</small></button>`).join('')}</div>`:'<button type="button" class="cn-primary" data-study-action="reveal">Показать ответ</button>';
  else if(!s.feedback)controls=(input?`<form id="cn-study-form"><label for="cn-study-answer">${dir===0?'Напиши значение по-русски':'Напиши сохранённую форму по-монгольски'}</label><input id="cn-study-answer" name="answer" lang="${dir===0?'ru':'mn'}" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" maxlength="160" value="${esc(s.draft)}" aria-describedby="cn-study-input-hint"><p id="cn-study-input-hint" class="cn-study-hint">${dir===0?'Достаточно одного подходящего значения.':'Форму из предложения можно проверить после ответа.'}</p>${dir===1?'<div class="cn-study-letters"><span>Буквы:</span><button type="button" data-study-letter="ө">ө</button><button type="button" data-study-letter="ү">ү</button></div>':''}<div class="cn-study-actions"><button type="button" class="cn-primary" data-study-action="check">Проверить</button><button type="button" class="cn-secondary" data-study-action="skip">Не помню</button></div></form>`:`<div class="cn-study-options">${s.options.map((lemma,i)=>`<button type="button" data-study-option="${i}" lang="${dir===0?'ru':'mn'}">${esc(studyBack(studyWord(lemma),dir))}</button>`).join('')}</div><button type="button" class="cn-secondary" data-study-action="skip">Не помню</button>`);
  else controls=`${s.feedback==='different'&&input&&normalizeAnswer(s.draft)?'<p class="cn-study-hint">Сверь смысл с образцом. Равнозначный перевод можно засчитать вручную.</p><button type="button" class="cn-secondary" data-study-action="accept">Мой вариант тоже верный</button>':''}<button type="button" class="cn-primary" data-study-action="next">${s.queue.length===1?'Завершить тест':'Следующее слово'} →</button>`;
  const feedback=s.feedback?`<p class="cn-study-feedback ${s.feedback==='different'?'needs-review':'is-correct'}" role="status">${s.feedback==='correct'?'Верно':s.feedback==='manual'?'Засчитано тобой':s.draft||s.picked?'Ответ не совпал с образцом':'Повторим это слово'}</p>${s.draft?`<p class="cn-study-your-answer">Твой ответ: <b>${esc(s.draft)}</b></p>`:s.picked?`<p class="cn-study-your-answer">Твой ответ: <b>${esc(studyBack(studyWord(s.picked),dir))}</b></p>`:''}`:'';
  area.innerHTML=top+`<div class="cn-study-progress"><span>${studyModes[s.mode]} · ${s.mode==='cards'?`осталось ${s.queue.length}`:`задание ${s.answered+1} из ${s.total}`}</span><button type="button" class="cn-study-settings-link" data-study-action="home">Настройки</button></div><div class="cn-study-card"><span class="cn-study-kicker">${dir===0?'Монгольский → русский':'Русский → монгольский'}</span><p class="cn-study-prompt" lang="${dir===0?'mn':'ru'}">${esc(studyFront(d,dir))}</p>${dir===1&&!shown?'<p class="cn-study-hint">Вспомни именно ту форму, которую ты сохранил.</p>':''}${shown?`<div class="cn-study-answer">${feedback}<span class="cn-study-answer-label">${dir===0?'Значение':'Сохранённая форма'}</span><p class="cn-study-answer-text" lang="${dir===0?'ru':'mn'}">${esc(studyBack(d,dir))}</p>${d.surface?`<p class="cn-study-hint">${lemmaLabel(d,true)}: <span lang="mn">${esc(d.lemma)}</span></p>`:''}<p>${esc(d.note)}</p>${d.context?`<blockquote lang="mn">${esc(d.context)}</blockquote>`:''}</div>`:''}<div class="cn-study-response">${controls}</div></div>`;
 }
 function studyClick(b){
  if(b.dataset.studyOption!==undefined){const s=state.study.session,i=Number(b.dataset.studyOption);if(s?.options[i])checkStudyAnswer(false,s.options[i]);return true;}
  if(b.dataset.studyGrade!==undefined){advanceStudy(Number(b.dataset.studyGrade));return true;}
  if(b.dataset.studyLetter){const el=$('#cn-study-answer');if(el&&!el.disabled){const a=el.selectionStart??el.value.length,z=el.selectionEnd??a;el.setRangeText(b.dataset.studyLetter,a,z,'end');state.study.session.draft=el.value;save();el.focus();}return true;}
  const action=b.dataset.studyAction;if(!action)return false;
  const s=state.study.session;
  if(action==='start'||action==='all'||action==='retry'){startStudy(action==='all',action==='retry');return true;}
  if(action==='home'){state.study.home=true;status='';save();render();return true;}
  if(action==='resume'){state.study.home=false;status='';save();render();focusStudyInput();return true;}
  if(action==='reveal'&&s?.mode==='cards'&&s.queue.length){s.revealed=true;save();render();return true;}
  if(action==='skip'){checkStudyAnswer(true);return true;}
  if(action==='check'){checkStudyAnswer();return true;}
  if(action==='accept'&&s?.feedback==='different'&&studyUsesInput(s)&&normalizeAnswer(s.draft)){s.feedback='manual';save();render();return true;}
  if(action==='next'){advanceStudy();return true;}
  return true;
 }

 root.addEventListener('submit',e=>{if(e.target.id==='cn-study-form'){e.preventDefault();checkStudyAnswer();}});
 root.addEventListener('keydown',e=>{if(e.target.id==='cn-study-answer'&&e.key==='Enter'&&!e.isComposing){e.preventDefault();checkStudyAnswer();}});
 root.addEventListener('input',e=>{if(e.target.id==='cn-study-answer'&&state.study.session)state.study.session.draft=e.target.value.slice(0,160);});
 root.addEventListener('change',e=>{if(e.target.id==='cn-study-mode'){state.study.mode=e.target.value;status='';save();render();}else if(e.target.id==='cn-study-direction'){state.study.direction=e.target.value;status='';save();render();}else if(e.target.id==='cn-study-answer'){save();}});
 // Sentence audio, chapter comprehension, and portable progress. Runs inside app scope.
const audioManifest=await fetch('audio.json').then(r=>{if(!r.ok)throw Error('audio');return r.json();}).catch(()=>null);
const quizData=await fetch('quizzes.json').then(r=>{if(!r.ok)throw Error('quiz');return r.json();});
const narration=new Audio();narration.preload='none';let audioKey='',audioSegment=-1,audioStopAt=null,audioRun=0,audioMessage='',audioSpeed=1;
const audioPacks=new Map();let clipUrl='';
async function loadAudioPack(name){if(!audioPacks.has(name)){const promise=fetch(name).then(r=>{if(!r.ok)throw Error('audio download');return r.arrayBuffer();}).catch(e=>{audioPacks.delete(name);throw e;});audioPacks.set(name,promise);if(audioPacks.size>3)audioPacks.delete(audioPacks.keys().next().value);}return audioPacks.get(name);}
let quizLevel=state.level,quizIndex=0,quizSummary=false,quizDraft=null;
function stopNarration(){audioRun++;narration.pause();audioStopAt=null;audioSegment=-1;audioMessage='';syncAudio();}
function currentClip(){const key=audioManifest?.scenes[getScene().id]?.[state.level];return key?{key,...audioManifest.clips[key]}:null;}
function renderAudio(){
 const c=currentClip(),key=`${getScene().id}:${state.level}`;
 if(audioKey!==key||state.view!=='play'){stopNarration();audioKey=key;}
 const host=$('#cn-audio');
 if(!c){host.innerHTML='<p>Озвучка пока недоступна. Попробуйте обновить страницу.</p>';return;}
 host.innerHTML=`<div class="cn-audio-controls"><button class="cn-audio-action" type="button" id="cn-audio-play">▶ Слушать отрывок</button><button type="button" class="cn-audio-action" id="cn-audio-stop" aria-label="Остановить озвучку">■ Стоп</button><label>Скорость <select id="cn-audio-speed" aria-label="Скорость озвучки"><option value="0.75" ${audioSpeed===.75?'selected':''}>0,75×</option><option value="1" ${audioSpeed===1?'selected':''}>1×</option></select></label></div>${c.cues.length>1?`<details class="cn-audio-sentences"><summary>Слушать отдельные предложения (${c.cues.length})</summary><ol>${c.cues.map((cue,i)=>`<li><button type="button" data-audio-sentence="${i}" aria-label="Слушать предложение ${i+1}" aria-pressed="false"><span aria-hidden="true">▶</span><span lang="mn">${esc(cue.text)}</span></button></li>`).join('')}</ol></details>`:''}<p id="cn-audio-message" role="status" aria-live="polite"></p>`;
 loadAudioPack(c.bundle).catch(()=>{});syncAudio();
}
function syncAudio(){const b=$('#cn-audio-play');if(b)b.textContent=!narration.paused&&audioSegment<0?'Ⅱ Пауза':'▶ Слушать отрывок';$$('[data-audio-sentence]').forEach(b=>b.setAttribute('aria-pressed',!narration.paused&&+b.dataset.audioSentence===audioSegment));const m=$('#cn-audio-message');if(m)m.textContent=audioMessage;}
async function playNarration(segment=-1){
 const c=currentClip();if(!c)return;
 if(segment<0&&audioSegment<0&&!narration.paused){narration.pause();syncAudio();return;}
 const resume=segment<0&&audioSegment<0&&narration.dataset.clip===c.key&&narration.currentTime>0&&!narration.ended;
 const run=++audioRun;narration.pause();audioMessage='Загрузка аудио…';audioSegment=segment;syncAudio();
 if(narration.dataset.clip!==c.key){try{const pack=await loadAudioPack(c.bundle);if(run!==audioRun)return;if(clipUrl)URL.revokeObjectURL(clipUrl);clipUrl=URL.createObjectURL(new Blob([pack.slice(c.offset,c.offset+c.bytes)],{type:'audio/mpeg'}));narration.src=clipUrl;narration.dataset.clip=c.key;narration.load();}catch{if(run!==audioRun)return;audioMessage='Запись не загрузилась. Проверьте подключение и попробуйте снова.';syncAudio();return;}}
 narration.playbackRate=audioSpeed;narration.preservesPitch=true;
 audioStopAt=segment>=0?c.cues[segment].end:null;
 try{if(!resume)narration.currentTime=segment>=0?Math.max(0,c.cues[segment].start-.025):0;await narration.play();if(run!==audioRun)return;audioMessage='';syncAudio();}
 catch(e){if(run!==audioRun)return;audioMessage='Не удалось воспроизвести запись. Проверьте подключение и нажмите ещё раз.';syncAudio();}
}
narration.addEventListener('timeupdate',()=>{if(audioStopAt!==null&&narration.currentTime>=audioStopAt){narration.pause();audioStopAt=null;syncAudio();}});
for(const event of ['pause','playing','ended'])narration.addEventListener(event,syncAudio);
narration.addEventListener('error',()=>{audioMessage='Запись не загрузилась. Проверьте подключение и попробуйте снова.';syncAudio();});
window.addEventListener('pagehide',stopNarration);
function quizStore(level=quizLevel){state.chapterQuiz??={version:1,levels:{}};state.chapterQuiz.levels??={};return state.chapterQuiz.levels[level]??={answers:[],best:0};}
function validatedQuiz(value){
 const out={version:1,levels:{}};if(!value||value.version!==1)return out;
 for(let l=0;l<3;l++){const src=value.levels?.[l];if(!src)continue;out.levels[l]={answers:quizData.levels[l].map((q,i)=>{const a=src.answers?.[i];return a&&Number.isInteger(a.choice)&&a.choice>=0&&a.choice<q.options.length&&a.checked===true?{choice:a.choice,checked:true}:null;}),best:Number.isInteger(src.best)?Math.max(0,Math.min(12,src.best)):0};}return out;
}
function openQuiz(level=state.level){quizLevel=level;quizDraft=null;quizSummary=false;quizIndex=Math.max(0,quizData.levels[level].findIndex((_,i)=>!quizStore(level).answers[i]?.checked));state.view='quiz';save();render();$('#cn-quiz-heading')?.focus({preventScroll:true});}
function renderQuiz(){
 const qs=quizData.levels[quizLevel],store=quizStore(),checked=store.answers.filter(a=>a?.checked).length;
 const score=qs.reduce((n,q,i)=>n+(store.answers[i]?.checked&&store.answers[i].choice===q.correct?1:0),0);
 const header=`<h2 id="cn-quiz-heading" tabindex="-1">Понимание первой главы</h2><p>Гарри Поттер и философский камень · Мальчик, который выжил</p><div class="cn-quiz-levels" role="group" aria-label="Уровень итогового теста">${levels.map((l,i)=>`<button type="button" class="cn-secondary" data-quiz-level="${i}" aria-pressed="${i===quizLevel}">${l}</button>`).join('')}</div>`;
 if(quizSummary&&checked===qs.length){
  store.best=Math.max(store.best,score);
  $('#cn-quiz').innerHTML=header+`<div class="cn-quiz-result"><span>Глава 1 · ${levels[quizLevel]}</span><h3>${score} из ${qs.length} · ${Math.round(score/qs.length*100)}%</h3><p>${score===qs.length?'Все ответы верны. Вы разобрались в событиях и деталях главы.':'Вернитесь к отрывкам, в которых возникли трудности, и попробуйте ещё раз.'}</p><p>Лучший результат: ${store.best} из ${qs.length}. Прогресс чтения считается отдельно.</p></div><ol class="cn-quiz-review">${qs.map((q,i)=>`<li><button type="button" data-quiz-review="${i}">${store.answers[i].choice===q.correct?'✓ Верно':'↻ Повторить'} · ${esc(q.prompt)}</button></li>`).join('')}</ol><div class="cn-quiz-actions"><button type="button" class="cn-primary" id="cn-quiz-retry">Пройти заново</button><button type="button" class="cn-secondary" data-view="words">Повторить мои слова</button><button type="button" class="cn-secondary" data-view="play">Вернуться к чтению</button></div>`;return;
 }
 const q=qs[quizIndex],a=store.answers[quizIndex],attempted=a?.checked,chosen=attempted?a.choice:quizDraft;
 $('#cn-quiz').innerHTML=header+`<p class="cn-quiz-position">Вопрос ${quizIndex+1} из ${qs.length} · Отвечено ${checked}</p><h3 class="cn-quiz-prompt">${esc(q.prompt)}</h3><div class="cn-quiz-options" role="group" aria-label="Варианты ответа">${q.options.map((text,i)=>`<button type="button" data-quiz-choice="${i}" aria-pressed="${chosen===i}" class="cn-quiz-option ${attempted&&i===q.correct?'is-correct':''} ${attempted&&i===chosen&&i!==q.correct?'is-incorrect':''}" ${attempted?'disabled':''}><span>${i+1}</span><span ${quizLevel===0?'lang="mn"':''}>${esc(text)}</span>${attempted&&i===q.correct?'<b>✓ Верный ответ</b>':''}${attempted&&i===chosen&&i!==q.correct?'<b>Ваш ответ</b>':''}</button>`).join('')}</div>${attempted?`<div class="cn-quiz-explanation" role="status"><strong>${a.choice===q.correct?'Верно':'Разберём ответ'}</strong><p>${esc(q.explanation)}</p><blockquote lang="mn">${esc(q.quote)}</blockquote><button type="button" class="cn-secondary" data-quiz-source="${q.scene}">Прочитать этот отрывок</button></div>`:'<p class="cn-quiz-hint">Выберите ответ. Объяснение и текст появятся после проверки.</p>'}<div class="cn-quiz-actions"><button type="button" id="cn-quiz-previous" class="cn-secondary" ${quizIndex===0?'disabled':''}>← Назад</button>${attempted?`<button type="button" id="cn-quiz-next" class="cn-primary">${quizIndex===qs.length-1?'Показать результат':'Следующий вопрос →'}</button>`:`<button type="button" id="cn-quiz-check" class="cn-primary" ${chosen===null?'disabled':''}>Проверить ответ</button>`}</div>`;
}
function portableState(){return {format:'mongolian-magic-progress',version:1,exportedAt:new Date().toISOString(),privateContent:{game:packed()}};}
function exportProgress(){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([JSON.stringify(portableState())],{type:'application/json'}));a.download='mongolian-magic-progress.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);$('#cn-transfer-status').textContent='Файл прогресса сохранён. Импортируйте его на другом устройстве.';}
function validateProgress(raw){
 const envelope=raw?.privateContent?.game?raw:raw?.game?{privateContent:{game:raw.game}}:null;
 if(!envelope)throw Error('Файл не содержит прогресс этой игры.');
 const s=expandSnapshot(envelope.privateContent.game);
 if(!s||s.v!==4||!Array.isArray(s.read)||!Array.isArray(s.saved)||!Number.isInteger(s.scene)||s.scene<0||s.scene>LAST||![0,1,2].includes(s.level))throw Error('Неподдерживаемый или повреждённый прогресс. Текущие данные сохранены.');
 if(s.packed&&s.packVersion!==3)throw Error('Сначала экспортируйте прогресс из актуальной версии игры.');
 const okScene=x=>s.packed?Number.isInteger(x)&&!!data.scenes[x]:!!byId[x];if(!s.read.every(okScene))throw Error('В файле есть неизвестные отрывки.');
 for(const w of s.saved){
  if(s.packed){if(Array.isArray(w)){if(w.length===3){if(!data.scenes[w[0]]||![0,1,2].includes(w[1])||!Number.isInteger(w[2])||!getWords(data.scenes[w[0]].text[w[1]])[w[2]])throw Error('Повреждено сохранённое слово.');}else if(w.length!==2||!data.legacyRefs[legacyRefKeys[w[0]]]?.words[w[1]])throw Error('Повреждено старое слово.');}else if(!w||typeof w.l!=='string'||typeof w.r!=='string')throw Error('Повреждено словарное слово.');}
  else if(!w||typeof w.lemma!=='string'||!savedDetail(w))throw Error('Повреждено сохранённое слово.');
 }
 if(s.chapterQuiz!==undefined){const v=s.chapterQuiz;if(!v||v.version!==1||!v.levels||typeof v.levels!=='object')throw Error('Повреждены результаты теста.');for(const [l,rec]of Object.entries(v.levels)){if(!['0','1','2'].includes(l)||!rec||!Array.isArray(rec.answers)||rec.answers.length>12)throw Error('Повреждены результаты теста.');for(const a of rec.answers)if(a!==null&&(!a||a.checked!==true||!Number.isInteger(a.choice)||a.choice<0||a.choice>2))throw Error('Повреждён ответ в тесте.');}}
 return {privateContent:{game:s}};
}
function importProgress(text){
 const before=state,beforeSig=externalStateSignature;
 try{if(text.length>5000000)throw Error('Слишком большой файл прогресса.');const raw=validateProgress(JSON.parse(text));if(!restore(raw))throw Error('Не удалось прочитать прогресс.');state.chapterQuiz=validatedQuiz(raw.privateContent.game.chapterQuiz===undefined?before.chapterQuiz:state.chapterQuiz);help=null;selected=null;state.view='play';save();render();$('#cn-transfer-status').textContent=`Прогресс загружен: ${state.read.length} отрывков, ${state.saved.length} слов.`;}
 catch(e){state=before;externalStateSignature=beforeSig;$('#cn-transfer-status').textContent=e instanceof SyntaxError?'Не удалось прочитать JSON. Текущий прогресс не изменён.':e.message;}
}
root.addEventListener('click',e=>{const b=e.target.closest('button');if(!b||b.disabled)return;
 if(b.id==='cn-audio-play')playNarration();else if(b.id==='cn-audio-stop'){stopNarration();narration.currentTime=0;}else if(b.dataset.audioSentence!==undefined)playNarration(+b.dataset.audioSentence);
 else if(b.hasAttribute('data-open-quiz'))openQuiz();
 else if(b.dataset.quizLevel!==undefined)openQuiz(+b.dataset.quizLevel);
 else if(b.dataset.quizChoice!==undefined){quizDraft=+b.dataset.quizChoice;renderQuiz();}
 else if(b.id==='cn-quiz-check'&&quizDraft!==null){quizStore().answers[quizIndex]={choice:quizDraft,checked:true};quizDraft=null;const qs=quizData.levels[quizLevel];if(qs.every((_,i)=>quizStore().answers[i]?.checked))quizStore().best=Math.max(quizStore().best,qs.reduce((n,q,i)=>n+(quizStore().answers[i].choice===q.correct?1:0),0));save();renderQuiz();}
 else if(b.id==='cn-quiz-next'){if(quizIndex<11)quizIndex++;else quizSummary=true;quizDraft=null;renderQuiz();}
 else if(b.id==='cn-quiz-previous'){quizIndex--;quizDraft=null;renderQuiz();}
 else if(b.dataset.quizReview!==undefined){quizIndex=+b.dataset.quizReview;quizSummary=false;quizDraft=null;renderQuiz();}
 else if(b.id==='cn-quiz-retry'){quizStore().answers=[];quizIndex=0;quizSummary=false;quizDraft=null;save();renderQuiz();}
 else if(b.dataset.quizSource!==undefined){state.level=quizLevel;navigate(+b.dataset.quizSource);}
 else if(b.id==='cn-export-progress')exportProgress();
 else if(b.id==='cn-import-text')importProgress($('#cn-transfer-text').value);
});
root.addEventListener('change',async e=>{if(e.target.id==='cn-audio-speed'){audioSpeed=+e.target.value;narration.playbackRate=audioSpeed;}else if(e.target.id==='cn-import-progress'&&e.target.files[0]){if(e.target.files[0].size>5000000){$('#cn-transfer-status').textContent='Слишком большой файл.';return;}importProgress(await e.target.files[0].text());e.target.value='';}});
function renderSite(){if(window.gameStorageIssue)$('#cn-status').textContent='Браузер не разрешает сохранять данные. Скачайте прогресс перед закрытием.';renderAudio();$('#cn-quiz').hidden=state.view!=='quiz';if(state.view==='quiz')renderQuiz();const end=$('#cn-end');if(state.scene===LAST&&!end.querySelector('[data-open-quiz]'))end.insertAdjacentHTML('beforeend','<button type="button" class="cn-primary" data-open-quiz>Проверить понимание главы →</button>');}

 restore(window.openai?.widgetState);state.chapterQuiz=validatedQuiz(state.chapterQuiz);quizLevel=state.level;render();root.dataset.ready='true';
 window.addEventListener('openai:set_globals',e=>{const g=e.detail?.globals;if(!g||!Object.prototype.hasOwnProperty.call(g,'widgetState'))return;if(JSON.stringify(g.widgetState?.privateContent?.game)===externalStateSignature)return;if(restore(g.widgetState)){help=null;selected=null;status='';render();}});
 
})().catch(error=>{document.getElementById('mm-adventure').innerHTML='<p class="cn-load-error">Не удалось загрузить игру. Проверьте подключение и обновите страницу.</p>';console.error(error);});
