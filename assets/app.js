/* Navori Studio — app.js (sem dependências) */
(() => {
  "use strict";
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  document.documentElement.classList.remove("no-js");
  requestAnimationFrame(() => document.body.classList.add("loaded"));

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
  $$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 60}ms`; io.observe(el); });

  /* ---------- scroll: progress bar, nav, FAB, process line ---------- */
  const bar = $(".progress"), nav = $(".nav"), fab = $(".fab-wa"), steps = $(".steps");
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    nav.classList.toggle("scrolled", y > 30);
    fab.classList.toggle("show", y > innerHeight * 0.6);
    if (steps) {
      const r = steps.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (innerHeight * 0.75 - r.top) / (r.height + innerHeight * 0.2)));
      steps.style.setProperty("--prog", p.toFixed(3));
    }
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  onScroll();

  /* ---------- pointer effects: spotlight, tilt, magnetic ---------- */
  if (finePointer && !reduce) {
    $$(".spot").forEach((el) => el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }));
    $$(".tilt").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
        el.style.transform = `perspective(1400px) rotateX(${(-y * 3).toFixed(2)}deg) rotateY(${(x * 4).toFixed(2)}deg)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
      el.style.transition = "transform .5s cubic-bezier(.2,.7,.1,1)";
    });
    $$(".magnetic").forEach((el) => {
      el.addEventListener("pointermove", (e) => {
        const r = el.getBoundingClientRect();
        el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px,${(e.clientY - r.top - r.height / 2) * 0.28}px)`;
      });
      el.addEventListener("pointerleave", () => { el.style.transform = ""; });
    });
  }

  /* ---------- live metrics (measured on the visitor's device) ---------- */
  const fmtS = (ms) => `${(ms / 1000).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}s`;
  const setM = (k, v, good) => $$(`[data-metric="${k}"]`).forEach((el) => { el.textContent = v; el.classList.toggle("good", !!good); });
  let lcp = 0;
  try {
    new PerformanceObserver((list) => { const es = list.getEntries(); lcp = es[es.length - 1].startTime; })
      .observe({ type: "largest-contentful-paint", buffered: true });
  } catch (_) { /* Safari antigo */ }
  const countUp = (el, to, fmt, dur = 1200) => {
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    const step = (t) => { const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); el.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  const report = () => {
    const navE = performance.getEntriesByType("navigation")[0];
    const res = performance.getEntriesByType("resource");
    const ms = lcp || (navE ? navE.domContentLoadedEventEnd : performance.now());
    const bytes = [navE, ...res].reduce((s, e) => s + (e ? (e.transferSize || e.encodedBodySize || 0) : 0), 0);
    setM("lcp", fmtS(ms), ms < 2500);
    setM("kb", bytes ? `${Math.round(bytes / 1024)} KB` : "em cache", true);
    setM("req", String(res.length + 1));
    setM("tls", location.protocol === "https:" ? "segura 🔒" : "local", location.protocol === "https:");
    const big = $('[data-metric="lcp-big"]'), fill = $(".g-fill");
    if (big) {
      const gio = new IntersectionObserver(([e]) => {
        if (!e.isIntersecting) return;
        gio.disconnect();
        countUp(big, ms, fmtS);
        if (fill) fill.style.strokeDashoffset = String(157 * (1 - Math.max(0.08, Math.min(1, 1 - ms / 4000))));
      }, { threshold: 0.4 });
      gio.observe(big);
    }
  };
  addEventListener("load", () => setTimeout(report, 600), { once: true });

  /* ---------- demo: one site per business ---------- */
  const DEMO = {
    contabil: { name: "Contábil Horizonte", tag: "Contabilidade em Campinas", h: "Sua empresa em dia, sem dor de cabeça.", cta: "Falar com um contador", c1: "Abertura de empresa", c2: "Imposto de renda", c3: "Folha de pagamento", hours: "Seg–Sex 8h–18h" },
    clinica: { name: "Clínica Vitta", tag: "Fisioterapia em Curitiba", h: "Volte a se mexer sem dor.", cta: "Agendar avaliação", c1: "Fisioterapia ortopédica", c2: "Pilates", c3: "RPG", hours: "Seg–Sáb 7h–20h" },
    pousada: { name: "Pousada Mirante", tag: "Chalés na Serra da Mantiqueira", h: "Lareira, silêncio e café na varanda.", cta: "Ver disponibilidade", c1: "Chalé com lareira", c2: "Suíte com vista", c3: "Café colonial", hours: "Check-in 14h" },
    restaurante: { name: "Cantina Dona Rosa", tag: "Massas artesanais em BH", h: "Massa feita todo dia, do jeito da nonna.", cta: "Pedir pelo WhatsApp", c1: "Cardápio", c2: "Prato do dia", c3: "Delivery", hours: "Ter–Dom 11h–23h" },
    oficina: { name: "Auto Center Pista", tag: "Mecânica em Goiânia", h: "Seu carro pronto, com orçamento antes.", cta: "Pedir orçamento", c1: "Revisão completa", c2: "Freios e suspensão", c3: "Troca de óleo", hours: "Seg–Sáb 8h–18h" },
  };
  const screen = $("#demo-screen"), tabs = $$("[data-demo]");
  const show = (key) => {
    const apply = () => {
      screen.dataset.theme = key;
      for (const [f, v] of Object.entries(DEMO[key])) { const el = $(`[data-f="${f}"]`, screen); if (el) el.textContent = v; }
      screen.classList.remove("swap"); void screen.offsetWidth; screen.classList.add("swap");
    };
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.demo === key)));
    if (document.startViewTransition && !reduce) document.startViewTransition(apply); else apply();
  };
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => { show(t.dataset.demo); auto = false; });
    t.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const n = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      n.focus(); n.click();
    });
  });
  // cycles by itself while visible, until someone picks a tab
  let auto = !reduce, idx = 0, demoVisible = false;
  new IntersectionObserver(([e]) => { demoVisible = e.isIntersecting; }).observe(screen);
  setInterval(() => { if (auto && demoVisible && !document.hidden) { idx = (idx + 1) % tabs.length; show(tabs[idx].dataset.demo); } }, 3200);

  /* ---------- terminal ---------- */
  const term = $(".term-body");
  const LINES = [
    ["cmd", "$ navori criar --negocio \"seu negócio\""],
    ["ok", "  ✓ layout pensado para o seu ramo"],
    ["ok", "  ✓ textos e fotos do seu negócio"],
    ["ok", "  ✓ imagens otimizadas em WebP"],
    ["ok", "  ✓ responsivo de 360px a telas grandes"],
    ["ok", "  ✓ SEO: título, descrição e Schema.org"],
    ["ok", "  ✓ WhatsApp com mensagem pronta"],
    ["mut", ""],
    ["cmd", "$ navori publicar seunegocio.com.br"],
    ["ok", "  ✓ certificado HTTPS ativo"],
    ["hl", "  → no ar em https://seunegocio.com.br"],
  ];
  if (term) {
    const render = (n, partial) => {
      term.innerHTML = LINES.slice(0, n).map(([c, t]) => `<span class="${c}">${t}</span>`).join("\n") +
        (partial ? `${n ? "\n" : ""}<span class="${partial[0]}">${partial[1]}</span>` : "") + '<span class="caret"></span>';
    };
    const run = async () => {
      if (reduce) { render(LINES.length); return; }
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      for (let i = 0; i < LINES.length; i++) {
        const [c, t] = LINES[i];
        if (c === "cmd") { for (let k = 1; k <= t.length; k++) { render(i, [c, t.slice(0, k)]); await wait(28); } await wait(350); }
        else await wait(c === "mut" ? 200 : 260);
        render(i + 1);
      }
    };
    const tio = new IntersectionObserver(([e]) => { if (e.isIntersecting) { tio.disconnect(); run(); } }, { threshold: 0.35 });
    render(0); tio.observe(term);
  }

  /* ---------- FAQ: smooth open/close ---------- */
  if (!reduce) $$(".faq details").forEach((d) => {
    const s = $("summary", d), body = $("div", d);
    s.addEventListener("click", (e) => {
      e.preventDefault();
      if (d.open) {
        const a = body.animate([{ height: `${body.offsetHeight}px` }, { height: "0px" }], { duration: 280, easing: "ease-in" });
        a.onfinish = () => { d.open = false; };
      } else {
        d.open = true;
        body.animate([{ height: "0px", opacity: 0 }, { height: `${body.offsetHeight}px`, opacity: 1 }], { duration: 360, easing: "cubic-bezier(.2,.7,.1,1)" });
      }
    });
  });

  /* ---------- hero WebGL (loads after the page, pauses off-screen) ---------- */
  const startGL = () => {
    const c = $(".hero-gl");
    const gl = c && (c.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }));
    if (!gl) return;
    const vs = "attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}";
    const fs = `precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=R*p*2.02;a*=.5;}return v;}
void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;vec2 mm=(m-.5)*vec2(r.x/r.y,1.);float tt=t*.05;
vec2 q=vec2(fbm(p*1.5+tt),fbm(p*1.5-tt+5.2));
vec2 w=vec2(fbm(p*1.3+2.*q+vec2(1.7,9.2)+.02*t),fbm(p*1.3+2.*q+vec2(8.3,2.8)-.015*t));
float f=fbm(p*1.1+2.4*w+mm*.35);
vec3 c1=vec3(.48,.18,.97),c2=vec3(.95,.19,.60),c3=vec3(1.,.48,.10);
vec3 col=mix(c1,c2,smoothstep(.3,.7,f));col=mix(col,c3,smoothstep(.55,.95,f*w.x*1.7));
float g=smoothstep(.32,.95,f);float d=length(p-mm*.5-vec2(.45,.12));
col*=g*(.45+.55*smoothstep(1.3,0.,d));
col*=mix(.22,1.,smoothstep(.15,.9,uv.x));col*=smoothstep(0.,.45,uv.y);
gl_FragColor=vec4(vec3(.027,.031,.043)+col*1.15,1.);}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const a = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "r"), uT = gl.getUniformLocation(pr, "t"), uM = gl.getUniformLocation(pr, "m");
    const scale = 0.5 * Math.min(devicePixelRatio || 1, 1.5);
    const size = () => { c.width = Math.max(1, c.clientWidth * scale | 0); c.height = Math.max(1, c.clientHeight * scale | 0); gl.viewport(0, 0, c.width, c.height); };
    size(); addEventListener("resize", size, { passive: true });
    let mx = 0.6, my = 0.55, tx = mx, ty = my, visible = true, t0 = performance.now(), raf = 0;
    if (finePointer) addEventListener("pointermove", (e) => { tx = e.clientX / innerWidth; ty = 1 - e.clientY / innerHeight; }, { passive: true });
    const frame = (now) => {
      mx += (tx - mx) * 0.04; my += (ty - my) * 0.04;
      gl.uniform2f(uR, c.width, c.height); gl.uniform1f(uT, (now - t0) / 1000 + 20); gl.uniform2f(uM, mx, my);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      if (!reduce && visible && !document.hidden) raf = requestAnimationFrame(frame); else raf = 0;
    };
    const resume = () => { if (!raf && visible && !document.hidden && !reduce) raf = requestAnimationFrame(frame); };
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; resume(); }).observe(c);
    document.addEventListener("visibilitychange", resume);
    frame(performance.now());
    c.classList.add("on");
  };
  addEventListener("load", () => (window.requestIdleCallback || setTimeout)(startGL, { timeout: 1500 }), { once: true });

  /* ---------- offline-ready ---------- */
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}), { once: true });
  }
})();
