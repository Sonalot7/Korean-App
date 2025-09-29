/* Korebloom — interactive learning app */

// --------- Data: many items for each topic (expandable) ----------
const LESSONS = {
  hangul: {
    title: "Hangul",
    items: [
      { ko: "ㄱ", en: "g / k" },{ ko: "ㄴ", en: "n" },{ ko: "ㄷ", en: "d / t" },{ ko: "ㄹ", en: "r / l" },{ ko: "ㅁ", en: "m" },
      { ko: "ㅂ", en: "b / p" },{ ko: "ㅅ", en: "s" },{ ko: "ㅇ", en: "ng or silent" },{ ko: "ㅈ", en: "j" },{ ko: "ㅊ", en: "ch" },
      { ko: "ㅋ", en: "k (aspirated)" },{ ko: "ㅌ", en: "t (aspirated)" },{ ko: "ㅍ", en: "p (aspirated)" },{ ko: "ㅎ", en: "h" },
      { ko: "ㅏ", en: "a (as in 'father')" },{ ko: "ㅑ", en: "ya" },{ ko: "ㅓ", en: "eo (as in 'son')" },{ ko: "ㅕ", en: "yeo" },
      { ko: "ㅗ", en: "o" },{ ko: "ㅛ", en: "yo" },{ ko: "ㅜ", en: "u" },{ ko: "ㅠ", en: "yu" },{ ko: "ㅡ", en: "eu" },{ ko: "ㅣ", en: "i" }
    ]
  },
  numbers: {
    title: "Numbers",
    items: [
      { ko: "하나", en: "1 (hana)" },{ ko: "둘", en: "2 (dul)" },{ ko: "셋", en: "3 (set)" },{ ko: "넷", en: "4 (net)" },{ ko: "다섯", en: "5 (daseot)" },
      { ko: "여섯", en: "6 (yeoseot)" },{ ko: "일곱", en: "7 (ilgop)" },{ ko: "여덟", en: "8 (yeodeol)" },{ ko: "아홉", en: "9 (ahop)" },{ ko: "열", en: "10 (yeol)" },
      { ko: "십", en: "10 (sino: sip)" },{ ko: "이십", en: "20 (isip)" },{ ko: "삼십", en: "30 (samsip)" },{ ko: "백", en: "100 (baek)" },{ ko: "천", en: "1000 (cheon)" }
    ]
  },
  body: {
    title: "Body Parts",
    items: [
      { ko: "머리", en: "Head" },{ ko: "눈", en: "Eye" },{ ko: "코", en: "Nose" },{ ko: "입", en: "Mouth" },{ ko: "귀", en: "Ear" },
      { ko: "손", en: "Hand" },{ ko: "발", en: "Foot" },{ ko: "다리", en: "Leg" },{ ko: "팔", en: "Arm" },{ ko: "목", en: "Neck" },
      { ko: "배", en: "Abdomen / Tummy" },{ ko: "등", en: "Back" },{ ko: "어깨", en: "Shoulder" },{ ko: "이마", en: "Forehead" }
    ]
  },
  travel: {
    title: "Travel Phrases",
    items: [
      { ko: "안녕하세요", en: "Hello" },{ ko: "감사합니다", en: "Thank you" },{ ko: "죄송합니다", en: "Sorry / Excuse me" },
      { ko: "화장실 어디에요?", en: "Where is the bathroom?" },{ ko: "이거 얼마예요?", en: "How much is this?" },{ ko: "영어 하세요?", en: "Do you speak English?" },
      { ko: "도와주세요", en: "I need help" },{ ko: "병원이 어디에요?", en: "Where is the hospital?" },{ ko: "택시 불러주세요", en: "Please call a taxi" },
      { ko: "여기에서 가까워요?", en: "Is it near here?" },{ ko: "메뉴 추천해주세요", en: "Please recommend a menu" },{ ko: "예약했어요", en: "I have a reservation" },
      { ko: "계산서 주세요", en: "Please bring the bill" },{ ko: "포장해주세요", en: "Please make it takeaway" },{ ko: "사진 찍어 주세요", en: "Please take a photo" }
    ]
  }
};

// ---------- Utility functions ----------
function el(id){ return document.getElementById(id); }
function randInt(max){ return Math.floor(Math.random()*max); }
function sample(arr,n=1){ const copy = [...arr].sort(()=>Math.random()-0.5); return n===1?copy[0]:copy.slice(0,n); }

// ---------- Render vocabulary cards ----------
function renderAll(){
  for(const key of Object.keys(LESSONS)){
    const container = el(key + "-cards");
    if(!container) continue;
    container.innerHTML = "";
    LESSONS[key].items.forEach((it, idx) => {
      const card = document.createElement("div");
      card.className = "vocab-card";
      card.innerHTML = `
        <div>
          <div class="ko">${it.ko}</div>
          <div class="en">${it.en}</div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="secondary" onclick="speak('${escapeJS(it.ko)}')">🔊</button>
          <button class="secondary" onclick="saveFavorite('${escapeJS(key)}',${idx})">☆</button>
        </div>
      `;
      container.appendChild(card);
    });
  }
  updateGlobalProgress();
}

