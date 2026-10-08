// Local UI behavior only. All page content and demo results are static snapshots.
const text = el => (el.textContent || '').replace(/\s+/g, ' ').trim();
const buttons = () => [...document.querySelectorAll('button')];
const find = label => buttons().find(b => text(b) === label);
const route = path => { location.href = path !== '/home/' && path !== '/' && location.search?.includes('view=sidebar') ? path + (path.includes('?') ? '&' : '?') + 'view=sidebar' : path; };
// A local demo session, never a real Nervant login.
const sessionKey = 'nervant-static-signed-in';
const signedIn = localStorage.getItem(sessionKey) === 'true';
function signIn() { localStorage.setItem(sessionKey, 'true'); route('/home/'); }
function signOut() { localStorage.removeItem(sessionKey); route('/'); }
const data = Promise.all(['/states.json', '/faqs.json', '/routes.json'].map(url => fetch(url, { cache: 'no-store' }).then(r => r.json())));
let monthly = document.querySelector('main')?.outerHTML;
let menu;
let menuButton;
function notice(title, message = 'This action is a local UI preview. No account, payment, message, or live session is created.') {
  const dialog = document.createElement('dialog');
  dialog.className = 'preview-dialog';
  const heading = document.createElement('h2'); heading.textContent = title;
  const paragraph = document.createElement('p'); paragraph.textContent = message;
  const close = document.createElement('button'); close.textContent = 'Close'; close.addEventListener('click', () => dialog.close());
  dialog.append(heading, paragraph, close); document.body.append(dialog);
  dialog.addEventListener('close', () => dialog.remove());
  dialog.addEventListener('click', e => { if(e.target === dialog) dialog.close(); });
  dialog.showModal();
}
const navigation = [
 ['Home','/'],['Engage','/engage'],['Slotz — book a time','/availability'],
 ['Education & Schools','/use-cases/education'],['Corporate & Teams','/use-cases/corporate'],
 ['Conferences & Events','/use-cases/conferences'],['Show Hosts & Live Shows','/use-cases/platform'],
 ['Take the Nervant Test','/intelligence-hub'],['See job matches','/job-matches'],
 ['Sign up as a Recruiter','/recruiter'],['Explore B2B plans','/pricing'],
 ['View all use cases','/use-cases'],['Impact Fund','/impact-fund'],['Templates','/templates'],['Contact Us','/support'],['Sign In','/login']
];
function closeMenu() { menu?.remove(); menu = null; document.querySelectorAll('[aria-haspopup]').forEach(b=>b.setAttribute('aria-expanded','false')); }
function openMenu(button) {
 if(menu) { const same=menuButton===button; closeMenu(); if(same) return; }
 menuButton=button;
 menu=document.createElement('nav'); menu.className='preview-menu'; menu.setAttribute('aria-label','Site navigation');
 const label=text(button);
 const items = signedIn ? (
  ['Account menu','Settings'].includes(button.getAttribute('aria-label')) ? [['My profile','/intelligence-hub'],['Plans & billing','/pricing'],['Help & support','/support'],['Sign Out','/']] :
  label.startsWith('Intelligence') ? [['Intelligence home','/intelligence-hub'],['Take the Nervant Test','/intelligence-hub'],['See job matches','/job-matches']] :
  label.startsWith('Engage') ? [['Engage home','/engage'],['Live polls','/polls'],['Templates','/templates'],['Podcast mode','/podcast'],['Slotz','/availability']] :
  [['Home','/home'],['Intelligence','/intelligence-hub'],['Engage','/engage'],...navigation.slice(2,-1),['Sign Out','/']]
 ) : label === 'Intelligence' ? navigation.slice(7,11) : label === 'Use Cases' ? navigation.slice(3,7) : navigation;
 items.forEach(([label,url])=>{const a=document.createElement('a');a.href=signedIn && button.getAttribute('aria-label')==='Account menu' && label!=='Sign Out' ? url+'?view=sidebar' : url;a.textContent=label==='Sign In' && signedIn ? 'Sign Out' : label;menu.append(a);});
 document.body.append(menu); button.setAttribute('aria-expanded','true');
 const rect=button.getBoundingClientRect(); menu.style.top=`${Math.max(12,Math.min(rect.bottom+8,innerHeight-menu.offsetHeight-12))}px`;
 menu.style.left=`${Math.max(12,Math.min(rect.left,innerWidth-300))}px`;menu.querySelector('a').focus();
}
function replaceGroup(markup, element, label) {
 element.outerHTML=markup;
 const target=buttons().find(b => text(b)===label || b.getAttribute('aria-label')===label);
 target?.focus({preventScroll:true});
}
document.addEventListener('keydown',e=>{if(e.key==='Escape' && menu) { closeMenu(); menuButton?.focus(); }});
document.addEventListener('click',async e=>{
 if(signedIn && !e.target.closest('dialog') && (e.target.closest('.workspace-search') || e.target.closest('.mobile-bottom [aria-label="Search"]'))) {
  if(!document.querySelector('.command-palette')) { e.preventDefault(); openCommandPalette(); }
  return;
 }
 const control=e.target.closest('a,button');
 if(control && !control.closest('dialog')) {
  const label=text(control).toLowerCase();
  if(label==='sign out') { e.preventDefault(); signOut(); return; }
  if(label==='sign in' || label==='sign in to host') { e.preventDefault(); signIn(); return; }
 }
 if(control?.dataset.action==='join-session') { e.preventDefault(); openJoinSession(); return; }
 const b=e.target.closest('button');
 if(menu && !e.target.closest('.preview-menu') && !b?.hasAttribute('aria-haspopup')) closeMenu();
 const a=e.target.closest('a');
 if(a) {
  const url=new URL(a.href,location.href);
  if(signedIn && document.body.classList.contains('workspace-area-view') && !a.matches('.rail-home,.rail-logo') && url.pathname !== '/home/' && url.origin===location.origin) url.searchParams.set('view','sidebar');
  if(url.origin !== location.origin) return;
  e.preventDefault();
  const [, ,routes]=await data;
  if(url.origin===location.origin && !routes.includes(url.pathname.replace(/\/$/,'')||'/') && !url.hash) {
   e.preventDefault(); notice(text(a)||'Page preview','This destination is beyond the captured first level. Choose a page from the navigation to keep experimenting locally.');
  }
  else { location.href=url.href; }
  return;
 }
 if(!b || b.closest('dialog') || b.disabled) return;
 const label=text(b); const aria=b.getAttribute('aria-label'); const [states,faqs]=await data;
 if(aria==='Menu' || b.hasAttribute('aria-haspopup')) { openMenu(b); return; }
 if(location.pathname==='/' || location.pathname.replace(/\/$/,'')==='/home') {
  if(['Show live results view','Show real teams view'].includes(aria)) {
   replaceGroup(states[aria.includes('results')?'hero:results':'hero:teams'],b.parentElement.parentElement,aria);return;
  }
  const demoLabels=['QR Join','Slotz','Polls & Insights','Pods','Word Clouds','Presentations'];
  if(demoLabels.includes(label)) { replaceGroup(states[label],b.parentElement.parentElement,label);return; }
  if(['For you','Education','Teams'].includes(label) && [...b.parentElement.children].some(el=>text(el)==='For you')) {
   replaceGroup(states['template:'+label],b.parentElement.parentElement.parentElement,label);return;
  }
  if(['Teams','Education','Events','Recruiting'].includes(label) && b.closest('section')) {
   replaceGroup(states['audience:'+label],b.closest('section'),label);return;
  }
 }
 if(b.hasAttribute('aria-expanded') && !b.hasAttribute('aria-haspopup')) {
  const expanded=b.getAttribute('aria-expanded')==='true';
  if(!expanded && faqs[label]) {b.parentElement.outerHTML=faqs[label];return;}
  const content=b.parentElement.querySelector('div');
  if(content){content.hidden=expanded;b.setAttribute('aria-expanded',String(!expanded));return;}
 }
 if(location.pathname.startsWith('/pricing') && /^(Monthly|Annual)/.test(label)) {
  const html=label==='Monthly'?monthly:await fetch('/pricing-annual.html').then(r=>r.text());
  document.querySelector('main').outerHTML=html;return;
 }
 const exact={Home:signedIn?'/home/':'/',Back:'/',Close:'/',Engage:'/engage',Templates:'/templates',
  'Start a live session':'/engage','Start a session →':'/engage',
  'Take the Nervant Test':'/intelligence-hub','See job matches':'/job-matches',
  'Explore Nervant for Recruiting':'/use-cases/recruiters','Sign up free':'/login',
  'Sign up':'/login','Contact us':'/support','Contact Us':'/support',
  'Sign In to Host':'/login','Get Pods with Teams →':'/pricing',
  'Try Word Cloud →':'/polls','Start a team retro':'/templates',
  'Explore B2B plans':'/pricing'};
 if(exact[label]) {route(exact[label]);return;}
 if(label.startsWith('Conferences Session feedback')) {route('/templates/conferences');return;}
 if(/Live Poll|Quick Choice|Launch now|Create Choice|^New$/.test(label)) {
  if(location.pathname!='/polls/' && location.pathname!='/polls') {route('/polls');return;}
  notice('New live poll','Static preview: What should we focus on next? • Product quality • Customer growth • Team collaboration');return;
 }
 if(/Sign In|Google|password|Upgrade|Sign up|Join|Launch|Create|Start|Host|Book|Test|quiz|Word Cloud|Scale|Presentation/i.test(label)) {
  e.preventDefault();notice(label);return;
 }
 if(label && !b.closest('form')) notice(label);
});
document.addEventListener('submit',e=>{
 e.preventDefault();
 if(e.target.matches('.workspace-search')) {
  openCommandPalette();
  return;
 }
 if(e.target.matches('.join-session-form')) {
  e.target.closest('dialog').close();
  notice('Session preview', 'This static copy cannot join a live session. Your code has not been sent.'); return;
 }
 notice('Preview complete');
});
document.addEventListener('input',e=>{
 if(e.target.matches('input') && (e.target.placeholder==='Code' || e.target.placeholder?.includes('CODE'))) {
  const parent=e.target.closest('form')||e.target.parentElement.parentElement;
  const button=parent.querySelector('button');if(button)button.disabled=!e.target.value.trim();
 }
});

