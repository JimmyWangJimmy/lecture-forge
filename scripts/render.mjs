#!/usr/bin/env node
/**
 * 把讲义 JSON 渲染成单文件 HTML（内联 KaTeX、深浅主题、可播放动画）。
 *
 * 用法：
 *   node render.mjs lecture.json -o out.html
 *   cat lecture.json | node render.mjs -o out.html
 *
 * JSON 结构见 templates/schema.json。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const TPL = path.join(HERE, '..', 'templates');

const katexCss = fs.readFileSync(path.join(TPL, 'katex.css'), 'utf8');
const docCss = fs.readFileSync(path.join(TPL, 'doc.css'), 'utf8');
const katexJs = fs
  .readFileSync(path.join(TPL, 'katex.js'), 'utf8')
  .replace(/^<script>/, '')
  .replace(/<\/script>$/, '');

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

let EQ_N = 0;

function renderBlock(b) {
  switch (b.type) {
    case 'p':
      return `<p>${esc(b.text)}</p>`;
    case 'callout':
      return `<div class="cal ${esc(b.kind || 'plain')}"><div class="ct">${esc(b.title || '')}</div><p>${esc(b.text).replace(/\n/g, '<br>')}</p></div>`;
    case 'eq': {
      EQ_N += 1;
      const num = b.num || `(${EQ_N})`;
      return `<div class="eq"><span class="body" data-tex="${esc(b.tex)}"></span><span class="num">${esc(num)}</span></div>`;
    }
    case 'table': {
      const head = (b.head || []).map((h) => `<th>${esc(h)}</th>`).join('');
      const rows = (b.rows || [])
        .map((r) => '<tr>' + r.map((c) => `<td>${esc(c)}</td>`).join('') + '</tr>')
        .join('');
      return `<div class="tbl-wrap"><table class="dt"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
    }
    case 'code':
      return `<pre class="code"><code>${esc(b.text)}</code></pre>`;
    case 'list':
      return `<ul>${(b.items || []).map((i) => `<li>${esc(i)}</li>`).join('')}</ul>`;
    case 'img':
      return `<figure class="slide"><img src="${esc(b.src)}" alt="${esc(b.cap || '')}"><figcaption>${esc(b.cap || '')}</figcaption></figure>`;
    case 'anim': {
      const items = (b.items || [])
        .map((it, i) => `<div class="a-step"><span class="no">${i + 1}</span>${esc(it)}</div>`)
        .join('');
      return `<div class="anim anim-auto" data-cap="${esc(b.cap || '')}">
        <div class="anim-hd"><span class="tag">深入浅出</span><span class="t">${esc(b.title || '')}</span><span class="sp"></span><button class="anim-play">▶ 播放</button></div>
        <div class="anim-stage"><div class="a-steps">${items}</div></div>
        <div class="anim-cap">${esc(b.cap || '点播放，逐步看这个过程')}</div>
      </div>`;
    }
    default:
      return '';
  }
}

function render(doc) {
  EQ_N = 0;
  const nav = [];
  const body = (doc.chapters || [])
    .map((ch, ci) => {
      const cid = `s${ci + 1}`;
      const subs = (ch.sections || []).map((sec, si) => {
        const sid = `${cid}-${si + 1}`;
        nav[cid] = nav[cid] || [];
        nav[cid].push({ id: sid, title: sec.title });
        return `<h3 id="${sid}">${esc(sec.title)}</h3>\n${(sec.blocks || []).map(renderBlock).join('\n')}`;
      });
      nav.push({ id: cid, title: ch.title, subs: nav[cid] || [] });
      const p = ch.primer || {};
      const items = (p.items || []).map((i) => `<li>${esc(i)}</li>`).join('');
      const keyIsTex = /[\^_{}\\]/.test(p.key || '');
      const keyBlock = p.key
        ? keyIsTex
          ? `<span data-tex="${esc(p.key)}"></span>`
          : `<span style="font-size:14px;color:var(--text-2)">${esc(p.key)}</span>`
        : '';
      return `<section id="${cid}">
  <h2><span class="idx">§${ci + 1}</span>${esc(ch.title)}</h2>
  <p class="lead">${esc(ch.lead || '')}</p>
  ${
    (p.items || []).length
      ? `<div class="primer">
    <div class="primer-hd"><span class="tag">入门版</span>这一章只要记住三件事<span class="sp"></span><span class="hint">想深挖再往下读</span></div>
    <div class="primer-bd"><ol>${items}</ol>
      ${p.key ? `<div class="primer-eq"><div class="lab">唯一要记的</div>${keyBlock}</div>` : ''}
    </div></div>`
      : ''
  }
  ${subs.join('\n')}
</section>
<hr>`;
    })
    .join('\n');

  const navHTML = nav
    .filter((n) => n && n.id)
    .map(
      (n) => `<div class="grp"><a href="#${n.id}"><span class="n">§</span><span>${esc(n.title)}</span></a>
    <ul>${(n.subs || []).map((s) => `<li><a href="#${s.id}">${esc(s.title)}</a></li>`).join('')}</ul></div>`
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(doc.title)}</title>
<style>${katexCss}</style>
<style>${docCss}</style>
</head>
<body>
<div class="app">
<aside class="sidebar">
  <div class="brand"><div class="kicker">${esc(doc.kicker || '讲义精读')}</div><h1>${esc(doc.title)}</h1><div class="sub">${esc(doc.subtitle || '')}</div></div>
  <nav class="tree">${navHTML}</nav>
</aside>
<main>
<div class="topbar">
  <button class="burger" onclick="document.body.classList.toggle('nav-open')">☰</button>
  <div class="crumb"><b>${esc(doc.title)}</b></div><div class="spacer"></div>
  <button class="tbtn" id="themeBtn">◐ 深色</button>
</div>
<article>
${body}
</article>
</main>
</div>
<script>${katexJs}</script>
<script>
(function(){
  function boot(){
    if (window.katex) {
      document.querySelectorAll('[data-tex]').forEach(function(el){
        try {
          katex.render(el.getAttribute('data-tex'), el, {
            displayMode: el.classList.contains('body'), throwOnError: false, strict: false
          });
        } catch (e) { el.textContent = el.getAttribute('data-tex'); }
      });
    }
    var root = document.documentElement, btn = document.getElementById('themeBtn');
    try { var s = localStorage.getItem('forge-theme'); if (s) root.setAttribute('data-theme', s); } catch (e) {}
    function paint(){ if (btn) btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀ 浅色' : '◐ 深色'; }
    paint();
    if (btn) btn.addEventListener('click', function(){
      var n = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', n);
      try { localStorage.setItem('forge-theme', n); } catch (e) {}
      paint();
    });
    document.querySelectorAll('.tree a').forEach(function(a){
      a.addEventListener('click', function(){ document.body.classList.remove('nav-open'); });
    });
    document.querySelectorAll('.anim-auto').forEach(function(box){
      var steps = [].slice.call(box.querySelectorAll('.a-step'));
      var cap = box.querySelector('.anim-cap'); var base = cap.textContent;
      var b = box.querySelector('.anim-play'); var t = null;
      function play(){
        if (t) clearInterval(t);
        steps.forEach(function(s){ s.classList.remove('on'); });
        var i = 0;
        t = setInterval(function(){
          if (i >= steps.length) { clearInterval(t); cap.textContent = base; return; }
          steps[i].classList.add('on');
          cap.textContent = steps[i].textContent.replace(/^\d+/, '').trim();
          i++;
        }, 1100);
      }
      if (b) b.addEventListener('click', function(){ play(); b.textContent = '▶ 重播'; });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
</script>
</body>
</html>`;
}

// ---------- CLI ----------
const args = process.argv.slice(2);
let input = null;
let output = 'lecture.html';
for (let i = 0; i < args.length; i++) {
  if (args[i] === '-o' || args[i] === '--output') output = args[++i];
  else if (!input) input = args[i];
}

const raw = input && input !== '-'
  ? fs.readFileSync(input, 'utf8')
  : fs.readFileSync(0, 'utf8');

let doc;
try {
  doc = JSON.parse(raw);
} catch (e) {
  const m = raw.match(/\{[\s\S]*\}/);
  if (!m) {
    console.error('输入不是合法 JSON');
    process.exit(1);
  }
  doc = JSON.parse(m[0]);
}

const html = render(doc);
fs.writeFileSync(output, html, 'utf8');
const kb = (html.length / 1024).toFixed(0);
console.log(`✓ ${output}（${kb} KB，${(doc.chapters || []).length} 章）`);
