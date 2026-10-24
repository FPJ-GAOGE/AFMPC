(() => {
  'use strict';
  const root = document.documentElement;
  const header = document.querySelector('.site-header');
  const themeButton = document.getElementById('theme-toggle');
  let savedTheme;
  try { savedTheme = localStorage.getItem('afmpc-theme'); } catch (_) {}
  const applyTheme = theme => {
    root.dataset.theme = theme;
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`);
  };
  applyTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeButton.addEventListener('click', () => {
    const theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    applyTheme(theme);
    try { localStorage.setItem('afmpc-theme', theme); } catch (_) {}
  });
  const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 90);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });
  const menu = document.getElementById('navigation');
  const menuButton = document.getElementById('menu-toggle');
  const closeMenu = () => { menu.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); };
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
  const stageDescriptions = {
    perceive: 'Color, disparity and temporal cues select target pixels for a more consistent depth estimate.',
    estimate: 'Filtered image-center and depth observations reconstruct the target’s relative position and velocity.',
    follow: 'Stationary and moving-target predictions are fused to compute bounded commands while yaw is regulated separately.'
  };
  document.querySelectorAll('[data-task-stage]').forEach(button => button.addEventListener('click', () => {
    const stage = button.dataset.taskStage;
    document.getElementById('task-drawing').dataset.stage = stage;
    document.getElementById('task-explanation').textContent = stageDescriptions[stage];
    document.querySelectorAll('[data-task-stage]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  const clips = {
    full: {file: 'demo-full', poster: 'demo-poster', label: 'Full AFMPC demonstration', description: 'Complete demonstration · motivation, perception, adaptive control and real-pool experiments. Original narration and playback-speed annotations are preserved.'},
    yaw: {file: 'yaw-control', poster: 'yaw-control-poster', label: 'Yaw regulation simulation ablation', description: 'Unity simulation · with and without yaw regulation. Excerpt from 01:53–02:03 in the supplied demo; original 3× playback annotation is preserved.'},
    fusion: {file: 'model-fusion-pool', poster: 'model-fusion-pool-poster', label: 'Adaptive model fusion pool comparison', description: 'Pool experiment · stationary, moving and fused target models. Excerpt from 02:09–02:40; the source’s original 3× playback annotation is preserved.'},
    pool: {file: 'pool-tracking', poster: 'pool-tracking-poster', label: 'Real-pool target tracking', description: 'Real-pool demonstration · overhead and onboard views of a fish-shaped target moved by a handheld apparatus. Original 1.5× and 2× playback annotations are preserved.'}
  };
  const video = document.getElementById('demo-video');
  const tabs = [...document.querySelectorAll('[data-video]')];
  const chooseVideo = button => {
    const clip = clips[button.dataset.video];
    tabs.forEach(tab => { const active = tab === button; tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1; });
    video.pause();
    video.poster = `assets/video/${clip.poster}.jpg`;
    video.src = `assets/video/${clip.file}.mp4`;
    video.setAttribute('aria-label', clip.label);
    video.load();
    document.getElementById('video-description').textContent = clip.description;
    document.getElementById('video-download').href = video.src;
    document.getElementById('demo-panel').setAttribute('aria-labelledby', button.id);
  };
  tabs.forEach((button, i) => {
    button.addEventListener('click', () => chooseVideo(button));
    button.addEventListener('keydown', e => {
      let next;
      if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next !== undefined) { e.preventDefault(); tabs[next].focus(); chooseVideo(tabs[next]); }
    });
  });
  const dialog = document.getElementById('figure-dialog');
  const enlargedImage = document.getElementById('enlarged-figure');
  document.querySelectorAll('[data-zoom]').forEach(button => button.addEventListener('click', () => {
    if (typeof dialog.showModal !== 'function') { window.open(button.dataset.zoom, '_blank', 'noopener'); return; }
    enlargedImage.src = button.dataset.zoom;
    enlargedImage.alt = button.querySelector('img').alt;
    document.getElementById('figure-original').href = button.dataset.zoom;
    document.getElementById('figure-caption').textContent = button.dataset.caption;
    dialog.showModal();
  }));
  document.getElementById('close-figure').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', e => { if (e.target === dialog) { const r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  document.getElementById('copy-citation').addEventListener('click', async () => {
    const status = document.getElementById('copy-status');
    const text = document.getElementById('bibtex').textContent;
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(text);
      status.textContent = 'BibTeX copied to clipboard.';
    } catch (_) {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(document.getElementById('bibtex'));
      selection.removeAllRanges(); selection.addRange(range);
      status.textContent = 'Citation selected. Press Ctrl+C (or ⌘C) to copy, or download the .bib file.';
    }
  });
})();
