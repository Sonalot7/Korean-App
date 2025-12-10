/* Quiz page logic
 - Reads query param ?cat=hangul or ?cat=numbers or ?cat=bodyparts or ?cat=travel or ?cat=daily
 - Loads appropriate window.KB_* array (data files are loaded before this script)
 - Simple multiple-choice quiz: shows question and 4 choices
 - For hangul: asks "What's the romanization?" (uses hangul.rom)
 - For numbers: shows number and asks for Sino/native or shows Korean and asks for numeric
 - For vocab: shows Korean and asks to choose correct English translation
*/

(function(){
  function qs(name){
    const params = new URLSearchParams(location.search);
    return params.get(name);
  }

  const cat = (qs('cat') || 'travel').toLowerCase();
  const mode = qs('mode') || null;

  const mapping = {
    hangul: { data: window.KB_HANGUL, type: 'hangul' },
    numbers: { data: window.KB_NUMBERS, type: 'number' },
    bodyparts: { data: window.KB_BODYPARTS, type: 'vocab' },
    travel: { data: window.KB_TRAVEL, type: 'vocab' },
    daily: { data: window.KB_DAILY, type: 'vocab' }
  };

  const chosen = mapping[cat] || mapping['travel'];
  const data = chosen.data.slice(); // copy
  const metaEl = document.getElementById('meta');
  const qText = document.getElementById('question-text');
  const opts = document.getElementById('options');
  const scoreEl = document.getElementById('score');
  const prevBtn = document.getElementById('prev');
  const nextBtn = document.getElementById('next');

  let idx = 0, score = 0, answers = [];

  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } }

  // create question pool: pick up to 20 questions (or all) depending on mode
  let pool = data.slice();
  shuffle(pool);
  if(mode === '20timed') pool = pool.slice(0,20);
  else if(mode === '40mixed') pool = pool.slice(0,40);
  else pool = pool.slice(0, Math.min(pool.length, 30)); // default 30 or less

  metaEl.textContent = `Category: ${cat} · Questions: ${pool.length}`;

  function makeOptions(correctItem){
    // produce 4 choices including correct one
    const choices = [correctItem];
    const poolForChoices = pool.filter(p => p!==correctItem).slice(); shuffle(poolForChoices);
    while(choices.length<4 && poolForChoices.length){
      choices.push(poolForChoices.shift());
    }
    // if not enough, pad with other items from global arrays
    const globalPool = [].concat(window.KB_TRAVEL||[], window.KB_DAILY||[], window.KB_BODYPARTS||[], window.KB_NUMBERS||[], window.KB_HANGUL||[]);
    let gi = 0;
    while(choices.length<4 && gi<globalPool.length){
      const cand = globalPool[gi++];
      if(!choices.includes(cand)) choices.push(cand);
    }
    shuffle(choices);
    return choices;
  }

  function renderQuestion(i){
    const item = pool[i];
    opts.innerHTML = '';
    if(!item) return;
    // question + answers depends on type
    if(chosen.type === 'hangul'){
      qText.textContent = item.char;
      const choices = makeOptions(item);
      choices.forEach(c => {
        const div = document.createElement('div');
        div.className = 'choice';
        div.textContent = c.rom;
        div.onclick = () => {
          if(answers[i] === undefined){
            answers[i] = (c.rom === item.rom);
            if(answers[i]) score++;
            scoreEl.textContent = 'Score: ' + score;
            // mark selected
            div.style.borderColor = answers[i] ? '#32a852' : '#d14b6f';
            div.style.background = answers[i] ? '#e9fff0' : '#fff0f3';
          }
        };
        opts.appendChild(div);
      });
    } else if(chosen.type === 'number'){
      // show numeric and options either native vs sino mapping or vice versa
      // Show Korean (sino/native) and ask number
      if(item.num !== undefined){
        qText.textContent = `${item.sino} (Sino)`;
        const choices = makeOptions(item);
        choices.forEach(c => {
          const div = document.createElement('div'); div.className='choice';
          div.textContent = typeof c.num !== 'undefined' ? String(c.num) : (c.sino || c.native || JSON.stringify(c));
          div.onclick = () => {
            if(answers[i] === undefined){
              const ok = (String(c.num) === String(item.num));
              answers[i] = ok;
              if(ok) score++;
              scoreEl.textContent = 'Score: ' + score;
              div.style.borderColor = ok ? '#32a852' : '#d14b6f';
            }
          };
          opts.appendChild(div);
        });
      } else {
        qText.textContent = item;
      }
    } else { // vocab types
      qText.textContent = item.k;
      const choices = makeOptions(item);
      choices.forEach(c => {
        const div = document.createElement('div'); div.className='choice';
        div.textContent = c.e;
        div.onclick = () => {
          if(answers[i] === undefined){
            const ok = (c.e === item.e);
            answers[i] = ok;
            if(ok) score++;
            scoreEl.textContent = 'Score: ' + score;
            div.style.borderColor = ok ? '#32a852' : '#d14b6f';
            div.style.background = ok ? '#e9fff0' : '#fff0f3';
          }
        };
        opts.appendChild(div);
      });
    }
  }

  function goto(i){
    if(i<0) i=0;
    if(i>=pool.length) i=pool.length-1;
    idx = i;
    renderQuestion(idx);
    // update meta with progress
    metaEl.textContent = `Category: ${cat} · Q ${idx+1}/${pool.length}`;
  }

  prevBtn.addEventListener('click', ()=> goto(idx-1));
  nextBtn.addEventListener('click', ()=> goto(idx+1));

  goto(0);

})();