// The five workspace sections use real local pages and share one lightweight shell.
const workspaceSections = [['Home','/home/'],['Engage','/engage/'],['Intelligence','/intelligence-hub/'],['Pods','/pods/'],['Slotz','/slotz/'],['Templates','/templates/']];
const iconPaths = {
 profile: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a8 8 0 0 1 16 0v2Z"/>',
 home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z"/>',
 plus: '<path d="M12 5v14M5 12h14"/>',
 saved: '<path d="M6 4h12v17l-6-4-6 4V4Z"/>',
 templates: '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M9 3v18M9 10h12"/>',
 messages: '<path d="M21 11.5a8.5 8.5 0 0 1-8.5 8.5H4l-1-8.5a9 9 0 0 1 18 0Z"/><path d="M8 11h.01M12 11h.01M16 11h.01"/>',
 settings: '<path d="m9.5 3-.6 2.2-2 .9-2-.7-2.5 4.2L4 11.3v2l-1.6 1.5L5 19l2.1-.6 1.8 1 .6 2.1h5l.6-2.2 1.9-.9 2.1.6 2.4-4.2-1.6-1.5v-2L21.5 9 19 4.8l-2 .7-1.9-.9-.6-2.1h-5Z"/><circle cx="12" cy="12" r="3"/>',
 search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>'
};
const shellIcon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]}</svg>`;
function openJoinSession() {
 const dialog=document.createElement('dialog'); dialog.className='preview-dialog';
 dialog.innerHTML='<form class="join-session-form"><h2>Join session</h2><label for="session-code">Session code</label><input id="session-code" name="code" placeholder="Enter code" required pattern="[A-Za-z0-9]{4,10}" maxlength="10" autocomplete="off"><div class="join-actions"><button type="button" data-close>Cancel</button><button type="submit">Join session</button></div></form>';
 document.body.append(dialog);
 dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('close',()=>dialog.remove());
 dialog.showModal(); dialog.querySelector('input').focus();
}
if(signedIn) {
 if(location.pathname==='/' || /^\/login\/?$/.test(location.pathname)) {
  location.replace('/home/');
 } else {
  document.querySelector('header')?.remove();
  document.body.classList.add('workspace-layout');
  const current=location.pathname.replace(/\/$/,'');
  const shell=document.createElement('div'); shell.className='workspace-shell';
  shell.innerHTML=`
   <aside class="workspace-rail" aria-label="Sidebar">
    <a class="rail-logo" href="/home/" aria-label="Nervant home"><img src="/assets/4008545328-nervant-logo.webp" alt=""></a>
    <nav aria-label="Shortcuts">
     <a class="rail-item rail-host" href="/engage/?view=sidebar" aria-label="Host" data-tooltip="Host">${shellIcon('plus')}</a>
     <a class="rail-item rail-home" href="/home/" aria-label="Home" data-tooltip="Home">${shellIcon('home')}</a>
     <a class="rail-item" href="/saved/?view=sidebar" aria-label="Saved" data-tooltip="Saved">${shellIcon('saved')}</a>
     <a class="rail-item" href="/templates/?view=sidebar" aria-label="Templates" data-tooltip="Templates">${shellIcon('templates')}</a>
     <a class="rail-item" href="/messages/?view=sidebar" aria-label="Messages" data-tooltip="Messages">${shellIcon('messages')}</a>
    </nav>
    <a class="rail-item rail-settings" href="/settings/?view=sidebar" aria-label="Settings" data-tooltip="Settings">${shellIcon('settings')}</a>
   </aside>
   <div class="mobile-top">
    <a class="mobile-brand rail-logo" href="/home/" aria-label="Nervant home"><img src="/assets/4008545328-nervant-logo.webp" alt=""><span>Nervant</span></a>
    <div class="mobile-top-actions">${current==='/settings/profile' ?
     `<a href="/settings/?view=sidebar" aria-label="Settings">${shellIcon('settings')}</a>` :
     `<a href="/engage/?view=sidebar" aria-label="Host">${shellIcon('plus')}</a><a href="/messages/?view=sidebar" aria-label="Messages">${shellIcon('messages')}</a>`}
    </div>
   </div>
   <nav class="mobile-bottom" aria-label="Mobile navigation">
    <a class="rail-home" href="/home/" aria-label="Home">${shellIcon('home')}</a>
    <a href="/templates/?view=sidebar" aria-label="Templates">${shellIcon('templates')}</a>
    <a href="/search/?view=sidebar" aria-label="Search">${shellIcon('search')}</a>
    <a href="/saved/?view=sidebar" aria-label="Saved">${shellIcon('saved')}</a>
    <a href="/settings/profile/?view=sidebar" aria-label="Profile">${shellIcon('profile')}</a>
   </nav>
   <div class="workspace-top">
    <form class="workspace-search" role="search">${shellIcon('search')}<input type="search" name="query" placeholder="Search" aria-label="Search sections" role="combobox" aria-expanded="false" aria-controls="command-results" aria-autocomplete="list" autocomplete="off"><kbd class="search-shortcut" aria-hidden="true">⌘ K</kbd></form>
    <button type="button" class="workspace-join" data-action="join-session">Join session</button>
    <button type="button" class="workspace-profile" aria-label="Account menu" aria-haspopup="true" aria-expanded="false">D</button>
   </div>
   <nav class="workspace-tabs" aria-label="Sections">${workspaceSections.slice(0,5).map(([label,url])=>`<a href="${url}" ${current===url.replace(/\/$/,'')?'aria-current="page"':''}>${label}</a>`).join('')}</nav>`;
  document.body.prepend(shell);
  const areaView = new URLSearchParams(location.search).get('view')==='sidebar' || !workspaceSections.slice(0,5).some(([,url])=>url.replace(/\/$/,'')===current);
  document.body.classList.toggle('workspace-area-view',areaView);
  document.querySelector('.workspace-tabs').hidden=areaView;
  const activeLabel = !areaView ? 'Home' : current==='/engage' ? 'Host' : current.startsWith('/settings') || ['/pricing','/support'].includes(current) ? 'Settings' : current.startsWith('/templates') ? 'Templates' : current==='/saved' ? 'Saved' : current==='/messages' ? 'Messages' : null;
  if(activeLabel) document.querySelector(`.workspace-rail [aria-label="${activeLabel}"]`)?.setAttribute('aria-current','page');
  const mobileActive = !areaView ? 'Home' : current.startsWith('/templates') ? 'Templates' : current==='/saved' ? 'Saved' : current==='/search' ? 'Search' : current.startsWith('/settings') || ['/pricing','/support'].includes(current) ? 'Profile' : null;
  if(mobileActive) document.querySelector(`.mobile-bottom [aria-label="${mobileActive}"]`)?.setAttribute('aria-current','page');
  // Section tabs replace the duplicated back-to-Home control.
  if(['/engage','/intelligence-hub'].includes(current)) {
   const back=[...document.querySelectorAll('#root button')].find(b=>text(b)==='Home');
   if(back) back.hidden=true;
  }
 }
} else if(['/home','/pods','/slotz'].includes(location.pathname.replace(/\/$/,''))) {
 location.replace('/');
}

const commandItems = [
 {label:'Templates', detail:'Browse ready-made polls, scales and presentations', icon:'templates', group:'Explore', url:'/templates/?view=sidebar'},
 {label:'Live Poll', detail:'Launch a poll instantly', icon:'plus', group:'Quick launch', url:'/polls/'},
 {label:'Host Session', detail:'Run live quizzes', icon:'messages', group:'Quick launch', url:'/podcast/'},
 {label:'Slotz', detail:'Let people book a time with you', icon:'saved', group:'Quick launch', url:'/slotz/'}
];
function filterCommands(query) {
 const words=query.trim().toLowerCase().split(/\s+/);
 return commandItems.filter(item=>words.every(word=>(item.label+' '+item.detail).toLowerCase().includes(word)));
}
function openCommandPalette() {
 if(document.querySelector('.command-palette')) return;
 closeMenu();
 const previous=document.activeElement;
 const mobile=matchMedia('(max-width:700px)').matches;
 const anchor=document.querySelector('.workspace-top .workspace-search');
 const dialog=document.createElement('dialog'); dialog.className='command-palette '+(mobile?'command-sheet':'command-dropdown');
 const listeners=new AbortController();
 const options={signal:listeners.signal};
 const close=()=>dialog.close();
 dialog.setAttribute('aria-label','Search Nervant');
 dialog.innerHTML=`${mobile ? `<div class="command-input-row">${shellIcon('search')}<input type="search" placeholder="Search Nervant…" aria-label="Search commands" role="combobox" aria-expanded="true" aria-controls="command-results" aria-autocomplete="list" autocomplete="off"><button type="button" class="command-close" aria-label="Close search">Close</button></div>` : ''}<div id="command-results" role="listbox" aria-label="Results"></div><div class="command-footer"><span>↑ ↓ to navigate</span><span>↵ to open</span><span>esc to close</span></div>`;
 document.body.append(dialog);
 const input=mobile?dialog.querySelector('input'):anchor.querySelector('input');
 const results=dialog.querySelector('#command-results');
 input.setAttribute('aria-expanded','true');
 if(!mobile) anchor.classList.add('search-expanded');
 if(mobile) document.body.classList.add('mobile-search-open');
 function position() {
  if(mobile) return;
  const rect=anchor.getBoundingClientRect();
  dialog.style.left=rect.left+'px';dialog.style.top=rect.bottom+'px';dialog.style.width=rect.width+'px';
  dialog.style.maxHeight=Math.max(140,innerHeight-rect.bottom-16)+'px';
 }
 position();
 window.addEventListener('resize',()=>{if(matchMedia('(max-width:700px)').matches!==mobile)close();else position();},options);
 window.addEventListener('scroll',position,{...options,capture:true});
 let matches=[], selected=0;
 function select(index) {
  selected=index;
  results.querySelectorAll('[role="option"]').forEach((el,i)=>el.setAttribute('aria-selected',String(i===selected)));
  if(matches.length) input.setAttribute('aria-activedescendant','command-'+selected); else input.removeAttribute('aria-activedescendant');
 }
 function render() {
  matches=filterCommands(input.value); results.replaceChildren(); let group='';
  matches.forEach((item,index)=>{
   if(item.group!==group) { group=item.group; const heading=document.createElement('div'); heading.className='command-group';heading.textContent=group;heading.setAttribute('role','presentation');results.append(heading); }
   const option=document.createElement('button');option.type='button';option.className='command-option';option.id='command-'+index;option.tabIndex=-1;option.setAttribute('role','option');
   option.innerHTML=`<span class="command-icon">${shellIcon(item.icon)}</span><span class="command-copy"><strong>${item.label}</strong><small>${item.detail}</small></span><span class="command-enter" aria-hidden="true">↵</span>`;
   option.addEventListener('pointermove',()=>select(index));
   option.addEventListener('click',()=>{dialog.close();route(item.url);}); results.append(option);
  });
  if(!matches.length) { const empty=document.createElement('p');empty.className='command-empty';empty.setAttribute('role','status');empty.textContent='No results. Try templates, poll, host or Slotz.';results.append(empty); }
  select(0);
 }
 input.addEventListener('input',render,options);
 input.addEventListener('keydown',e=>{
  if(['ArrowDown','ArrowUp'].includes(e.key)) { e.preventDefault();if(matches.length) select((selected+(e.key==='ArrowDown'?1:-1)+matches.length)%matches.length); }
  if(e.key==='Enter') {e.preventDefault();if(matches[selected]) {dialog.close();route(matches[selected].url);} }
  if(e.key==='Escape') {e.preventDefault();dialog.close();}
 },options);
 dialog.querySelector('.command-close')?.addEventListener('click',close);
 if(!mobile) {
  document.addEventListener('pointerdown',e=>{if(!dialog.contains(e.target)&&!anchor.contains(e.target))close();},options);
  document.addEventListener('focusin',e=>{if(!dialog.contains(e.target)&&!anchor.contains(e.target))close();},options);
 }
 dialog.addEventListener('close',()=>{
  listeners.abort();dialog.remove();input.setAttribute('aria-expanded','false');input.removeAttribute('aria-activedescendant');
  anchor?.classList.remove('search-expanded');document.body.classList.remove('mobile-search-open');
  if(mobile)previous?.focus({preventScroll:true});
 });
 render();if(mobile)dialog.showModal();else dialog.show();input.focus();

}
document.addEventListener('keydown',e=>{
 if(signedIn && (e.metaKey||e.ctrlKey) && e.key.toLowerCase()==='k') {
  e.preventDefault();const open=document.querySelector('.command-palette');if(open)open.close();else openCommandPalette();
 }
});

document.addEventListener('focusin',e=>{
 if(signedIn && e.target.matches('.workspace-top .workspace-search input')) openCommandPalette();
});
