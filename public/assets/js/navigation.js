const toggleBtn = document.querySelector('.menu');
const closeBtn = document.querySelector('.menu-chiuso');
const menu = document.querySelector('#mobile');

function apriMenu(){
    menu.hidden = false;
    toggleBtn.setAttribute('aria-expanded', 'true');
    toggleBtn.setAttribute('aria-label', 'Chiudi menu');
    document.body.style.overflow='hidden';
    menu.querySelector('a')?.focus();
}

function chiudiMenu(){
    menu.hidden = true;
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-label', 'Apri menu');
    document.body.style.overflow='';
    toggleBtn.focus();
}

toggleBtn.addEventListener('click',()=>{
    const isOpen = toggleBtn.getAttribute('aria-expanded') === 'true';
    isOpen ? chiudiMenu() : apriMenu();
});


closeBtn.addEventListener('click', chiudiMenu);

// Chiusura con tasto Esc
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !menu.hidden) chiudiMenu();
});

// Chiusura al click su un link (utile per single-page nav)
menu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', chiudiMenu);
});