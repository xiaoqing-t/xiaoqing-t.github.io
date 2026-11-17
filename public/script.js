// 年份自动更新
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();

// 移动端导航切换
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const nav = document.getElementById('nav');

if (navToggle && navLinks && nav) {
  const setOpen = (open) => {
    navLinks.classList.toggle('open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
  };

  navToggle.addEventListener('click', () => setOpen(!navLinks.classList.contains('open')));

  navLinks.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape' || !navLinks.classList.contains('open')) return;
    setOpen(false);
    navToggle.focus();
  });

  document.addEventListener('pointerdown', (event) => {
    if (!nav.contains(event.target)) setOpen(false);
  });

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });
}

// 滚动渐入动画
if (typeof IntersectionObserver !== 'undefined') {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll('.card, .creative-cell').forEach((el) => {
    observer.observe(el);
  });
}
