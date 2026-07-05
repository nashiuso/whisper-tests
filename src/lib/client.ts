// Copyright (c) 2026, Nashi Uso, (嘘無し).

type Row = [string, string];

const $ = <T extends Element>(sel: string, root: Document | Element = document) =>
  root.querySelector(sel) as T | null;

const text = (v: unknown) => (v == null ? '—' : String(v));

function addGroup(tbody: HTMLTableSectionElement, label: string) {
  const tr = document.createElement('tr');
  tr.className = 'fp-group-label';
  const td = document.createElement('td');
  td.colSpan = 2;
  td.textContent = '— ' + label + ' —';
  tr.appendChild(td);
  tbody.appendChild(tr);
}

function addRow(tbody: HTMLTableSectionElement, k: string, v: unknown) {
  const tr = document.createElement('tr');
  const tdK = document.createElement('td');
  tdK.className = 'key';
  tdK.textContent = k;
  const tdV = document.createElement('td');
  tdV.className = 'val';
  tdV.textContent = text(v);
  tr.appendChild(tdK);
  tr.appendChild(tdV);
  tbody.appendChild(tr);
}

export function initFingerprint() {
  const tbody = $('#fp-body') as HTMLTableSectionElement | null;
  const countEl = $('#fp-count');
  if (!tbody) return;
  tbody.innerHTML = '';

  const nav = navigator as any;
  const scr = window.screen;
  const dpr = window.devicePixelRatio || 1;
  const tzo = -new Date().getTimezoneOffset();
  const intl = Intl.DateTimeFormat().resolvedOptions();

  let rows = 0;
  const push = (k: string, v: unknown) => {
    addRow(tbody, k, v);
    rows++;
  };
  const group = (s: string) => addGroup(tbody, s);

  // browser
  group('browser');
  push('user agent', nav.userAgent);
  push('app version', nav.appVersion);
  push('platform', nav.platform || nav.userAgentData?.platform || '—');
  push('vendor', nav.vendor || '—');
  push('product', nav.product);
  push('product sub', nav.productSub);
  push('build id', nav.buildID || '—');
  push('language', nav.language);
  push('languages', nav.languages ? Array.from(nav.languages).join(', ') : '—');
  push('cookie enabled', nav.cookieEnabled ? 'yes' : 'no');
  push('do not track', nav.doNotTrack || nav.msDoNotTrack || 'unspecified');
  push('webdriver', nav.webdriver ? 'true' : 'false');
  push('pdf viewer enabled', nav.pdfViewerEnabled ? 'yes' : 'no');
  push('onLine', nav.onLine ? 'yes' : 'no');
  push('globalPrivacyControl', (nav as any).globalPrivacyControl ? 'true' : 'false / n/a');

  if (nav.userAgentData) {
    push(
      'ua brands',
      nav.userAgentData.brands?.map((b: any) => `${b.brand} ${b.version}`).join(', ') || '—',
    );
    push('ua mobile', nav.userAgentData.mobile ? 'yes' : 'no');
    nav.userAgentData
      .getHighEntropyValues?.([
        'architecture',
        'bitness',
        'model',
        'platformVersion',
        'fullVersionList',
        'uaFullVersion',
      ])
      .then((he: any) => {
        push('ua arch', he.architecture || '—');
        push('ua bitness', he.bitness || '—');
        push('ua model', he.model || '—');
        push('ua platformVersion', he.platformVersion || '—');
        if (countEl) countEl.textContent = String(rows);
      })
      .catch(() => {});
  }

  // device
  group('device');
  push('hardware concurrency', nav.hardwareConcurrency || '—');
  push('device memory (GB)', nav.deviceMemory ? nav.deviceMemory + ' GB' : '—');
  push('max touch points', nav.maxTouchPoints ?? '—');
  push('touch support', 'ontouchstart' in window ? 'yes' : 'no');
  push('pointer coarse', matchMedia('(pointer: coarse)').matches ? 'yes' : 'no');
  push('hover capable', matchMedia('(hover: hover)').matches ? 'yes' : 'no');

  // screen
  group('screen');
  push('screen', `${scr.width} × ${scr.height}`);
  push('avail screen', `${scr.availWidth} × ${scr.availHeight}`);
  push('color depth', scr.colorDepth + '-bit');
  push('pixel depth', scr.pixelDepth + '-bit');
  push('device pixel ratio', dpr);
  push('viewport inner', `${window.innerWidth} × ${window.innerHeight}`);
  push('viewport outer', `${window.outerWidth} × ${window.outerHeight}`);
  push('screen orientation', screen.orientation?.type || '—');
  push(
    'prefers-color-scheme',
    matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  );
  push(
    'prefers-reduced-motion',
    matchMedia('(prefers-reduced-motion: reduce)').matches ? 'reduce' : 'no-preference',
  );
  push(
    'prefers-contrast',
    matchMedia('(prefers-contrast: more)').matches ? 'more' : 'no-preference',
  );

  // locale
  group('locale / time');
  push('timezone', intl.timeZone);
  push('timezone offset', `${tzo >= 0 ? '+' : ''}${tzo} min`);
  push('locale', intl.locale);
  push('calendar', (intl as any).calendar || '—');
  push('numbering system', (intl as any).numberingSystem || '—');
  push('date sample', new Intl.DateTimeFormat().format(new Date()));

  // network
  group('network');
  const conn = nav.connection || nav.mozConnection || nav.webkitConnection;
  push('connection type', conn?.effectiveType || '—');
  push('downlink (Mbps)', conn?.downlink ?? '—');
  push('rtt (ms)', conn?.rtt ?? '—');
  push('save data', conn?.saveData ? 'true' : 'false');

  // graphics
  group('graphics');
  try {
    const c = document.createElement('canvas');
    const gl = (c.getContext('webgl') ||
      c.getContext('experimental-webgl')) as WebGLRenderingContext | null;
    if (gl) {
      const dbg = gl.getExtension('WEBGL_debug_renderer_info');
      push('webgl vendor', dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'hidden');
      push('webgl renderer', dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'hidden');
      push('webgl version', gl.getParameter(gl.VERSION));
      push('webgl shading', gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
      push('max texture size', gl.getParameter(gl.MAX_TEXTURE_SIZE));
    } else {
      push('webgl', 'not supported');
    }
  } catch {
    push('webgl', 'error');
  }
  push('webgpu', 'gpu' in nav ? 'available' : 'unavailable');

  // memory
  group('memory');
  const pm: any = performance.memory;
  if (pm) {
    push('js heap size limit', (pm.jsHeapSizeLimit / 1048576).toFixed(1) + ' MB');
    push('total js heap size', (pm.totalJSHeapSize / 1048576).toFixed(1) + ' MB');
    push('used js heap size', (pm.usedJSHeapSize / 1048576).toFixed(1) + ' MB');
  } else {
    push('performance.memory', 'not available');
  }

  // capabilities
  group('capabilities');
  push('plugins count', nav.plugins?.length ?? 0);
  push('mime types count', nav.mimeTypes?.length ?? 0);
  push('localStorage', testStorage('localStorage') ? 'yes' : 'no');
  push('sessionStorage', testStorage('sessionStorage') ? 'yes' : 'no');
  push('indexedDB', 'indexedDB' in window ? 'yes' : 'no');
  push('serviceWorker', 'serviceWorker' in nav ? 'yes' : 'no');
  push('webRTC', 'RTCPeerConnection' in window ? 'yes' : 'no');
  push('webAudio', !!(window.AudioContext || (window as any).webkitAudioContext) ? 'yes' : 'no');
  push('webBluetooth', 'bluetooth' in nav ? 'yes' : 'no');
  push('webUSB', 'usb' in nav ? 'yes' : 'no');
  push('webNFC', 'NDEFReader' in window ? 'yes' : 'no');
  push('share api', 'share' in nav ? 'yes' : 'no');
  push('clipboard api', nav.clipboard ? 'yes' : 'no');
  push('credentials api', 'credentials' in nav ? 'yes' : 'no');
  push('wakeLock', 'wakeLock' in nav ? 'yes' : 'no');
  push('vibrate', 'vibrate' in nav ? 'yes' : 'no');
  push('mediaDevices', nav.mediaDevices ? 'yes' : 'no');
  push('speechSynthesis', 'speechSynthesis' in window ? 'yes' : 'no');

  // privacy
  group('privacy');
  push('referrer', document.referrer || '—');
  push('origin', location.origin);
  push('https', location.protocol === 'https:' ? 'yes' : 'no');
  push('notification permission', 'Notification' in window ? Notification.permission : 'n/a');

  // whisper
  group('whisper');
  const now = new Date();
  push(
    'whispered at',
    now.toLocaleString(nav.language, { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  );
  push('epoch ms', String(Date.now()));
  push('performance.now', performance.now().toFixed(2) + ' ms');

  // async battery
  if ('getBattery' in nav) {
    (nav.getBattery as any)()
      .then((b: any) => {
        push('battery level', Math.round(b.level * 100) + '%');
        push('battery charging', b.charging ? 'yes' : 'no');
        if (countEl) countEl.textContent = String(rows);
      })
      .catch(() => {});
  }

  if (countEl) countEl.textContent = String(rows);
}

function testStorage(type: 'localStorage' | 'sessionStorage') {
  try {
    const s = (window as any)[type];
    const k = '__nashi__';
    s.setItem(k, '1');
    s.removeItem(k);
    return true;
  } catch {
    return false;
  }
}

/* ------------------ tests ------------------ */

let lastTest = '';
const outEl = () => document.getElementById('test-output') as HTMLDivElement | null;

function show(head: string, body: string, err = false) {
  const el = outEl();
  if (!el) return;
  el.innerHTML = `<div class="o-head">${escapeHtml(head)}</div>${err ? `<span class="o-err">${escapeHtml(body)}</span>` : escapeHtml(body)}`;
  el.classList.add('visible');
}

function escapeHtml(s: string) {
  return s.replace(
    /[&<>"]/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!,
  );
}

async function pingTest() {
  show('ping / latency', 'pinging…');
  const t0 = performance.now();
  try {
    await fetch('https://www.google.com/favicon.ico?_=' + Date.now(), {
      mode: 'no-cors',
      cache: 'no-store',
    });
    const dt = performance.now() - t0;
    show(
      'ping / latency',
      `→ ~${dt.toFixed(0)} ms\nendpoint: google favicon (no-cors)\ntime: ${new Date().toISOString()}`,
    );
  } catch {
    show('ping / latency', '→ ping failed (blocked / offline)', true);
  }
}

async function dnsTest() {
  show('dns timing', 'measuring…');
  const host = 'https://1.1.1.1/cdn-cgi/trace?_=' + Date.now();
  const s = performance.now();
  try {
    await fetch(host, { cache: 'no-store', mode: 'no-cors' });
    const e = performance.now();
    show(
      'dns timing',
      `→ total fetch: ${(e - s).toFixed(1)} ms\nnote: true dns timing hidden by browser; this is full rtt.`,
    );
  } catch {
    show('dns timing', '→ request blocked', true);
  }
}

async function webrtcTest() {
  if (!('RTCPeerConnection' in window)) {
    show('webrtc leak', '→ WebRTC not supported', true);
    return;
  }
  show('webrtc leak', 'gathering candidates…');
  const ips = new Set<string>();
  const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
  pc.createDataChannel('');
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  pc.onicecandidate = (e) => {
    if (!e.candidate) return;
    const m = e.candidate.candidate.match(/([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9:]+)/i);
    if (m) ips.add(m[1]);
  };
  setTimeout(() => {
    pc.close();
    if (ips.size) show('webrtc leak', `→ candidates:\n${[...ips].join('\n')}`);
    else show('webrtc leak', '→ no local IPs leaked (mDNS / blocked)');
  }, 2200);
}

function storageTest() {
  try {
    const k = '__nashi_test__';
    const s = performance.now();
    localStorage.setItem(k, 'x');
    localStorage.getItem(k);
    localStorage.removeItem(k);
    const e = performance.now();
    show(
      'storage speed',
      `→ localStorage r/w: ${(e - s).toFixed(2)} ms\nindexedDB: ${'indexedDB' in window ? 'available' : 'no'}`,
    );
  } catch {
    show('storage speed', '→ localStorage unavailable', true);
  }
}

async function storageEstimateTest() {
  if (!navigator.storage?.estimate) {
    show('storage estimate', '→ StorageManager.estimate not supported', true);
    return;
  }
  const est = await navigator.storage.estimate();
  const q = est.quota ? (est.quota / 1024 / 1024 / 1024).toFixed(2) + ' GB' : '—';
  const u = est.usage ? (est.usage / 1024 / 1024).toFixed(2) + ' MB' : '—';
  show(
    'storage estimate',
    `→ quota: ${q}\nusage: ${u}\nusageDetails: ${est.usageDetails ? Object.keys(est.usageDetails).join(', ') : 'n/a'}`,
  );
}

async function permissionsTest() {
  if (!navigator.permissions) {
    show('permissions', '→ Permissions API not supported', true);
    return;
  }
  const names = [
    'geolocation',
    'notifications',
    'camera',
    'microphone',
    'clipboard-read',
    'clipboard-write',
    'persistent-storage',
  ] as const;
  let out = '';
  for (const n of names) {
    try {
      const st = await (navigator.permissions as any).query({ name: n });
      out += `${n}: ${st.state}\n`;
    } catch {
      out += `${n}: unsupported\n`;
    }
  }
  show('permissions', out.trim());
}

async function clipboardTest() {
  if (!navigator.clipboard) {
    show('clipboard', '→ clipboard API not available', true);
    return;
  }
  try {
    const t = 'nashi-uso void ' + Date.now().toString(36);
    await navigator.clipboard.writeText(t);
    const r = await navigator.clipboard.readText().catch(() => '(read blocked)');
    show('clipboard', `→ write ok\nwrote: "${t}"\nread: "${r}"`);
  } catch (e: any) {
    show('clipboard', '→ permission denied: ' + e.message, true);
  }
}

function audioTest() {
  try {
    const Ctx = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new Ctx();
    const info = `sampleRate: ${ctx.sampleRate} Hz\nstate: ${ctx.state}\nbaseLatency: ${(ctx.baseLatency || 0).toFixed(4)}s\nmaxChannelCount: ${ctx.destination.maxChannelCount}`;
    ctx.close();
    show('audio context', '→ ' + info);
  } catch {
    show('audio context', '→ audio context not supported', true);
  }
}

function webglTest() {
  const canvas = document.createElement('canvas');
  const gl =
    canvas.getContext('webgl') ||
    (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
  if (!gl) {
    show('webgl info', '→ not supported', true);
    return;
  }
  const dbg = gl.getExtension('WEBGL_debug_renderer_info');
  const vendor = dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : 'hidden';
  const renderer = dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : 'hidden';
  show(
    'webgl info',
    `vendor: ${vendor}\nrenderer: ${renderer}\nversion: ${gl.getParameter(gl.VERSION)}\nshading: ${gl.getParameter(gl.SHADING_LANGUAGE_VERSION)}\nmaxTexture: ${gl.getParameter(gl.MAX_TEXTURE_SIZE)}`,
  );
}

async function webgpuTest() {
  const gpu = (navigator as any).gpu;
  if (!gpu) {
    show('webgpu adapter', '→ WebGPU unavailable', true);
    return;
  }
  try {
    const adapter = await gpu.requestAdapter();
    if (!adapter) {
      show('webgpu adapter', '→ no adapter');
      return;
    }
    const info = (adapter as any).info || {};
    show(
      'webgpu adapter',
      `vendor: ${info.vendor || '—'}\narchitecture: ${info.architecture || '—'}\ndescription: ${info.description || '—'}\nfeatures: ${[...adapter.features].slice(0, 12).join(', ')}${adapter.features.size > 12 ? ' …' : ''}`,
    );
  } catch (e: any) {
    show('webgpu adapter', e.message, true);
  }
}

function canvasTest() {
  const c = document.createElement('canvas');
  c.width = 280;
  c.height = 60;
  const ctx = c.getContext('2d')!;
  ctx.textBaseline = 'top';
  ctx.font = '16px "SF Mono", "Courier New", monospace';
  ctx.fillStyle = '#f5f5f3';
  ctx.fillRect(0, 0, c.width, c.height);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillText('嘘無し Nashi Uso • whisper 2026', 4, 20);
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(120,80,200,0.6)';
  ctx.beginPath();
  ctx.arc(220, 30, 18, 0, Math.PI * 2);
  ctx.fill();
  const url = c.toDataURL();
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (h * 31 + url.charCodeAt(i)) | 0;
  show(
    'canvas fingerprint',
    `→ hash32: ${(h >>> 0).toString(16)}\nlength: ${url.length}\npreview: data:image… (${c.width}×${c.height})`,
  );
}

function fontsTest() {
  const base = ['monospace', 'sans-serif', 'serif'];
  const probe = [
    'Arial',
    'Helvetica',
    'Times New Roman',
    'Courier New',
    'Verdana',
    'Georgia',
    'SF Mono',
    'JetBrains Mono',
    'Menlo',
    'Segoe UI',
    'Roboto',
    'Inter',
    'Fira Code',
    'Consolas',
    'system-ui',
    'Apple Color Emoji',
    'Noto Sans',
    'Hiragino Sans',
    'PingFang SC',
    'Yu Gothic',
    'MS PGothic',
  ];
  const span = document.createElement('span');
  span.style.position = 'absolute';
  span.style.left = '-9999px';
  span.style.fontSize = '72px';
  span.textContent = 'mmmmmmmmmlli_嘘無し';
  document.body.appendChild(span);
  const sizes: Record<string, number> = {};
  base.forEach((b) => {
    span.style.fontFamily = b;
    sizes[b] = span.offsetWidth;
  });
  const found: string[] = [];
  probe.forEach((f) => {
    base.forEach((b) => {
      span.style.fontFamily = `"${f}",${b}`;
      if (span.offsetWidth !== sizes[b]) {
        if (!found.includes(f)) found.push(f);
      }
    });
  });
  span.remove();
  show(
    'fonts probe',
    `→ detected ${found.length} / ${probe.length}:\n${found.join(', ') || 'none'}`,
  );
}

function geolocationTest() {
  if (!navigator.geolocation) {
    show('geolocation', '→ not supported', true);
    return;
  }
  show('geolocation', '→ requesting… (allow/deny)');
  navigator.geolocation.getCurrentPosition(
    (p) =>
      show(
        'geolocation',
        `lat: ${p.coords.latitude.toFixed(5)}\nlon: ${p.coords.longitude.toFixed(5)}\naccuracy: ±${p.coords.accuracy}m`,
      ),
    (e) => show('geolocation', '→ ' + e.message, true),
    { timeout: 7000 },
  );
}

async function batteryTest() {
  const b: any = await (navigator as any).getBattery?.();
  if (!b) {
    show('battery', '→ Battery API unavailable', true);
    return;
  }
  show(
    'battery',
    `level: ${Math.round(b.level * 100)}%\ncharging: ${b.charging ? 'yes' : 'no'}\nchargingTime: ${b.chargingTime}s\ndischargingTime: ${b.dischargingTime}s`,
  );
}

async function mediaDevicesTest() {
  if (!navigator.mediaDevices?.enumerateDevices) {
    show('media devices', '→ not supported', true);
    return;
  }
  try {
    const devs = await navigator.mediaDevices.enumerateDevices();
    const lines = devs.map(
      (d) =>
        `${d.kind.replace('input', '').replace('output', '')}: ${d.label || '(label hidden until permission)'}`,
    );
    show('media devices', `→ ${devs.length} devices\n${lines.join('\n')}`);
  } catch (e: any) {
    show('media devices', e.message, true);
  }
}

function speechTest() {
  const s = window.speechSynthesis;
  if (!s) {
    show('speech synthesis', '→ not supported', true);
    return;
  }
  const voices = s.getVoices();
  const run = () => {
    const v = s.getVoices();
    show(
      'speech synthesis',
      `voices: ${v.length}\n${v
        .slice(0, 18)
        .map((x) => `• ${x.name} [${x.lang}]${x.default ? ' *' : ''}`)
        .join('\n')}${v.length > 18 ? '\n…' : ''}`,
    );
  };
  if (voices.length) run();
  else {
    s.onvoiceschanged = run;
    setTimeout(run, 600);
  }
}

function sensorsTest() {
  const out: string[] = [];
  out.push(`DeviceMotionEvent: ${'DeviceMotionEvent' in window ? 'yes' : 'no'}`);
  out.push(`DeviceOrientationEvent: ${'DeviceOrientationEvent' in window ? 'yes' : 'no'}`);
  // @ts-ignore
  out.push(`AbsoluteOrientationSensor: ${'AbsoluteOrientationSensor' in window ? 'yes' : 'no'}`);
  // @ts-ignore
  out.push(`Accelerometer: ${'Accelerometer' in window ? 'yes' : 'no'}`);
  // @ts-ignore
  out.push(`Gyroscope: ${'Gyroscope' in window ? 'yes' : 'no'}`);
  show('sensors', '→ ' + out.join('\n'));
}

function gamepadTest() {
  const gps = navigator.getGamepads ? navigator.getGamepads() : [];
  const connected = [...gps].filter(Boolean);
  show(
    'gamepad',
    connected.length
      ? connected
          .map((g: any, i) => `#${i} ${g.id}\n  buttons:${g.buttons.length} axes:${g.axes.length}`)
          .join('\n\n')
      : '→ no gamepads connected\npress a button then re-run',
  );
}

async function bluetoothTest() {
  const bt: any = (navigator as any).bluetooth;
  if (!bt) {
    show('bluetooth', '→ Web Bluetooth unavailable', true);
    return;
  }
  show('bluetooth', '→ opening device chooser… (cancel to abort)');
  try {
    const d = await bt.requestDevice({ acceptAllDevices: true });
    show('bluetooth', `→ selected: ${d.name || d.id}`);
  } catch (e: any) {
    show('bluetooth', '→ ' + e.message, true);
  }
}

async function usbTest() {
  const usb: any = (navigator as any).usb;
  if (!usb) {
    show('usb', '→ WebUSB unavailable', true);
    return;
  }
  try {
    const devices = await usb.getDevices();
    show(
      'usb',
      `paired: ${devices.length}\n${devices.map((d: any) => `• ${d.productName || 'unnamed'} (${d.vendorId.toString(16)}:${d.productId.toString(16)})`).join('\n') || 'none — use requestDevice to pair'}`,
    );
  } catch (e: any) {
    show('usb', e.message, true);
  }
}

async function nfcTest() {
  const NDEF: any = (window as any).NDEFReader;
  if (!NDEF) {
    show('nfc', '→ Web NFC unavailable', true);
    return;
  }
  show('nfc', '→ NDEFReader available. Scan requires user gesture + HTTPS.');
}

function vibrationTest() {
  if (!('vibrate' in navigator)) {
    show('vibration', '→ not supported', true);
    return;
  }
  const ok = navigator.vibrate([15, 30, 15]);
  show('vibration', ok ? '→ vibration triggered [15,30,15]ms' : '→ vibrate() returned false');
}

async function wakeLockTest() {
  const wl: any = (navigator as any).wakeLock;
  if (!wl) {
    show('wake lock', '→ Wake Lock API unavailable', true);
    return;
  }
  try {
    const s = await wl.request('screen');
    show('wake lock', '→ screen wake lock acquired. Will release in 6s.');
    setTimeout(() => s.release(), 6000);
  } catch (e: any) {
    show('wake lock', e.message, true);
  }
}

async function fullscreenTest() {
  try {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen().catch(() => {});
      show(
        'fullscreen',
        document.fullscreenElement ? '→ entered fullscreen' : '→ fullscreen blocked (need gesture)',
      );
    } else {
      await document.exitFullscreen();
      show('fullscreen', '→ exited fullscreen');
    }
  } catch (e: any) {
    show('fullscreen', e.message, true);
  }
}

async function screenCaptureTest() {
  const md: any = navigator.mediaDevices;
  if (!md?.getDisplayMedia) {
    show('screen capture', '→ getDisplayMedia unavailable', true);
    return;
  }
  try {
    const stream = await md.getDisplayMedia({ video: true, audio: false });
    show(
      'screen capture',
      `→ capture started: ${stream
        .getVideoTracks()
        .map((t: any) => t.label)
        .join(', ')}\nstopping in 1.2s…`,
    );
    setTimeout(() => stream.getTracks().forEach((t: any) => t.stop()), 1200);
  } catch (e: any) {
    show('screen capture', e.message, true);
  }
}

async function shareTest() {
  if (!('share' in navigator)) {
    show('share api', '→ navigator.share unavailable', true);
    return;
  }
  try {
    await (navigator as any).share({
      title: '嘘無し',
      text: 'whisper + tests — Nashi Uso',
      url: location.href,
    });
    show('share api', '→ share sheet opened / completed');
  } catch (e: any) {
    show('share api', '→ ' + e.message, true);
  }
}

async function idleTest() {
  const IdleDetector: any = (window as any).IdleDetector;
  if (!IdleDetector) {
    show('idle detection', '→ IdleDetector unavailable', true);
    return;
  }
  try {
    // @ts-ignore
    const perm = await IdleDetector.requestPermission();
    show(
      'idle detection',
      `permission: ${perm}\nAPI present – full tracking requires secure context + permission.`,
    );
  } catch (e: any) {
    show('idle detection', e.message, true);
  }
}

function networkScanTest() {
  const c: any = (navigator as any).connection || {};
  show(
    'network scan',
    `effectiveType: ${c.effectiveType || '—'}\ndownlink: ${c.downlink ?? '—'} Mbps\nrtt: ${c.rtt ?? '—'} ms\nsaveData: ${c.saveData ? 'true' : 'false'}\nonLine: ${navigator.onLine}\nconnection: ${navigator.onLine ? 'online' : 'offline'}`,
  );
}

function timezoneDriftTest() {
  const off = new Date().getTimezoneOffset();
  const zones = (Intl as any).supportedValuesOf
    ? (Intl as any).supportedValuesOf('timeZone').slice(0, 5)
    : [];
  const now = Date.now();
  const samples = [
    `offset minutes: ${off}`,
    `offset hours: ${(-off / 60).toFixed(2)}`,
    `Intl timeZone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`,
    `locale string: ${new Date().toLocaleString()}`,
    `ISO: ${new Date().toISOString()}`,
    `epoch: ${now}`,
  ];
  if (zones.length) samples.push(`sample zones: ${zones.join(', ')} …`);
  show('timezone drift', '→ ' + samples.join('\n'));
}

function workersTest() {
  const n = navigator.hardwareConcurrency || 4;
  show('workers bench', `→ hardwareConcurrency: ${n}\nspawning ${n} micro-workers…`);
  let done = 0;
  const t0 = performance.now();
  for (let i = 0; i < n; i++) {
    const blob = new Blob(
      [`postMessage([...Array(2e5)].map((_,k)=>Math.sqrt(k)).reduce((a,b)=>a+b,0))`],
      { type: 'application/javascript' },
    );
    const w = new Worker(URL.createObjectURL(blob));
    w.onmessage = () => {
      done++;
      w.terminate();
      if (done === n) {
        const dt = performance.now() - t0;
        show(
          'workers bench',
          `→ ${n} workers completed\nelapsed: ${dt.toFixed(1)} ms\navg: ${(dt / n).toFixed(1)} ms`,
        );
      }
    };
  }
}

const Tests: Record<string, () => any> = {
  ping: pingTest,
  dns: dnsTest,
  webrtc: webrtcTest,
  storage: storageTest,
  'storage-estimate': storageEstimateTest,
  permissions: permissionsTest,
  clipboard: clipboardTest,
  audio: audioTest,
  webgl: webglTest,
  webgpu: webgpuTest,
  canvas: canvasTest,
  fonts: fontsTest,
  geolocation: geolocationTest,
  battery: batteryTest,
  'media-devices': mediaDevicesTest,
  speech: speechTest,
  sensors: sensorsTest,
  gamepad: gamepadTest,
  bluetooth: bluetoothTest,
  usb: usbTest,
  nfc: nfcTest,
  vibration: vibrationTest,
  'wake-lock': wakeLockTest,
  fullscreen: fullscreenTest,
  'screen-capture': screenCaptureTest,
  share: shareTest,
  idle: idleTest,
  'network-scan': networkScanTest,
  'timezone-drift': timezoneDriftTest,
  workers: workersTest,
};

export function initTests() {
  const grid = document.getElementById('tests-grid');
  if (!grid) return;
  grid.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.test-btn') as HTMLButtonElement | null;
    if (!btn) return;
    run(btn.dataset.test || '');
  });

  // filter
  const filter = document.getElementById('test-filter') as HTMLInputElement | null;
  if (filter) {
    filter.addEventListener('input', () => {
      const q = filter.value.toLowerCase().trim();
      grid.querySelectorAll<HTMLButtonElement>('.test-btn').forEach((b) => {
        const hay = (b.dataset.label + ' ' + b.dataset.test + ' ' + b.dataset.cat).toLowerCase();
        b.style.display = hay.includes(q) ? '' : 'none';
      });
    });
  }

  // keyboard shortcuts
  document.addEventListener('keydown', (ev) => {
    if (ev.key === '/' && (ev.target as HTMLElement)?.tagName !== 'INPUT') {
      ev.preventDefault();
      filter?.focus();
    }
    if (
      ev.key === 'r' &&
      !ev.metaKey &&
      !ev.ctrlKey &&
      document.activeElement?.tagName !== 'INPUT'
    ) {
      if (lastTest) run(lastTest);
    }
    if (
      ev.key === 'c' &&
      !ev.metaKey &&
      !ev.ctrlKey &&
      document.activeElement?.tagName !== 'INPUT'
    ) {
      const o = outEl();
      if (o) {
        o.classList.remove('visible');
        o.textContent = '';
      }
    }
    if (ev.key === 'Escape')
      filter && ((filter.value = ''), filter.dispatchEvent(new Event('input')));
  });
}

async function run(id: string) {
  const fn = Tests[id];
  if (!fn) {
    show(id, 'unknown test', true);
    return;
  }
  lastTest = id;
  document.querySelectorAll('.test-btn.running').forEach((b) => b.classList.remove('running'));
  const btn = document.querySelector(`.test-btn[data-test="${id}"]`);
  btn?.classList.add('running');
  try {
    await fn();
  } catch (e: any) {
    show(id, e?.message || String(e), true);
  } finally {
    setTimeout(() => btn?.classList.remove('running'), 420);
  }
}
