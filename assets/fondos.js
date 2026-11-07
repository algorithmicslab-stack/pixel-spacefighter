// Fondos espaciales con parallax (capas que se mueven a distinta velocidad).
// Imágenes CC0 de OpenGameArt.org, ver assets/fondos/LEEME.txt
// Uso: await FONDOS.load(clave); FONDOS.draw(ctx, clave, segundos, ancho, alto);
window.FONDOS = (() => {
  const base = 'assets/fondos/';
  // speed: px por segundo · fit: escalar al alto del lienzo · single: imagen suelta (planeta)
  const L = (src, speed, opt = {}) => ({ src: base + src, speed, ...opt });
  // capas transparentes de estrellas (Parallax80/100 y BackdropBlack… son opacas: solo sirven de base)
  const STARS = [L('parallax-largo/Parallax60.png', 10), L('parallax-largo/BackdropBlackLittleSparkTransparent.png', 24)];
  const LIST = {
    estrellas: { name: '✨ Estrellas', procedural: true, layers: [] },
    planetas: { name: '🪐 Planetas', color: '#1b0f22', layers: [
      L('parallax-capas/parallax-space-backgound.png', 3, { fit: true }),
      L('parallax-capas/parallax-space-stars.png', 8, { fit: true }),
      L('parallax-capas/parallax-space-far-planets.png', 14, { fit: true }),
      L('parallax-capas/parallax-space-ring-planet.png', 24, { single: true, x: 0.72, y: 0.12, fit: true, ref: 160 }),
      L('parallax-capas/parallax-space-big-planet.png', 36, { single: true, x: 0.22, y: 0.4, fit: true, ref: 160 }),
    ]},
    espacio: { name: '🌌 Espacio profundo', color: '#000', layers: [
      L('parallax-largo/Parallax100.png', 3), ...STARS] },
    espacioRojo: { name: '🔴 Espacio rojizo', color: '#000', layers: [
      L('parallax-largo/Parallax80.png', 3), ...STARS] },
    nebulosaAzul: { name: '🔵 Nebulosa azul', layers: [L('nebulosas/512x512_blue_nebula_2.png', 3), ...STARS] },
    nebulosaVerde: { name: '🟢 Nebulosa verde', layers: [L('nebulosas/512x512_green_nebula_1.png', 3), ...STARS] },
    nebulosaMorada: { name: '🟣 Nebulosa morada', layers: [L('nebulosas/512x512_purple_nebula_1.png', 3), ...STARS] },
  };

  const cache = {};
  function img(src) {
    return cache[src] ||= new Promise((ok, fail) => {
      const i = new Image(); i.onload = () => ok(i); i.onerror = fail; i.src = src;
    });
  }
  const loaded = {};
  async function load(key) {
    const bg = LIST[key];
    if (!bg) return;
    await Promise.all(bg.layers.map(async l => { l.img = await img(l.src); }));
    loaded[key] = true;
  }

  // estrellas generadas (el fondo original del creador)
  const starSets = new WeakMap();
  function drawProcedural(ctx, t, w, h) {
    let s = starSets.get(ctx.canvas);
    if (!s || s.w !== w || s.h !== h) {
      s = { w, h, list: Array.from({ length: Math.round(w * h / 1200) }, () => ({
        x: Math.random() * w, y: Math.random() * h, v: 12 + Math.random() * 70, s: Math.random() < 0.2 ? 2 : 1 })) };
      starSets.set(ctx.canvas, s);
    }
    const g = ctx.createRadialGradient(w * 0.3, h * 0.2, 0, w * 0.3, h * 0.2, Math.max(w, h) * 0.8);
    g.addColorStop(0, '#23285a'); g.addColorStop(1, '#0b0d1a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (const st of s.list) {
      const x = ((st.x - t * st.v) % w + w) % w;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + st.v / 140})`;
      ctx.fillRect(x | 0, st.y | 0, st.s, st.s);
    }
  }

  function draw(ctx, key, t, w, h) {
    const bg = LIST[key] || LIST.estrellas;
    ctx.imageSmoothingEnabled = false;
    if (bg.procedural || !loaded[key]) { drawProcedural(ctx, t, w, h); return; }
    ctx.fillStyle = bg.color || '#000'; ctx.fillRect(0, 0, w, h);
    for (const l of bg.layers) {
      const im = l.img;
      // las capas "fit" se escalan al alto; las sueltas usan la misma escala que su fondo (ref)
      const sc = l.fit ? h / (l.ref || im.height) : 1;
      const iw = im.width * sc, ih = im.height * sc;
      if (l.single) {
        const span = w + iw;
        const x = ((l.x * w - t * l.speed) % span + span) % span - iw;
        ctx.drawImage(im, Math.round(x), Math.round(l.y * h), Math.round(iw), Math.round(ih));
        continue;
      }
      const ox = -((t * l.speed) % iw + iw) % iw;
      for (let y = 0; y < h; y += ih)
        for (let x = ox; x < w; x += iw) ctx.drawImage(im, Math.round(x), Math.round(y), Math.ceil(iw), Math.ceil(ih));
    }
  }

  return { list: LIST, load, draw };
})();
