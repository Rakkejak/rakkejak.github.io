(() => {
  let floatingWindow = null;
  let syncTimer = null;

  function notify(message, ms=4200){
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(notify.t);
    notify.t = setTimeout(() => toast.classList.remove('show'), ms);
  }

  function returnToFull(){
    try{
      if(floatingWindow && !floatingWindow.closed) floatingWindow.close();
    }catch(e){}
    clearInterval(syncTimer);
    syncTimer = null;
    floatingWindow = null;
    try{ window.focus(); }catch(e){}
    setTimeout(() => { try{ window.focus(); }catch(e){} }, 60);
  }

  function miniMarkup(doc){
    doc.title = 'Blok per Blok mini';
    doc.head.innerHTML = '';
    doc.body.innerHTML = '';

    const style = doc.createElement('style');
    style.textContent = `
      *{box-sizing:border-box}
      html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#fff;color:#171717;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      body{display:flex;align-items:center}
      .box{width:100%;padding:14px 16px 12px}
      .top{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px}
      .title{font-size:22px;font-weight:900;letter-spacing:-.025em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .wrap{font-size:11px;font-weight:900;color:#ff9a3c;visibility:hidden;white-space:nowrap}
      .wrap.show{visibility:visible}
      .bar{height:17px;border-radius:999px;background:#ececea;overflow:hidden}
      .fill{height:100%;width:0;border-radius:inherit;background:#e96a4a;transition:width .25s linear,background-color .2s ease}
      .bottom{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:9px;color:#777;font-size:12px}
      .next{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .controls{display:flex;gap:5px;flex:0 0 auto}
      button{border:0;border-radius:8px;padding:5px 8px;font:inherit;font-weight:850;background:#efefec;color:#171717;cursor:pointer}
      button.full{background:#171717;color:#fff;padding-inline:10px}
    `;
    doc.head.appendChild(style);

    const box = doc.createElement('div');
    box.className = 'box';
    box.innerHTML = `
      <div class="top"><div class="title" id="pipTitle">LESBLOK</div><div class="wrap" id="pipWrap">WRAP UP</div></div>
      <div class="bar"><div class="fill" id="pipFill"></div></div>
      <div class="bottom">
        <div class="next" id="pipNext">Next</div>
        <div class="controls"><button id="pipPlus">+1</button><button id="pipPause">Ⅱ</button><button id="pipNextBtn">NEXT</button><button class="full" id="pipFull">FULL</button></div>
      </div>`;
    doc.body.appendChild(box);

    doc.getElementById('pipPlus').onclick = () => document.getElementById('plusBtn')?.click();
    doc.getElementById('pipNextBtn').onclick = () => document.getElementById('nextBtn')?.click();
    doc.getElementById('pipPause').onclick = () => {
      const pause = document.getElementById('pauseBtn');
      const start = document.getElementById('startBtn');
      if(pause && !pause.disabled) pause.click();
      else start?.click();
    };
    doc.getElementById('pipFull').onclick = returnToFull;
  }

  function syncMini(){
    if(!floatingWindow || floatingWindow.closed){
      clearInterval(syncTimer);
      syncTimer = null;
      return;
    }
    try{
      const d = floatingWindow.document;
      const title = document.getElementById('title')?.textContent || 'LESBLOK';
      const fill = document.getElementById('progress');
      const next = document.getElementById('next')?.innerText || '';
      const wrap = document.getElementById('wrap');
      const pause = document.getElementById('pauseBtn');

      d.getElementById('pipTitle').textContent = title;
      d.getElementById('pipFill').style.width = fill?.style.width || '0%';
      d.getElementById('pipFill').style.background = fill ? getComputedStyle(fill).backgroundColor : '#e96a4a';
      d.getElementById('pipNext').textContent = next;
      d.getElementById('pipWrap').classList.toggle('show', !!wrap?.classList.contains('show'));
      d.getElementById('pipPause').textContent = pause && !pause.disabled ? 'Ⅱ' : '▶';
    }catch(e){}
  }

  async function openFloatingMini(){
    if(!('documentPictureInPicture' in window)){
      notify('Deze browser ondersteunt de zwevende MINI niet. Gebruik een recente versie van Chrome op desktop.');
      return;
    }

    try{
      if(floatingWindow && !floatingWindow.closed) floatingWindow.close();

      floatingWindow = await window.documentPictureInPicture.requestWindow({
        width:520,
        height:175,
        disallowReturnToOpener:false,
        preferInitialWindowPlacement:true
      });

      miniMarkup(floatingWindow.document);
      syncMini();
      clearInterval(syncTimer);
      syncTimer = setInterval(syncMini, 200);

      floatingWindow.addEventListener('pagehide', () => {
        clearInterval(syncTimer);
        syncTimer = null;
        floatingWindow = null;
      }, {once:true});

      notify('MINI staat nu in Picture-in-Picture. Klik FULL in de mini om terug te keren.');
    } catch(err){
      console.error('Document Picture-in-Picture failed:', err);
      const reason = err?.name === 'NotAllowedError'
        ? 'De browser blokkeerde Picture-in-Picture. Klik rechtstreeks op MINI en probeer opnieuw.'
        : err?.name === 'NotSupportedError'
          ? 'Picture-in-Picture is uitgeschakeld of niet beschikbaar in deze Chrome-installatie.'
          : `Picture-in-Picture kon niet openen (${err?.name || 'onbekende fout'}).`;
      notify(reason, 6000);
    }
  }

  const oldMini = document.getElementById('miniBtn');
  if(oldMini){
    const mini = oldMini.cloneNode(true);
    mini.textContent = 'MINI';
    mini.title = 'Open zwevende Picture-in-Picture timer';
    oldMini.replaceWith(mini);
    mini.addEventListener('click', openFloatingMini);
  }

  document.getElementById('popBtn')?.remove();
})();
