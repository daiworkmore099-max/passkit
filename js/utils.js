/* PassKit — utils.js */
const PKUtils = (() => {
  function el(id) { return document.getElementById(id); }
  function setText(id, val) { const e = el(id); if (e) e.textContent = val; }
  function setHTML(id, val) { const e = el(id); if (e) e.innerHTML = val; }
  function show(id) { const e = el(id); if (e) e.style.display = ''; }
  function hide(id) { const e = el(id); if (e) e.style.display = 'none'; }
  function val(id) { const e = el(id); return e ? e.value : ''; }
  function checked(id) { const e = el(id); return e ? e.checked : false; }

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        const ok = document.execCommand('copy');
        document.body.removeChild(ta);
        return ok;
      } catch (e2) { return false; }
    }
  }

  function showToast(msg, type = 'success', duration = 2500) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }
    const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || '✅'}</span><span>${msg}</span>`;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  function generateQR(text, imgId, size = 200) {
    const img = document.getElementById(imgId);
    if (!img) return;
    const encoded = encodeURIComponent(text);
    img.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encoded}&bgcolor=ffffff&color=000000&qzone=2`;
    img.style.borderRadius = '8px';
    img.style.background = 'white';
    img.style.padding = '8px';
    img.style.display = 'block';
    img.style.margin = '0 auto 8px';
    img.width = size;
    img.height = size;
  }

  function downloadQR(imgId, filename = 'qrcode.png') {
    const img = document.getElementById(imgId);
    if (!img || !img.src) return;
    const a = document.createElement('a');
    a.href = img.src;
    a.download = filename;
    a.target = '_blank';
    a.click();
  }

  function downloadText(text, filename = 'passwords.txt') {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function downloadCSV(rows, filename = 'passwords.csv') {
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
    downloadText(csv, filename);
  }

  function formatEntropy(bits) {
    return bits.toFixed(1) + ' bits';
  }

  function maskPassword(password, show) {
    if (show) return password;
    return '•'.repeat(password.length);
  }

  function formatCrackTime(seconds) {
    if (seconds < 1) return 'Less than 1 second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minutes`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hours`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} days`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} months`;
    return `${Math.round(seconds / 31536000).toLocaleString()} years`;
  }

  function debounce(fn, delay) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), delay);
    };
  }

  function initCopyBtn(btnId, getTextFn) {
    const btn = el(btnId);
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const text = getTextFn();
      if (!text) return;
      const ok = await copyToClipboard(text);
      if (ok) {
        btn.classList.add('copied');
        const orig = btn.innerHTML;
        btn.innerHTML = '✅';
        showToast('Copied!', 'success', 1500);
        setTimeout(() => { btn.classList.remove('copied'); btn.innerHTML = orig; }, 1500);
      } else {
        showToast('Copy failed — please copy manually', 'error');
      }
    });
  }

  function renderStrength(result, barId, textId, crackId) {
    if (!result) return;
    const bar = el(barId);
    if (bar) {
      bar.className = 'strength-bar-inner ' + result.colorClass;
      bar.style.width = result.meterWidth + '%';
    }
    if (textId) {
      const textEl = el(textId);
      if (textEl) {
        textEl.className = 'strength-text ' + result.colorClass;
        textEl.textContent = result.icon + ' ' + result.label;
      }
    }
    if (crackId) setText(crackId, result.crackTime);
  }

  const NAV_LINKS = [
    { href: 'index.html', label: '🔑 Generator' },
    { href: 'passphrase.html', label: '💬 Passphrase' },
    { href: 'strength-test.html', label: '🔬 Strength' },
    { href: 'username.html', label: '👤 Username' },
    { href: 'pin.html', label: '🔢 PIN' },
    { href: 'wifi-password.html', label: '📶 WiFi' },
    { href: 'api-key.html', label: '🔐 API Key' },
    { href: 'breach-check.html', label: '🛡️ Breach Check' },
    { href: 'bulk.html', label: '📦 Bulk' },
    { href: 'history.html', label: '📜 History' }
  ];

  function buildNav(active) {
    const currentPage = active || window.location.pathname.split('/').pop() || 'index.html';
    return `<div class="aurora" aria-hidden="true"></div><nav class="nav">
      <a href="index.html" class="nav-logo" style="text-decoration:none">🔐 <span class="nav-logo-accent">Pass</span>Kit</a>
      <div class="nav-links">
        ${NAV_LINKS.map(l => {
          const isActive = currentPage === l.href || currentPage.endsWith(l.href);
          return `<a href="${l.href}" class="nav-link${isActive ? ' active' : ''}">${l.label}</a>`;
        }).join('')}
      </div>
    </nav>`;
  }

  function buildFooter() {
    return `
<footer class="site-footer" role="contentinfo">
  <div class="footer-inner">

    <!-- Social Proof: Trustpilot + ProductHunt + badges -->
    <div class="footer-trust">

      <div class="trust-brand">
        <div class="trust-brand-name">🔐 <span>Pass</span>Kit.in</div>
        <div class="trust-brand-tagline">Free · Private · Cryptographically Secure · No Server · No Sign-Up</div>
      </div>

      <div class="trust-platforms">
        <!-- Trustpilot widget — replace PASTE_YOUR_BUSINESS_ID with your ID from trustpilot.com/businesses -->
        <div class="trust-platform-block">
          <div class="trust-platform-label">Reviews</div>
          <div
            class="trustpilot-widget"
            data-locale="en-US"
            data-template-id="5419b6a8b0d04a076446a9ad"
            data-businessunit-id="PASTE_YOUR_BUSINESS_ID"
            data-style-height="24px"
            data-style-width="200px"
            data-theme="dark"
            data-min-review-count="0"
          >
            <a class="trust-review-cta" href="https://www.trustpilot.com/review/passkit.in" target="_blank" rel="noopener noreferrer">
              <span class="tp-stars">★★★★★</span>
              <span class="tp-text">Review us on Trustpilot</span>
            </a>
          </div>
          <script async src="//widget.trustpilot.com/bootstrap/v5/tp.widget.bootstrap.min.js"></script>
        </div>

        <!-- ProductHunt badge — replace POST_ID after you submit to producthunt.com -->
        <div class="trust-platform-block">
          <div class="trust-platform-label">Featured on</div>
          <a class="ph-badge" href="https://www.producthunt.com/posts/passkit-in" target="_blank" rel="noopener noreferrer" aria-label="PassKit.in on Product Hunt">
            <svg width="130" height="28" viewBox="0 0 130 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect width="130" height="28" rx="6" fill="#FF6154"/>
              <circle cx="14" cy="14" r="8" fill="white" fill-opacity="0.15"/>
              <path d="M11 10h4a3 3 0 010 6h-4V10zm0 0v8" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <text x="28" y="10" fill="white" font-family="sans-serif" font-size="7" font-weight="600" opacity="0.85">FEATURED ON</text>
              <text x="28" y="21" fill="white" font-family="sans-serif" font-size="11" font-weight="700">Product Hunt</text>
            </svg>
          </a>
        </div>
      </div>

      <div class="trust-badges">
        <span class="trust-badge">🔒 No Server</span>
        <span class="trust-badge">⚡ 100% Free</span>
        <span class="trust-badge">🛡️ No Tracking</span>
        <span class="trust-badge">🔐 crypto.getRandomValues()</span>
        <span class="trust-badge">🌐 Works Offline</span>
      </div>
    </div>

    <!-- Social share -->
    <div class="footer-share">
      <span class="footer-share-label">Share PassKit.in:</span>
      <a class="share-btn share-btn-x" href="https://twitter.com/intent/tweet?text=PassKit.in+%E2%80%93+Free+cryptographically+secure+password+generator.+No+server%2C+no+sign-up.+%F0%9F%94%90&url=https%3A%2F%2Fpasskit.in" target="_blank" rel="noopener noreferrer" aria-label="Share on X / Twitter">𝕏 Twitter</a>
      <a class="share-btn share-btn-reddit" href="https://www.reddit.com/submit?url=https%3A%2F%2Fpasskit.in&title=PassKit.in+%E2%80%93+Free+cryptographically+secure+password+generator+%28no+server%2C+no+account%29" target="_blank" rel="noopener noreferrer" aria-label="Share on Reddit">Reddit</a>
      <a class="share-btn share-btn-wa" href="https://wa.me/?text=Free+cryptographic+password+generator+%E2%80%93+PassKit.in+%F0%9F%94%90+https%3A%2F%2Fpasskit.in" target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">WhatsApp</a>
      <a class="share-btn share-btn-li" href="https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fpasskit.in" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">LinkedIn</a>
      <a class="share-btn share-btn-hn" href="https://news.ycombinator.com/submitlink?u=https%3A%2F%2Fpasskit.in&t=PassKit.in+%E2%80%93+Free+cryptographically+secure+password+generator" target="_blank" rel="noopener noreferrer" aria-label="Share on Hacker News">HackerNews</a>
      <button class="share-btn" id="footer-copy-link" aria-label="Copy link">📋 Copy Link</button>
    </div>

    <!-- 4-col links grid -->
    <div class="footer-links-grid">
      <div class="footer-col">
        <div class="footer-col-title">🔧 Tools</div>
        <a href="index.html">Password Generator</a>
        <a href="passphrase.html">Passphrase Generator</a>
        <a href="strength-test.html">Strength Checker</a>
        <a href="breach-check.html">Breach Checker</a>
        <a href="api-key.html">API Key Generator</a>
        <a href="wifi-password.html">WiFi Password + QR</a>
        <a href="pin.html">PIN Generator</a>
        <a href="username.html">Username Generator</a>
        <a href="bulk.html">Bulk Generator</a>
        <a href="history.html">Password History</a>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">📰 Top Cyber Security News</div>
        <a href="https://blog.talosintelligence.com" target="_blank" rel="noopener noreferrer">Cisco Talos Intelligence</a>
        <a href="https://krebsonsecurity.com" target="_blank" rel="noopener noreferrer">Krebs on Security</a>
        <a href="https://isc.sans.edu" target="_blank" rel="noopener noreferrer">SANS Internet Storm Center</a>
        <a href="https://www.cisa.gov/topics/cybersecurity-best-practices" target="_blank" rel="noopener noreferrer">CISA Best Practices</a>
        <a href="https://security.googleblog.com" target="_blank" rel="noopener noreferrer">Google Security Blog</a>
        <a href="https://blog.mozilla.org/security" target="_blank" rel="noopener noreferrer">Mozilla Security Blog</a>
        <a href="https://therecord.media" target="_blank" rel="noopener noreferrer">The Record by Recorded Future</a>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">🛡️ Security Resources</div>
        <a href="https://haveibeenpwned.com" target="_blank" rel="noopener noreferrer">HaveIBeenPwned</a>
        <a href="https://www.nist.gov/cybersecurity" target="_blank" rel="noopener noreferrer">NIST Cybersecurity</a>
        <a href="https://owasp.org" target="_blank" rel="noopener noreferrer">OWASP Foundation</a>
        <a href="https://www.eff.org/deeplinks" target="_blank" rel="noopener noreferrer">EFF Security Deeplinks</a>
        <a href="https://www.schneier.com" target="_blank" rel="noopener noreferrer">Schneier on Security</a>
        <a href="https://threatpost.com" target="_blank" rel="noopener noreferrer">Threatpost</a>
        <a href="https://www.darkreading.com" target="_blank" rel="noopener noreferrer">Dark Reading</a>
      </div>

      <div class="footer-col">
        <div class="footer-col-title">ℹ️ Why PassKit.in</div>
        <a href="index.html#why">Why Use PassKit?</a>
        <a href="breach-check.html">How Breach Check Works</a>
        <a href="strength-test.html">What is Password Entropy?</a>
        <a href="passphrase.html">Passphrase vs Password</a>
        <a href="api-key.html">UUID v4 Explained</a>
        <a href="wifi-password.html">WiFi QR Code Guide</a>
        <a href="https://github.com" target="_blank" rel="noopener noreferrer">Source Code (GitHub)</a>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="footer-bottom">
      <div class="footer-bottom-main">© 2025 PassKit.in — Free, Private, Cryptographically Secure Password Tools</div>
      <div class="footer-bottom-sub">No cookies · No tracking · No server · No account required · All passwords generated with <code style="font-size:11px;color:var(--accent-bright)">crypto.getRandomValues()</code> in your browser · Never transmitted</div>
    </div>

  </div>
</footer>`;
  }

  function initFooterShare() {
    const copyBtn = document.getElementById('footer-copy-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const ok = await copyToClipboard('https://passkit.in');
        if (ok) {
          copyBtn.textContent = '✅ Copied!';
          setTimeout(() => { copyBtn.innerHTML = '📋 Copy Link'; }, 2000);
        }
      });
    }
  }

  function initParticles() {
    const canvas = document.createElement('canvas');
    canvas.id = 'particle-canvas';
    canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const COUNT=72, MAX_DIST=160, SPEED=0.38;
    const COLORS=[{r:123,g:97,b:255},{r:99,g:179,b:255},{r:0,g:210,b:255},{r:180,g:120,b:255}];
    let W, H, particles;
    function rand(a,b){return a+Math.random()*(b-a);}
    function makeParticle(){
      const c=COLORS[Math.floor(Math.random()*COLORS.length)];
      return{x:rand(0,W),y:rand(0,H),vx:rand(-SPEED,SPEED),vy:rand(-SPEED,SPEED),
             r:rand(1.2,2.8),c,pulse:rand(0,Math.PI*2),pulseSpeed:rand(0.012,0.030)};
    }
    function resize(){
      W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;
      particles=Array.from({length:COUNT},makeParticle);
    }
    function draw(){
      ctx.clearRect(0,0,W,H);
      for(const p of particles){
        p.x+=p.vx;p.y+=p.vy;p.pulse+=p.pulseSpeed;
        if(p.x<-20)p.x=W+20;if(p.x>W+20)p.x=-20;
        if(p.y<-20)p.y=H+20;if(p.y>H+20)p.y=-20;
      }
      for(let i=0;i<particles.length;i++){
        for(let j=i+1;j<particles.length;j++){
          const a=particles[i],b=particles[j];
          const dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy);
          if(dist>MAX_DIST)continue;
          const alpha=(1-dist/MAX_DIST)*0.10;
          const r=Math.floor((a.c.r+b.c.r)/2),g=Math.floor((a.c.g+b.c.g)/2),bv=Math.floor((a.c.b+b.c.b)/2);
          ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
          ctx.strokeStyle=`rgba(${r},${g},${bv},${alpha})`;ctx.lineWidth=0.8;ctx.stroke();
        }
      }
      for(const p of particles){
        const pulse=0.5+0.5*Math.sin(p.pulse),alpha=0.22+pulse*0.28,glow=p.r*(2+pulse*2.5);
        const grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,glow);
        grad.addColorStop(0,`rgba(${p.c.r},${p.c.g},${p.c.b},${alpha})`);
        grad.addColorStop(0.4,`rgba(${p.c.r},${p.c.g},${p.c.b},${alpha*0.3})`);
        grad.addColorStop(1,`rgba(${p.c.r},${p.c.g},${p.c.b},0)`);
        ctx.beginPath();ctx.arc(p.x,p.y,glow,0,Math.PI*2);ctx.fillStyle=grad;ctx.fill();
        ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
        ctx.fillStyle=`rgba(${p.c.r},${p.c.g},${p.c.b},${alpha+0.2})`;ctx.fill();
      }
      requestAnimationFrame(draw);
    }
    window.addEventListener('resize',resize);
    resize();draw();
  }

  function injectNav(active) {
    document.body.insertAdjacentHTML('afterbegin', buildNav(active));
    document.body.insertAdjacentHTML('beforeend', buildFooter());
    initAurora();
    initParticles();
    initFooterRating();
    initFooterShare();
  }

  /* ── Mouse-reactive aurora background ── */
  function initAurora() {
    const aurora = document.querySelector('.aurora');
    if (!aurora) return;

    /* Three extra orbs: two slow-parallax, one cursor-follow */
    const orbs = [
      { cls: 'ao-drift-a', color: 'oklch(0.45 0.26 278 / 0.28)', size: '65vw', top: '-20vh', left: '-10vw', speedX: 0.012, speedY: 0.010 },
      { cls: 'ao-drift-b', color: 'oklch(0.40 0.20 218 / 0.22)', size: '55vw', bottom: '-15vh', right: '-10vw', speedX: -0.010, speedY: -0.012 },
      { cls: 'ao-cursor',  color: 'oklch(0.62 0.28 278 / 0.18)', size: '32vw', speedX: 0, speedY: 0 }
    ];

    const els = orbs.map(o => {
      const el = document.createElement('div');
      el.style.cssText = [
        'position:absolute',
        'border-radius:50%',
        'pointer-events:none',
        `width:${o.size}`,
        `height:${o.size}`,
        `background:radial-gradient(circle,${o.color} 0%,transparent 70%)`,
        'filter:blur(72px)',
        'will-change:transform',
        o.top    ? `top:${o.top}`       : '',
        o.bottom ? `bottom:${o.bottom}` : '',
        o.left   ? `left:${o.left}`     : '',
        o.right  ? `right:${o.right}`   : '',
        o.cls === 'ao-cursor' ? 'left:50%;top:40%;transform:translate(-50%,-50%)' : ''
      ].filter(Boolean).join(';');
      aurora.appendChild(el);
      return el;
    });

    const driftA  = els[0];
    const driftB  = els[1];
    const cursor  = els[2];

    /* Mouse tracking with lerp */
    let tx = 0.5, ty = 0.4;
    let cx = 0.5, cy = 0.4;

    document.addEventListener('mousemove', e => {
      tx = e.clientX / window.innerWidth;
      ty = e.clientY / window.innerHeight;
    });

    /* Touch support */
    document.addEventListener('touchmove', e => {
      if (e.touches[0]) {
        tx = e.touches[0].clientX / window.innerWidth;
        ty = e.touches[0].clientY / window.innerHeight;
      }
    }, { passive: true });

    function lerp(a, b, t) { return a + (b - a) * t; }

    /* Card proximity glow — adds glow to card nearest cursor */
    let cards = [];
    function refreshCards() {
      cards = Array.from(document.querySelectorAll('.settings-card,.tool-card,.info-box,.stats-row .stat-card,.crack-card'));
    }
    refreshCards();
    /* Refresh once after page settles */
    setTimeout(refreshCards, 800);

    (function tick() {
      cx = lerp(cx, tx, 0.055);
      cy = lerp(cy, ty, 0.055);

      /* Cursor orb follows mouse */
      cursor.style.left = (cx * 100) + 'vw';
      cursor.style.top  = (cy * 100) + 'vh';
      cursor.style.transform = 'translate(-50%,-50%)';

      /* Parallax on drift orbs — move slightly opposite to cursor */
      const ox = (cx - 0.5) * 6;
      const oy = (cy - 0.5) * 6;
      driftA.style.transform = `translate(${ox}vw,${oy}vh)`;
      driftB.style.transform = `translate(${-ox}vw,${-oy}vh)`;

      requestAnimationFrame(tick);
    })();
  }

  return {
    el, setText, setHTML, show, hide, val, checked,
    copyToClipboard, showToast, generateQR, downloadQR,
    downloadText, downloadCSV, formatEntropy, maskPassword,
    formatCrackTime, debounce, initCopyBtn, renderStrength,
    buildNav, buildFooter, injectNav, NAV_LINKS
  };
})();
