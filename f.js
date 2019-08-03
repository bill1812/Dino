// f.js
(function () {
  var i = null;

  function k() {
    return Function.prototype.call.apply(Array.prototype.slice, arguments);
  }

  function l(a, b) {
    var c = k(arguments, 2);
    return function () {
      return b.apply(a, c);
    };
  }

  function m(a, b) {
    var c = new n(b);
    for (c.f = [a]; c.f.length;) {
      var e = c, d = c.f.shift();
      e.g(d);
      for (d = d.firstChild; d; d = d.nextSibling) {
        d.nodeType == 1 && e.f.push(d);
      }
    }
  }

  function n(a) {
    this.g = a;
  }

  function o(a) {
    a.style.display = "";
  }

  function p(a) {
    a.style.display = "none";
  }
  var q = ":", r = /\s*;\s*/;

  function s() {
    this.i.apply(this, arguments);
  }

  s.prototype.i = function (a, b) {
    if (!this.a) {
      this.a = {};
    }
    if (b) {
      var c = this.a, e = b.a, d;
      for (d in e) {
        c[d] = e[d];
      }
    } else {
      for (c in d = this.a, e = t, e) {
        d[c] = e[c];
      }
    }
    this.a.$this = a;
    this.a.$context = this;
    this.d = typeof a != "undefined" && a != i ? a : "";
    if (!b) {
      this.a.$top = this.d;
    }
  };
  var t = { $default: i }, u = [];

  function v(a) {
    for (var b in a.a) {
      delete a.a[b];
    }
    a.d = i;
    u.push(a);
  }

  function w(a, b, c) {
    try {
      return b.call(c, a.a, a.d);
    } catch (e) {
      return t.$default;
    }
  }

  function x(a, b, c, e) {
    if (u.length > 0) {
      var d = u.pop();
      s.call(d, b, a);
      a = d;
    } else {
      a = new s(b, a);
    }
    a.a.$index = c;
    a.a.$count = e;
    return a;
  }
  var y = "a_", z = "b_", A = "with (a_) with (b_) return ", D = {};

  function E(a) {
    if (!D[a]) {
      try {
        D[a] = new Function(y, z, A + a);
      } catch (b) {}
    }
    return D[a];
  }

  function F(a) {
    for (var b = [], a = a.split(r), c = 0, e = a.length; c < e; ++c) {
      var d = a[c].indexOf(q);
      if (!(d < 0)) {
        var f;
        f = a[c].substr(0, d).replace(/^\s+/, "").replace(/\s+$/, "");
        d = E(a[c].substr(d + 1));
        b.push(f, d);
      }
    }
    return b;
  }

  var G = "jsinstance", H = "jsts", I = "*", J = "div", K = "id";

  function L() {}
  var M = 0, N = { 0: {} }, P = {}, Q = {}, R = [];

  function S(a) {
    a.__jstcache || m(a, function (a) { T(a); });
  }

  var U = [
    ["jsselect", E],
    ["jsdisplay", E],
    ["jsvalues", F],
    ["jsvars", F],
    ["jseval", function (a) {
      for (var b = [], a = a.split(r), c = 0, e = a.length; c < e; ++c) {
        if (a[c]) {
          var d = E(a[c]);
          b.push(d);
        }
        return b;
      }
    }],
    ["transclude", function (a) { return a; }],
    ["jscontent", E],
    ["jsskip", E]
  ];

  function T(a) {
    if (a.__jstcache) {
      return a.__jstcache;
    }
    var b = a.getAttribute("jstcache");
    if (b != i) {
      return a.__jstcache = N[b];
    }
    for (var b = R.length = 0, c = U.length; b < c; ++b) {
      var e = U[b][0], d = a.getAttribute(e);
      Q[e] = d;
      d != i && R.push(e + "=" + d);
    }
    if (R.length == 0) {
      return a.setAttribute("jstcache", "0"), a.__jstcache = N[0];
    }
    var f = R.join("&");
    if (b = P[f]) {
      return a.setAttribute("jstcache", b), a.__jstcache = N[b];
    }
    for (var h = {}, b = 0, c = U.length; b < c; ++b) {
      var d = U[b], e = d[0], g = d[1], d = Q[e];
      d != i && (h[e] = g(d));
    }
    b = "" + ++M;
    a.setAttribute("jstcache", b);
    N[b] = h;
    P[f] = b;
    return a.__jstcache = h;
  }

  function V(a, b) {
    a.h.push(b);
    a.k.push(0);
  }

  function W(a) {
    return a.c.length ? a.c.pop() : [];
  }

  L.prototype.e = function (a, b) {
    var c = X(b), e = c.transclude;
    if (e) {
      (c = Y(e)) ? (b.parentNode.replaceChild(c, b), e = W(this), e.push(this.e, a, c), V(this, e)) : b.parentNode.removeChild(b);
    } else if (c = c.jsselect) {
      var c = w(a, c, b), d = b.getAttribute(G), f = !1;
      d && (d.charAt(0) == I ? (d = parseInt(d.substr(1), 10), f = !0) : d = parseInt(d, 10));
      var h = c != i && typeof c == "object" && typeof c.length == "number";
      var e = h ? c.length : 1;
      var g = h && e == 0;
      if (h) {
        if (g) {
          d ? b.parentNode.removeChild(b) : (b.setAttribute(G, "*0"), p(b));
        } else if (o(b), d === i || d === "" || f && d < e - 1) {
          f = W(this);
          d = d || 0;
          for (h = e - 1; d < h; ++d) {
            var j = b.cloneNode(!0);
            b.parentNode.insertBefore(j, b);
            Z(j, c, d);
            g = x(a, c[d], d, e);
            f.push(this.b, g, j, v, g, i)
          }
          Z(b, c, d);
          g = x(a, c[d], d, e);
          f.push(this.b, g, b, v, g, i);
          V(this, f);
        } else {
          d < e ? (f = c[d], Z(b, c, d), g = x(a, f, d, e), f = W(this), f.push(this.b, g, b, v, g, i), V(this, f)) : b.parentNode.removeChild(b);
        }
      } else {
        c == i ? p(b) : (o(b), g = x(a, c, 0, 1), f = W(this), f.push(this.b, g, b, v, g, i), V(this, f));
      }
    } else {
      this.b(a, b);
    }
  };

  L.prototype.b = function (a, b) {

    var c = X(b), e = c.jsdisplay;

    if (e) {
      if (!w(a, e, b)) {
        p(b);
        return;
      }
      o(b);
    }

    if (e = c.jsvars) {
      for (var d = 0, f = e.length; d < f; d += 2) {
        var h = e[d];
        var g = w(a, e[d + 1], b);
        a.a[h] = g;
      }
    }

    if (e = c.jsvalues) {
      d = 0;
      for (f = e.length; d < f; d += 2) {
        if (g = e[d], h = w(a, e[d + 1], b), g.charAt(0) == "$") {
          a.a[g] = h;
        } else if (g.charAt(0) == ".") {
          for (var g = g.substr(1).split("."), j = b, O = g.length, B = 0, $ = O - 1; B < $; ++B) {
            var C = g[B];
            j[C] || (j[C] = {});
            j = j[C];
          }
          j[g[O - 1]] = h;
        } else {
          g && (typeof h == "boolean" ? h ? b.setAttribute(g, g) : b.removeAttribute(g) : b.setAttribute(g, "" + h));
        }
      }
    }

    if (e = c.jseval) {
      d = 0;
      for (f = e.length; d < f; ++d) {
        w(a, e[d], b);
      }
    }

    e = c.jsskip;

    if (!e || !w(a, e, b)) {
      if (c = c.jscontent) {
        if (c = "" + w(a, c, b), b.innerHTML != c) {
          for (; b.firstChild;) {
            e = b.firstChild, e.parentNode.removeChild(e);
          }
          b.appendChild(this.j.createTextNode(c));
        }
      } else {
        c = W(this);
        for (e = b.firstChild; e; e = e.nextSibling) {
          e.nodeType == 1 && c.push(this.e, a, e);
        }
        c.length && V(this, c);
      }
    }
  };

  function X(a) {
    if (a.__jstcache) {
      return a.__jstcache;
    }
    var b = a.getAttribute("jstcache");
    if (b) {
      return a.__jstcache = N[b];
    }
    return T(a)
  }

  function Y(a, b) {

    var c = document;

    if (b) {
      var e = c.getElementById(a);

      if (!e) {
        var e = b(), d = H, f = c.getElementById(d);

        if (!f) {
          f = c.createElement(J), f.id = d, p(f), f.style.position = "absolute", c.body.appendChild(f);
        }

        d = c.createElement(J);
        f.appendChild(d);
        d.innerHTML = e;
        e = c.getElementById(a);
      }
      c = e;
    } else {
      c = c.getElementById(a);
    }
    return c ? (S(c), c = c.cloneNode(!0), c.removeAttribute(K), c) : i;
  }

  function Z(a, b, c) {
    c == b.length - 1 ? a.setAttribute(G, I + c) : a.setAttribute(G, "" + c);
  }

  window.jstGetTemplate = Y;
  window.JsEvalContext = s;
  window.jstProcess = function (a, b) {
    var c = new L;
    S(b);
    c.j = b ? b.nodeType == 9 ? b : b.ownerDocument || document : document;
    var e = l(c, c.e, a, b);
    var d = c.h = [];
    var f = c.k = [];
    c.c = [];
    e();
    for (var h, g, j; d.length;) {
      h = d[d.length - 1], e = f[f.length - 1], e >= h.length ? (e = c, g = d.pop(), g.length = 0, e.c.push(g), f.pop()) : (g = h[e++], j = h[e++], h = h[e++], f[f.length - 1] = e, g.call(c, j, h));
    }
  };
})();
