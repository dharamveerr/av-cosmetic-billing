/* Small QR code maker (no libraries). Byte mode, error correction level M, versions 1 to 10.
   Based on the standard QR algorithm (Reed-Solomon over GF(256), 8 masks, format and version bits).
   Use: AVQR.canvas(text, pixelSize) returns a <canvas> element. */
(function () {
  var ECC_PER_BLOCK = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26];   // level M, versions 1..10
  var NUM_BLOCKS = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5];                // level M, versions 1..10
  var FORMAT_M = 0;                                                    // format bits for level M

  function rawModules(ver) {
    var r = (16 * ver + 128) * ver + 64;
    if (ver >= 2) {
      var n = Math.floor(ver / 7) + 2;
      r -= (25 * n - 10) * n - 55;
      if (ver >= 7) r -= 36;
    }
    return r;
  }
  function dataCodewords(ver) {
    return Math.floor(rawModules(ver) / 8) - ECC_PER_BLOCK[ver] * NUM_BLOCKS[ver];
  }
  function utf8(str) {
    var s = unescape(encodeURIComponent(str)), out = [];
    for (var i = 0; i < s.length; i++) out.push(s.charCodeAt(i));
    return out;
  }
  function gfMul(x, y) {
    var z = 0;
    for (var i = 7; i >= 0; i--) { z = (z << 1) ^ ((z >>> 7) * 0x11D); z ^= ((y >>> i) & 1) * x; }
    return z;
  }
  function rsDivisor(degree) {
    var res = [], i, j, root = 1;
    for (i = 0; i < degree - 1; i++) res.push(0);
    res.push(1);
    for (i = 0; i < degree; i++) {
      for (j = 0; j < res.length; j++) {
        res[j] = gfMul(res[j], root);
        if (j + 1 < res.length) res[j] ^= res[j + 1];
      }
      root = gfMul(root, 2);
    }
    return res;
  }
  function rsRemainder(data, div) {
    var res = div.map(function () { return 0; });
    data.forEach(function (b) {
      var f = b ^ res.shift();
      res.push(0);
      div.forEach(function (c, i) { res[i] ^= gfMul(c, f); });
    });
    return res;
  }
  function bit(x, i) { return ((x >>> i) & 1) !== 0; }

  function build(text) {
    var bytes = utf8(text), ver, cap, bits = [];
    for (ver = 1; ver <= 10; ver++) {
      var need = 4 + (ver < 10 ? 8 : 16) + bytes.length * 8;
      if (need <= dataCodewords(ver) * 8) break;
    }
    if (ver > 10) throw new Error('QR text too long');
    cap = dataCodewords(ver) * 8;
    function put(val, len) { for (var i = len - 1; i >= 0; i--) bits.push((val >>> i) & 1); }
    put(4, 4);
    put(bytes.length, ver < 10 ? 8 : 16);
    bytes.forEach(function (b) { put(b, 8); });
    put(0, Math.min(4, cap - bits.length));
    put(0, (8 - bits.length % 8) % 8);
    for (var pad = 0xEC; bits.length < cap; pad ^= 0xEC ^ 0x11) put(pad, 8);
    var data = [];
    for (var i = 0; i < bits.length; i += 8) {
      var v = 0;
      for (var k = 0; k < 8; k++) v = (v << 1) | bits[i + k];
      data.push(v);
    }

    /* error correction and interleave */
    var nb = NUM_BLOCKS[ver], eccLen = ECC_PER_BLOCK[ver], raw = Math.floor(rawModules(ver) / 8);
    var shortBlocks = nb - raw % nb, shortLen = Math.floor(raw / nb), blocks = [], div = rsDivisor(eccLen), off = 0;
    for (i = 0; i < nb; i++) {
      var dat = data.slice(off, off + shortLen - eccLen + (i < shortBlocks ? 0 : 1));
      off += dat.length;
      var ecc = rsRemainder(dat, div);
      if (i < shortBlocks) dat.push(0);
      blocks.push(dat.concat(ecc));
    }
    var all = [];
    for (i = 0; i < blocks[0].length; i++) {
      blocks.forEach(function (blk, j) { if (i !== shortLen - eccLen || j >= shortBlocks) all.push(blk[i]); });
    }

    /* matrix */
    var size = ver * 4 + 17, m = [], fn = [], x, y;
    for (y = 0; y < size; y++) { m.push([]); fn.push([]); for (x = 0; x < size; x++) { m[y].push(false); fn[y].push(false); } }
    function setFn(px, py, dark) { m[py][px] = dark; fn[py][px] = true; }
    function finder(cx, cy) {
      for (var dy = -4; dy <= 4; dy++) for (var dx = -4; dx <= 4; dx++) {
        var d = Math.max(Math.abs(dx), Math.abs(dy)), xx = cx + dx, yy = cy + dy;
        if (xx >= 0 && xx < size && yy >= 0 && yy < size) setFn(xx, yy, d !== 2 && d !== 4);
      }
    }
    function align(cx, cy) {
      for (var dy = -2; dy <= 2; dy++) for (var dx = -2; dx <= 2; dx++) setFn(cx + dx, cy + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
    }
    for (i = 0; i < size; i++) { setFn(6, i, i % 2 === 0); setFn(i, 6, i % 2 === 0); }
    finder(3, 3); finder(size - 4, 3); finder(3, size - 4);
    var na = ver === 1 ? 0 : Math.floor(ver / 7) + 2, pos = [];
    if (na) {
      var step = Math.ceil((ver * 4 + 4) / (na * 2 - 2)) * 2;
      pos = [6];
      for (var p = size - 7; pos.length < na; p -= step) pos.splice(1, 0, p);
    }
    for (i = 0; i < na; i++) for (var j = 0; j < na; j++) {
      if ((i === 0 && j === 0) || (i === 0 && j === na - 1) || (i === na - 1 && j === 0)) continue;
      align(pos[i], pos[j]);
    }
    function formatBits(mask) {
      var d = (FORMAT_M << 3) | mask, rem = d;
      for (var q = 0; q < 10; q++) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
      var b = ((d << 10) | rem) ^ 0x5412, q2;
      for (q2 = 0; q2 <= 5; q2++) setFn(8, q2, bit(b, q2));
      setFn(8, 7, bit(b, 6)); setFn(8, 8, bit(b, 7)); setFn(7, 8, bit(b, 8));
      for (q2 = 9; q2 < 15; q2++) setFn(14 - q2, 8, bit(b, q2));
      for (q2 = 0; q2 < 8; q2++) setFn(size - 1 - q2, 8, bit(b, q2));
      for (q2 = 8; q2 < 15; q2++) setFn(8, size - 15 + q2, bit(b, q2));
      setFn(8, size - 8, true);
    }
    formatBits(0);
    if (ver >= 7) {
      var rem = ver;
      for (i = 0; i < 12; i++) rem = (rem << 1) ^ ((rem >>> 11) * 0x1F25);
      var vb = (ver << 12) | rem;
      for (i = 0; i < 18; i++) {
        var a = size - 11 + i % 3, b2 = Math.floor(i / 3), c = bit(vb, i);
        setFn(a, b2, c); setFn(b2, a, c);
      }
    }
    /* place data bits in the zigzag order */
    var bi = 0;
    for (var right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5;
      for (var vert = 0; vert < size; vert++) for (var jj = 0; jj < 2; jj++) {
        var xx = right - jj, up = ((right + 1) & 2) === 0, yy = up ? size - 1 - vert : vert;
        if (!fn[yy][xx] && bi < all.length * 8) { m[yy][xx] = bit(all[bi >>> 3], 7 - (bi & 7)); bi++; }
      }
    }
    /* choose the mask with the lowest penalty */
    function applyMask(mask) {
      for (var yy = 0; yy < size; yy++) for (var xx = 0; xx < size; xx++) {
        var inv;
        switch (mask) {
          case 0: inv = (xx + yy) % 2 === 0; break;
          case 1: inv = yy % 2 === 0; break;
          case 2: inv = xx % 3 === 0; break;
          case 3: inv = (xx + yy) % 3 === 0; break;
          case 4: inv = (Math.floor(xx / 3) + Math.floor(yy / 2)) % 2 === 0; break;
          case 5: inv = xx * yy % 2 + xx * yy % 3 === 0; break;
          case 6: inv = (xx * yy % 2 + xx * yy % 3) % 2 === 0; break;
          default: inv = ((xx + yy) % 2 + xx * yy % 3) % 2 === 0;
        }
        if (inv && !fn[yy][xx]) m[yy][xx] = !m[yy][xx];
      }
    }
    function penalty() {
      var score = 0, r, c, run, dark = 0;
      for (r = 0; r < size; r++) {
        run = 1;
        for (c = 1; c < size; c++) { if (m[r][c] === m[r][c - 1]) { run++; if (run === 5) score += 3; else if (run > 5) score++; } else run = 1; }
      }
      for (c = 0; c < size; c++) {
        run = 1;
        for (r = 1; r < size; r++) { if (m[r][c] === m[r - 1][c]) { run++; if (run === 5) score += 3; else if (run > 5) score++; } else run = 1; }
      }
      for (r = 0; r < size - 1; r++) for (c = 0; c < size - 1; c++) {
        var v = m[r][c];
        if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
      }
      for (r = 0; r < size; r++) for (c = 0; c < size; c++) if (m[r][c]) dark++;
      score += Math.floor(Math.abs(dark * 20 - size * size * 10) / (size * size)) * 10;
      return score;
    }
    var best = 0, bestScore = Infinity;
    for (var mk = 0; mk < 8; mk++) {
      applyMask(mk); formatBits(mk);
      var sc = penalty();
      if (sc < bestScore) { bestScore = sc; best = mk; }
      applyMask(mk);   // undo
    }
    applyMask(best); formatBits(best);
    return m;
  }

  /* Returns a canvas with a 4-module quiet zone. size = wanted width in pixels. */
  function canvas(text, size) {
    var m = build(text), n = m.length, quiet = 4, scale = Math.max(1, Math.floor(size / (n + quiet * 2)));
    var cv = document.createElement('canvas'), px = (n + quiet * 2) * scale;
    cv.width = cv.height = px;
    var g = cv.getContext('2d');
    g.fillStyle = '#fff'; g.fillRect(0, 0, px, px);
    g.fillStyle = '#000';
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) if (m[y][x]) g.fillRect((x + quiet) * scale, (y + quiet) * scale, scale, scale);
    return cv;
  }
  window.AVQR = { canvas: canvas, matrix: build };
})();
