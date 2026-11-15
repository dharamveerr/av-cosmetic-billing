/* Receipt PDF without any library.
   The receipt is drawn on a canvas (so Hindi and English both look right) and placed on one PDF page.
   Usage: AVPDF.build(doc) returns a Blob (application/pdf). AVPDF.draw(doc) returns the canvas.
   doc = { title, subtitle, stamp, info:[[label,value]], items:[{name,detail,amount}], totals:[[label,value,bold]], footer } */
(function () {
  var FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,"Noto Sans Devanagari","Kohinoor Devanagari","Nirmala UI",sans-serif';
  var W = 420, PAD = 26, SCALE = 2;

  function wrap(ctx, text, maxW) {
    var words = String(text == null ? '' : text).split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      var test = line ? line + ' ' + w : w;
      if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
    });
    if (line) lines.push(line);
    return lines.length ? lines : [''];
  }

  /* Walks down the page. With paint=false it only measures; returns the total height. */
  function layout(ctx, doc, paint) {
    var y = PAD, x0 = PAD, x1 = W - PAD;
    function put(str, x, yy, font, color, align) {
      if (!paint) return;
      ctx.font = font; ctx.fillStyle = color || '#111'; ctx.textAlign = align || 'left'; ctx.fillText(str, x, yy);
    }
    function rule(yy, dashed) {
      if (!paint) return;
      ctx.strokeStyle = '#c8c8c8'; ctx.lineWidth = 1; ctx.setLineDash(dashed ? [4, 3] : []);
      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x1, yy); ctx.stroke(); ctx.setLineDash([]);
    }
    ctx.textBaseline = 'alphabetic';

    ctx.font = '700 20px ' + FONT;
    wrap(ctx, doc.title, W - 2 * PAD).forEach(function (l) { y += 24; put(l, W / 2, y, '700 20px ' + FONT, '#111', 'center'); });
    if (doc.subtitle) { y += 20; put(doc.subtitle, W / 2, y, '400 13px ' + FONT, '#555', 'center'); }
    if (doc.stamp) { y += 24; put(doc.stamp, W / 2, y, '700 15px ' + FONT, '#b3261e', 'center'); }
    y += 14; rule(y, true); y += 8;

    (doc.info || []).forEach(function (r) {
      ctx.font = '600 14px ' + FONT;
      var ls = wrap(ctx, r[1], W - 2 * PAD - 110);
      y += 20;
      put(r[0], x0, y, '400 13px ' + FONT, '#666', 'left');
      ls.forEach(function (l, k) { if (k) y += 18; put(l, x1, y, '600 14px ' + FONT, '#111', 'right'); });
    });
    y += 14; rule(y, false); y += 6;

    (doc.items || []).forEach(function (it) {
      ctx.font = '600 14px ' + FONT;
      var ls = wrap(ctx, it.name, W - 2 * PAD - 100);
      y += 22;
      ls.forEach(function (l, k) { if (k) y += 18; put(l, x0, y, '600 14px ' + FONT, '#111', 'left'); });
      put(it.amount, x1, y - 18 * (ls.length - 1), '600 14px ' + FONT, '#111', 'right');
      if (it.detail) { y += 17; put(it.detail, x0, y, '400 12px ' + FONT, '#666', 'left'); }
      y += 4;
    });
    y += 8; rule(y, false); y += 4;

    (doc.totals || []).forEach(function (r) {
      var big = !!r[2];
      y += big ? 26 : 21;
      put(r[0], x0, y, (big ? '700 16px ' : '400 14px ') + FONT, big ? '#111' : '#444', 'left');
      put(r[1], x1, y, (big ? '700 16px ' : '600 14px ') + FONT, '#111', 'right');
    });
    y += 16; rule(y, true);
    if (doc.footer) { y += 24; put(doc.footer, W / 2, y, '400 13px ' + FONT, '#555', 'center'); }
    return y + PAD;
  }

  function draw(doc) {
    var probe = document.createElement('canvas').getContext('2d');
    var H = Math.ceil(layout(probe, doc, false));
    var c = document.createElement('canvas');
    c.width = W * SCALE; c.height = H * SCALE;
    var ctx = c.getContext('2d');
    ctx.scale(SCALE, SCALE);
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H);
    layout(ctx, doc, true);
    return c;
  }

  function pdfFromJpeg(jpeg, wPx, hPx, wPt, hPt) {
    var enc = new TextEncoder(), parts = [], offs = [], len = 0;
    function push(x) { var b = typeof x === 'string' ? enc.encode(x) : x; parts.push(b); len += b.length; }
    function obj(n, dict, stream) {
      offs[n] = len;
      push(n + ' 0 obj\n' + dict + '\n');
      if (stream) { push('stream\n'); push(stream); push('\nendstream\n'); }
      push('endobj\n');
    }
    function pad10(n) { return ('0000000000' + n).slice(-10); }
    push('%PDF-1.4\n');
    obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
    obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3, '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + wPt + ' ' + hPt + '] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>');
    obj(4, '<< /Type /XObject /Subtype /Image /Width ' + wPx + ' /Height ' + hPx + ' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ' + jpeg.length + ' >>', jpeg);
    var cs = 'q ' + wPt + ' 0 0 ' + hPt + ' 0 0 cm /Im0 Do Q';
    obj(5, '<< /Length ' + cs.length + ' >>', cs);
    var xref = len;
    push('xref\n0 6\n0000000000 65535 f \n');
    for (var n = 1; n <= 5; n++) push(pad10(offs[n]) + ' 00000 n \n');
    push('trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF\n');
    return new Blob(parts, { type: 'application/pdf' });
  }

  function build(doc) {
    var c = draw(doc);
    var b64 = c.toDataURL('image/jpeg', 0.92).split(',')[1];
    var bin = atob(b64), bytes = new Uint8Array(bin.length);
    for (var i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    var wPt = 300, hPt = Math.round(c.height * (wPt / c.width) * 100) / 100;
    return pdfFromJpeg(bytes, c.width, c.height, wPt, hPt);
  }

  window.AVPDF = { build: build, draw: draw };
})();