function escapeJS(s){ return s.replace(/'/g,"\\'").replace(/"/g,"\\\""); }

// ---------- Play pronunciation for whole lesson ----------
function playAll(lessonKey){
  const items = LESSONS[lessonKey].items;
  (async ()=>{
    for(const it of items){
      speak(it.ko);
      await new Promise(r=>setTimeout(r,600));
    }
  })();
}

// ---------- Flashcard mode ----------
let flashcards = [];
let fcIndex = 0;
function openFlashcardMode(lessonKey){
  flashcards = LESSONS[lessonKey].items;
  fcIndex = 0;
  showFlashcard();
  el("flashcard-modal").classList.remove("hidden");
}
function closeFlashcardMode(){ el("flashcard-modal").classList.add("hidden"); }
function showFlashcard(){
  const it = flashcards[fcIndex];
  el("fc-ko").textContent = it.ko;
  el("fc-en").textContent = it.en;
}
function flipFlashcard(){ const en = el("fc-en"); en.style.display = en.style.display==="none"?"block":"none"; }
function playCurrentFlashcard(){ speak(flashcards[fcIndex].ko); }
function nextFlashcard(){ fcIndex = (fcIndex+1)%flashcards.length; showFlashcard(); }

// ---------- Shuffle flashcards (a little fun) ----------
function shuffleFlashcards(lessonKey){
  LESSONS[lessonKey].items.sort(()=>Math.random()-0.5);
  renderAll();
  // tiny sparkle animation on heading
  flashGlow();
}

// ---------- Quiz logic ----------
let QUIZ = {questions:[], index:0, score:0, total:0, lesson:null};

function buildQuizFromLesson(lessonKey, qCount){
  const pool = LESSONS[lessonKey].items;
  const questions = [];
  const copies = [...pool];
  for(let i=0;i<qCount;i++){
    const correct = copies.splice(randInt(copies.length),1)[0];
    // wrong options
    const wrong = [];
    while(wrong.length<3){
      const candidate = pool[randInt(pool.length)];
      if(candidate.ko !== correct.ko && !wrong.includes(candidate.en)) wrong.push(candidate.en);
    }
    const choices = sample([correct.en, ...wrong],4);
    questions.push({prompt:correct.ko,answer:correct.en,choices});
  }
  return questions;
}

function startLessonQuiz(lessonKey,qCount=10){
  QUIZ.questions = buildQuizFromLesson(lessonKey, qCount);
  QUIZ.index=0; QUIZ.score=0; QUIZ.lesson=lessonKey; QUIZ.total=QUIZ.questions.length;
  showQuiz();
}

function startRandomQuiz(total=20){
  // mix questions from all lessons
  const all = [];
  for(const l of Object.keys(LESSONS)){
    for(const it of LESSONS[l].items){
      all.push({prompt:it.ko,answer:it.en});
    }
  }
  const questions=[];
  const pool = [...all];
  for(let i=0;i<total;i++){
    const chosen = pool.splice(randInt(pool.length),1)[0];
    const wrong=[];
    while(wrong.length<3){
      const candidate = all[randInt(all.length)];
      if(candidate.answer!==chosen.answer && !wrong.includes(candidate.answer)) wrong.push(candidate.answer);
    }
    questions.push({prompt:chosen.prompt,answer:chosen.answer,choices:sample([chosen.answer,...wrong],4)});
  }
  QUIZ.questions=questions; QUIZ.index=0; QUIZ.score=0; QUIZ.total=total; QUIZ.lesson="mixed";
  showQuiz();
}

function showQuiz(){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active-section"));
  el("quiz").classList.add("active-section");
  el("quiz-area").classList.remove("hidden");
  el("quiz-result").classList.add("hidden");
  renderQuestion();
}

function renderQuestion(){
  const q = QUIZ.questions[QUIZ.index];
  el("question-count").textContent = `Question ${QUIZ.index+1} / ${QUIZ.total}`;
  el("question-text").textContent = q.prompt;
  const choicesDiv = el("choices");
  choicesDiv.innerHTML = "";
  q.choices.forEach(c=>{
    const b = document.createElement("button");
    b.className = "choice-btn";
    b.textContent = c;
    b.onclick = ()=> selectChoice(b, c);
    choicesDiv.appendChild(b);
  });
  // controls
  el("next-btn").onclick = ()=> nextQuestion();
  el("skip-btn").onclick = ()=> { nextQuestion(false); };
}

function selectChoice(button, choice){
  const q = QUIZ.questions[QUIZ.index];
  // disable all choices
  document.querySelectorAll(".choice-btn").forEach(btn=>btn.disabled=true);
  if(choice === q.answer){
    button.classList.add("correct");
    QUIZ.score++;
    playStar();
  } else {
    button.classList.add("wrong");
    // highlight correct
    document.querySelectorAll(".choice-btn").forEach(btn=>{
      if(btn.textContent===q.answer) btn.classList.add("correct");
    });
    playBuzzer();
  }
  saveProgress(QUIZ.lesson, QUIZ.index+1, QUIZ.score);
}

function nextQuestion(count=true){
  QUIZ.index++;
  if(QUIZ.index>=QUIZ.total){
    finishQuiz();
    return;
  }
  renderQuestion();
}

function finishQuiz(){
  el("quiz-area").classList.add("hidden");
  el("quiz-result").classList.remove("hidden");
  el("quiz-result").innerHTML = `<h3>Quiz complete 🎉</h3><p>Score: ${QUIZ.score} / ${QUIZ.total}</p>
    <p><button class="primary" onclick="startLessonQuiz(QUIZ.lesson, QUIZ.total)">Retry</button>
    <button class="secondary" onclick="startRandomQuiz(20)">Play Mixed Quiz</button></p>`;
  updateGlobalProgress();
}

// ---------- TTS ----------
function speak(text){
  try{
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ko-KR";
    u.rate = 0.95; u.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  }catch(e){
    console.warn("TTS not available", e);
  }
}

// ---------- Save favorites & progress ----------
function saveFavorite(lessonKey, idx){
  const key = `kb_fav_${lessonKey}`;
  const list = JSON.parse(localStorage.getItem(key) || "[]");
  if(!list.includes(idx)) list.push(idx);
  localStorage.setItem(key, JSON.stringify(list));
  flashGlow();
}

function saveProgress(lesson, questionIndex, score){
  const key = `kb_progress_${lesson}`;
  localStorage.setItem(key, JSON.stringify({ q:questionIndex, s:score, t:QUIZ.total }));
}

function loadProgress(lesson){
  const key = `kb_progress_${lesson}`;
  return JSON.parse(localStorage.getItem(key) || "null");
}

function updateGlobalProgress(){
  // approximate progress: average of lessons completion
  let sum=0, cnt=0;
  for(const k of Object.keys(LESSONS)){
    const p = loadProgress(k);
    if(p){ sum += (p.q||0)/(p.t||LESSONS[k].items.length); cnt++; }
  }
  const percent = cnt? Math.round((sum/cnt)*100):0;
  el("global-progress").textContent = percent + "%";
}

// --------- cute sounds (tiny) ----------
function playStar(){ /* micro confetti visual */ flashConfetti(); }
function playBuzzer(){ /* no sound to keep simple on GitHub Pages */ }

// small confetti effect (visual)
function flashConfetti(){
  const conf = document.createElement("div");
  conf.className = "confetti";
  conf.innerHTML = "✨";
  conf.style.position="fixed"; conf.style.left=(50+randInt(40)-20)+"%"; conf.style.top=(30+randInt(40)-20)+"%";
  conf.style.fontSize="28px"; conf.style.zIndex=30; document.body.appendChild(conf);
  conf.animate([{opacity:1, transform:"translateY(0) scale(1)"},{opacity:0, transform:"translateY(-40px) scale(1.6)"}],{duration:800});
  setTimeout(()=>conf.remove(),900);
}

// small glow animation on header to celebrate actions
function flashGlow(){
  const title = document.querySelector(".title h1");
  title.animate([{filter:"drop-shadow(0 0 0 transparent)"},{filter:"drop-shadow(0 6px 20px rgba(227,59,122,0.14))"}],{duration:800, easing:"ease-out"});
}

// ---------- UI wiring ----------
document.addEventListener("DOMContentLoaded", ()=>{
  renderAll();
  // nav
  document.querySelectorAll(".nav-btn").forEach(btn=>{
    btn.onclick = ()=>{
      document.querySelectorAll(".nav-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      showSection(btn.dataset.section);
    };
  });
  document.getElementById("start-quiz-btn").onclick = ()=> startRandomQuiz(20);
  document.getElementById("review-btn").onclick = ()=> { alert('Progress keys saved in localStorage. Use the app repeatedly to build progress.'); };
  // quiz controls wired
  el("next-btn").onclick = ()=> nextQuestion();
  el("skip-btn").onclick = ()=> nextQuestion(false);
  // flashcard modal navigation via click
  document.getElementById("flashcard-modal").addEventListener("click", (e)=>{
    if(e.target.id === "flashcard-modal") closeFlashcardMode();
  });
});

// show a section by id
function showSection(id){
  document.querySelectorAll(".section").forEach(s=>s.classList.remove("active-section"));
  document.getElementById(id).classList.add("active-section");
  // update nav active
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active", b.dataset.section===id));
  if(id!=="quiz") el("quiz-area").classList.add("hidden");
}

// helper to start quizzes from buttons
function startLessonQuiz(k, n){ startLessonQuizCaller(k,n); }
function startLessonQuizCaller(k,n){ startLessonQuizImplementation(k,n); }
// avoid hoisting confusion — define the real function:
function startLessonQuizImplementation(lessonKey,qCount){
  startLessonQuiz(lessonKey,qCount); // call core
}

// small fallback: if user clicks playCurrent when none, play next flashcard
document.addEventListener("keydown",(e)=>{ if(e.key===" "){ if(!el("flashcard-modal").classList.contains("hidden")) nextFlashcard(); } });

// initial show home
showSection("home");
