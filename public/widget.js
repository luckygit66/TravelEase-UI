/* TravelsPal embeddable widget — any agency can drop this on their site:
   <script src="https://travelspal.com/widget.js" data-agency-key="THEIR_KEY"></script>
*/
(function () {
  var scriptTag = document.currentScript || (function () {
    var scripts = document.getElementsByTagName('script');
    return scripts[scripts.length - 1];
  })();

  var AGENCY_KEY = scriptTag.getAttribute('data-agency-key');
  var API = scriptTag.getAttribute('data-api-base') || 'https://travelease-api-production.up.railway.app/api';

  if (!AGENCY_KEY) {
    console.error('TravelsPal Widget: missing data-agency-key attribute on script tag');
    return;
  }

  var config = { name: 'TravelsPal', currency: 'inr', brandColor: '#1a2b4a', affiliateMarker: '437825' };
  var token = null;
  var hist = [];
  var busy = false;
  var chipsGone = false;
  var opened = false;

  // ───────────────────────── styles ─────────────────────────
  function injectStyles() {
    if (document.getElementById('tp-widget-styles')) return;
    var style = document.createElement('style');
    style.id = 'tp-widget-styles';
    style.textContent =
      '#tp-widget-root{--tp-brand:#1a2b4a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;}' +
      '#tp-btn{position:fixed;bottom:24px;right:24px;width:58px;height:58px;border-radius:50%;background:var(--tp-brand);color:#fff;border:none;font-size:24px;cursor:pointer;box-shadow:0 4px 20px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;z-index:999998;transition:transform .2s;}' +
      '#tp-btn:hover{transform:scale(1.08);}' +
      '#tp-widget{position:fixed;bottom:96px;right:24px;width:380px;height:560px;background:#fff;border-radius:18px;box-shadow:0 10px 50px rgba(0,0,0,0.2);display:none;flex-direction:column;z-index:999999;overflow:hidden;}' +
      '#tp-widget.open{display:flex;}' +
      '.tp-wh{background:var(--tp-brand);color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;flex-shrink:0;}' +
      '.tp-wh-avatar{width:38px;height:38px;background:rgba(255,255,255,0.18);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}' +
      '.tp-wh-title{font-size:14px;font-weight:700;}' +
      '.tp-wh-sub{font-size:11px;color:rgba(255,255,255,0.65);margin-top:1px;}' +
      '.tp-wh-close{margin-left:auto;background:none;border:none;color:rgba(255,255,255,0.6);font-size:18px;cursor:pointer;padding:4px;line-height:1;}' +
      '.tp-wh-close:hover{color:#fff;}' +
      '.tp-wm{flex:1;overflow-y:auto;padding:14px 14px 4px;display:flex;flex-direction:column;gap:10px;}' +
      '.tp-wmsg{display:flex;flex-direction:column;max-width:86%;}' +
      '.tp-wmsg.user{align-self:flex-end;align-items:flex-end;}' +
      '.tp-wmsg.ai{align-self:flex-start;align-items:flex-start;}' +
      '.tp-wbubble{padding:10px 13px;border-radius:14px;font-size:13.5px;line-height:1.55;word-break:break-word;}' +
      '.tp-wmsg.user .tp-wbubble{background:var(--tp-brand);color:#fff;border-bottom-right-radius:4px;}' +
      '.tp-wmsg.ai .tp-wbubble{background:#f0f2f8;color:#111;border-bottom-left-radius:4px;}' +
      '.tp-wtyping{display:flex;gap:4px;align-items:center;padding:10px 13px;}' +
      '.tp-wdot{width:7px;height:7px;background:#9aa;border-radius:50%;animation:tpbounce 1.2s infinite;}' +
      '.tp-wdot:nth-child(2){animation-delay:.2s;}.tp-wdot:nth-child(3){animation-delay:.4s;}' +
      '@keyframes tpbounce{0%,60%,100%{transform:translateY(0);}30%{transform:translateY(-6px);}}' +
      '.tp-wcard{background:#fff;border:1px solid #dde2ee;border-radius:11px;padding:11px 13px;margin-top:5px;display:flex;align-items:center;justify-content:space-between;gap:8px;}' +
      '.tp-wc-code{font-weight:700;font-size:14px;color:var(--tp-brand);}' +
      '.tp-wc-city{font-size:12px;color:#555;margin-top:1px;}' +
      '.tp-wc-meta{font-size:11px;color:#999;margin-top:3px;}' +
      '.tp-wcard-r{text-align:right;flex-shrink:0;}' +
      '.tp-wbtn{display:inline-block;background:var(--tp-brand);color:#fff;text-decoration:none;padding:5px 12px;border-radius:8px;font-size:11px;font-weight:700;margin-top:7px;white-space:nowrap;}' +
      '.tp-wbtn-row{display:flex;align-items:center;gap:6px;margin-top:7px;}' +
      '.tp-wbtn-row .tp-wbtn{margin-top:0;}' +
      '.tp-wshare{display:flex;align-items:center;justify-content:center;width:26px;height:26px;flex-shrink:0;background:#f0f2f8;border-radius:8px;text-decoration:none;font-size:13px;}' +
      '.tp-wdeal{display:inline-block;background:#fff3e0;color:#e65100;font-size:10px;font-weight:600;padding:2px 7px;border-radius:8px;margin-top:4px;}' +
      '.tp-wvisa{display:inline-block;background:#e8f5e9;color:#2e7d32;font-size:10px;font-weight:600;padding:2px 7px;border-radius:8px;margin-top:4px;margin-left:4px;}' +
      '.tp-wchips{display:flex;flex-wrap:wrap;gap:6px;padding:6px 14px 8px;flex-shrink:0;}' +
      '.tp-wchip{background:#f0f2f8;border:1px solid #dde2ee;border-radius:20px;padding:5px 12px;font-size:12px;cursor:pointer;color:var(--tp-brand);font-weight:500;}' +
      '.tp-wchip:hover{background:#e0e4f0;}' +
      '.tp-winput-row{display:flex;gap:8px;padding:10px 14px 12px;border-top:1px solid #eef0f6;flex-shrink:0;}' +
      '.tp-winput{flex:1;border:1.5px solid #dde2ee;border-radius:10px;padding:9px 13px;font-size:13.5px;outline:none;color:#111;background:#f9fafc;}' +
      '.tp-winput:focus{border-color:var(--tp-brand);background:#fff;}' +
      '.tp-wsend{background:var(--tp-brand);color:#fff;border:none;border-radius:10px;padding:9px 14px;cursor:pointer;font-size:15px;}' +
      '.tp-wsend:disabled{opacity:.4;cursor:not-allowed;}' +
      '.tp-wpowered{text-align:center;font-size:10px;color:#bbb;padding:5px 0 7px;flex-shrink:0;}' +
      '.tp-wpowered a{color:var(--tp-brand);text-decoration:none;font-weight:700;}' +
      '@media (max-width:500px){#tp-widget{width:calc(100vw - 16px);right:8px;bottom:86px;height:75vh;}}';
    document.head.appendChild(style);
  }

  // ───────────────────────── DOM ─────────────────────────
  function injectMarkup() {
    var root = document.createElement('div');
    root.id = 'tp-widget-root';
    root.innerHTML =
      '<button id="tp-btn" title="Chat with our AI assistant">✈️</button>' +
      '<div id="tp-widget">' +
        '<div class="tp-wh">' +
          '<div class="tp-wh-avatar">✈️</div>' +
          '<div><div class="tp-wh-title" id="tp-wh-title"></div><div class="tp-wh-sub">🟢 Online — Ask about flights</div></div>' +
          '<button class="tp-wh-close" id="tp-wh-close">✕</button>' +
        '</div>' +
        '<div class="tp-wm" id="tp-wm"></div>' +
        '<div class="tp-wchips" id="tp-wchips">' +
          '<button class="tp-wchip" data-q="Cheapest flights to Delhi">Cheapest flights to Delhi</button>' +
          '<button class="tp-wchip" data-q="Where can I fly under budget?">Best deals this month</button>' +
          '<button class="tp-wchip" data-q="Cheapest days next month">Cheapest days next month</button>' +
        '</div>' +
        '<div class="tp-winput-row">' +
          '<input id="tp-wi" class="tp-winput" type="text" placeholder="Ask about flights..." />' +
          '<button class="tp-wsend" id="tp-wsend">➤</button>' +
        '</div>' +
        '<div class="tp-wpowered">Powered by <a href="https://travelspal.com" target="_blank" rel="noopener">TravelsPal AI</a></div>' +
      '</div>';
    document.body.appendChild(root);

    document.getElementById('tp-btn').addEventListener('click', toggleWidget);
    document.getElementById('tp-wh-close').addEventListener('click', toggleWidget);
    document.getElementById('tp-wsend').addEventListener('click', send);
    document.getElementById('tp-wi').addEventListener('keydown', function (e) { if (e.key === 'Enter') send(); });
    Array.prototype.forEach.call(document.querySelectorAll('.tp-wchip'), function (btn) {
      btn.addEventListener('click', function () { hideChips(); doSend(btn.getAttribute('data-q')); });
    });
  }

  // ───────────────────────── init ─────────────────────────
  injectStyles();
  injectMarkup();

  fetch(API + '/widget/config?key=' + encodeURIComponent(AGENCY_KEY))
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (c) {
      if (c) {
        config = c;
        document.getElementById('tp-widget-root').style.setProperty('--tp-brand', config.brandColor || '#1a2b4a');
        document.getElementById('tp-wh-title').textContent = config.name + ' AI';
      }
    })
    .catch(function () {});

  fetch(API + '/auth/demo-token')
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (d) { if (d) token = d.token; })
    .catch(function () {});

  // ───────────────────────── widget behaviors ─────────────────────────
  function toggleWidget() {
    var w = document.getElementById('tp-widget');
    var isOpen = w.classList.toggle('open');
    if (isOpen && !opened) {
      opened = true;
      aiMsg('Hi! I\'m your AI travel assistant. 👋\n\nAsk me about flights — prices, cheapest days, or any route.');
    }
    if (isOpen) setTimeout(function () { document.getElementById('tp-wi').focus(); }, 150);
  }

  function openWidget() {
    var w = document.getElementById('tp-widget');
    if (!w.classList.contains('open')) toggleWidget();
  }

  function askQuestion(q) {
    openWidget();
    setTimeout(function () { hideChips(); doSend(q); }, 300);
  }

  window.TravelsPalWidget = { open: openWidget, ask: askQuestion };

  function send() {
    var input = document.getElementById('tp-wi');
    var v = input.value.trim();
    if (!v || busy) return;
    input.value = '';
    hideChips();
    doSend(v);
  }

  function hideChips() {
    if (!chipsGone) {
      var el = document.getElementById('tp-wchips');
      if (el) el.style.display = 'none';
      chipsGone = true;
    }
  }

  async function doSend(text) {
    if (busy) return;
    if (!token) {
      try {
        var r = await fetch(API + '/auth/demo-token');
        var d = await r.json();
        token = d.token;
      } catch (e) { aiMsg('Connecting... please try again in a moment.'); return; }
    }

    busy = true;
    document.getElementById('tp-wsend').disabled = true;
    userMsg(text);
    hist.push({ role: 'user', content: text });
    var t = typingEl();

    try {
      var pr = await fetch(API + '/FlightSearch/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token },
        body: JSON.stringify({ query: text, history: hist.slice(-6) })
      });
      t.remove();

      if (!pr.ok) { aiMsg("I couldn't understand that. Try: \"Cheapest flights to Delhi next month\""); hist.pop(); done(); return; }

      var p = await pr.json();
      var from = p.from, to = p.to;
      var intent = p.searchIntent || (to ? 'route' : 'explore');
      var rawDate = p.date || new Date().toISOString();
      var month = rawDate.slice(0, 7);

      // LLM sometimes swaps from/to on explore queries (e.g. "from Mumbai" → to=BOM, from=null).
      // Only correct this when the user's text actually said "from <city>" — otherwise a genuine
      // destination-only query ("Flights to Bangkok") would get misread as "explore from Bangkok"
      // instead of asking the user for their departure city.
      var saidFrom = /\bfrom\b/i.test(text);
      if (saidFrom && intent === 'explore' && !from && to) { from = to; to = null; }
      if (saidFrom && intent !== 'calendar' && !from && to) { from = to; to = null; intent = 'explore'; }

      if (from && to && from.toUpperCase() === to.toUpperCase()) {
        aiMsg('Origin and destination are the same (' + from + '). Please choose two different cities.');

      } else if (intent === 'alert' || intent === 'remove_alert' || intent === 'list_alerts') {
        aiMsg('🔔 Price alerts are available on our Telegram bot — message @TravelsPalBot (t.me/TravelsPalBot) and ask the same thing there.');

      } else if (intent === 'explore' && from) {
        var url = API + '/FlightAggregator/explore?from=' + from + '&currency=' + config.currency;
        if (p.maxBudget) url += '&maxBudget=' + p.maxBudget;
        if (month) url += '&month=' + month;
        if (p.visaFree) url += '&visaFree=true';
        var er = await fetch(url, { headers: { Authorization: 'Bearer ' + token } });
        var dests = await er.json();
        if (Array.isArray(dests) && dests.length > 0) {
          aiMsg('Here are the best deals from ' + from + ':');
          destCards(dests.slice(0, 4), from);
        } else {
          aiMsg('No deals found from ' + from + ' right now. Try a different month or budget.');
        }

      } else if (intent === 'calendar' && from && to) {
        if (!/^\d{4}-\d{2}$/.test(month)) month = new Date().toISOString().slice(0, 7);
        var cr = await fetch(API + '/FlightAggregator/calendar?from=' + from + '&to=' + to + '&month=' + month + '&currency=' + config.currency, {
          headers: { Authorization: 'Bearer ' + token }
        });
        var days = await cr.json();
        if (Array.isArray(days) && days.length > 0) {
          calendarCards(days, from, to, month);
        } else {
          aiMsg('No calendar data for ' + from + ' → ' + to + ' in ' + month + '. Try a different month.');
        }

      } else if (from && to) {
        var isRound = p.tripType === 'roundtrip' && p.returnDate;
        var bookUrl = aviasalesUrl(from, to, p.date || '', isRound ? p.returnDate : null);
        var tripLabel = isRound ? 'Round Trip' : 'One Way';
        aiMsg(from + ' → ' + to + ' (' + tripLabel + '):');
        routeCard(from, to, p.date || '', bookUrl, isRound ? p.returnDate : null);

      } else {
        aiMsg('Please tell me your departure city. Example: "Delhi to Bangkok" or "Cheapest flights from Mumbai".');
      }

      hist.push({ role: 'assistant', content: 'Results shown for: ' + text });

    } catch (e) {
      t && t.remove();
      aiMsg('Something went wrong. Please try again.');
      hist.pop();
    }
    done();
  }

  function done() { busy = false; document.getElementById('tp-wsend').disabled = false; }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>');
  }

  function scrollBot() { requestAnimationFrame(function () { var m = document.getElementById('tp-wm'); m.scrollTop = m.scrollHeight; }); }

  function userMsg(t) {
    var m = document.getElementById('tp-wm');
    var el = document.createElement('div');
    el.className = 'tp-wmsg user';
    el.innerHTML = '<div class="tp-wbubble">' + esc(t) + '</div>';
    m.appendChild(el); scrollBot();
  }

  function aiMsg(t) {
    var m = document.getElementById('tp-wm');
    var el = document.createElement('div');
    el.className = 'tp-wmsg ai';
    el.innerHTML = '<div class="tp-wbubble">' + esc(t) + '</div>';
    m.appendChild(el); scrollBot();
    return el;
  }

  function typingEl() {
    var m = document.getElementById('tp-wm');
    var el = document.createElement('div');
    el.className = 'tp-wmsg ai';
    el.innerHTML = '<div class="tp-wbubble tp-wtyping"><span class="tp-wdot"></span><span class="tp-wdot"></span><span class="tp-wdot"></span></div>';
    m.appendChild(el); scrollBot();
    return el;
  }

  function aviasalesUrl(from, to, date, returnDate) {
    var parts = (date || '').split('-');
    var rparts = (returnDate || '').split('-');
    var marker = config.affiliateMarker || '437825';
    if (parts.length === 3 && rparts.length === 3) {
      return 'https://www.aviasales.com/search/' + from + parts[2] + parts[1] + to + '1' + rparts[2] + rparts[1] + '?marker=' + marker;
    }
    return parts.length === 3
      ? 'https://www.aviasales.com/search/' + from + parts[2] + parts[1] + to + '1?marker=' + marker
      : 'https://www.aviasales.com/search/' + from + '0101' + to + '1?marker=' + marker;
  }

  function whatsAppShareUrl(text) {
    return 'https://wa.me/?text=' + encodeURIComponent(text);
  }

  function destCards(dests, from) {
    var m = document.getElementById('tp-wm');
    var wrap = document.createElement('div');
    wrap.className = 'tp-wmsg ai';
    dests.forEach(function (d) {
      var url = aviasalesUrl(from, d.code, d.date, null);
      var shareText = '✈️ Check out flights to ' + d.city + ', ' + d.country + ' on ' + d.date + '!\n' + url;
      var stopLabel = d.stops === 0 ? 'Direct' : d.stops + ' stop';
      var badges = '';
      if (d.dealScore === 'amazing') badges += '<span class="tp-wdeal">🔥 Amazing deal</span>';
      else if (d.dealScore === 'good') badges += '<span class="tp-wdeal">✅ Good deal</span>';
      if (d.isVisaFree) badges += '<span class="tp-wvisa">🟢 Visa Free</span>';
      var card = document.createElement('div');
      card.className = 'tp-wcard';
      card.innerHTML =
        '<div>' +
          '<div class="tp-wc-code">' + esc(d.code) + '</div>' +
          '<div class="tp-wc-city">' + esc(d.city) + ', ' + esc(d.country) + '</div>' +
          '<div class="tp-wc-meta">' + esc(stopLabel) + ' · ' + esc(d.airline) + '</div>' +
          badges +
        '</div>' +
        '<div class="tp-wcard-r">' +
          '<div class="tp-wc-meta">' + esc(d.date) + '</div>' +
          '<div class="tp-wbtn-row">' +
            '<a href="' + url + '" target="_blank" rel="noopener" class="tp-wbtn">Check Live Price</a>' +
            '<a href="' + whatsAppShareUrl(shareText) + '" target="_blank" rel="noopener" class="tp-wshare" title="Share on WhatsApp">📤</a>' +
          '</div>' +
        '</div>';
      wrap.appendChild(card);
    });
    m.appendChild(wrap); scrollBot();
  }

  function routeCard(from, to, date, url, returnDate) {
    var m = document.getElementById('tp-wm');
    var el = document.createElement('div');
    el.className = 'tp-wmsg ai';
    var meta = date ? esc(date) : '';
    if (returnDate) meta += ' → ' + esc(returnDate);
    var shareText = '✈️ Check out flights ' + from + ' → ' + to + (date ? ' on ' + date : '') + '!\n' + url;
    el.innerHTML =
      '<div class="tp-wcard">' +
        '<div>' +
          '<div class="tp-wc-code">' + esc(from) + ' → ' + esc(to) + '</div>' +
          '<div class="tp-wc-city">Live prices on Aviasales</div>' +
          (meta ? '<div class="tp-wc-meta">' + meta + '</div>' : '') +
        '</div>' +
        '<div class="tp-wcard-r">' +
          '<div class="tp-wbtn-row">' +
            '<a href="' + url + '" target="_blank" rel="noopener" class="tp-wbtn">Check Live Price</a>' +
            '<a href="' + whatsAppShareUrl(shareText) + '" target="_blank" rel="noopener" class="tp-wshare" title="Share on WhatsApp">📤</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    m.appendChild(el); scrollBot();
  }

  function calendarCards(days, from, to, month) {
    // Still rank internally by price to surface the best days first — just don't display
    // the number itself, since it can drift noticeably from TravelPayouts' live price.
    var top5 = days.slice().sort(function (a, b) { return a.price - b.price; }).slice(0, 5);
    var cheapest = top5[0];
    aiMsg('📅 ' + from + ' → ' + to + ' · ' + month + '\n🔥 Best day to fly: ' + cheapest.date);
    var m = document.getElementById('tp-wm');
    var wrap = document.createElement('div');
    wrap.className = 'tp-wmsg ai';
    top5.forEach(function (d) {
      var url = aviasalesUrl(from, to, d.date, null);
      var stopLabel = d.stops === 0 ? 'Direct' : d.stops + ' stop';
      var card = document.createElement('div');
      card.className = 'tp-wcard';
      card.innerHTML =
        '<div>' +
          '<div class="tp-wc-code">' + esc(d.date) + '</div>' +
          '<div class="tp-wc-meta">' + esc(stopLabel) + ' · ' + esc(d.airline) + '</div>' +
        '</div>' +
        '<div class="tp-wcard-r">' +
          '<a href="' + url + '" target="_blank" rel="noopener" class="tp-wbtn">Check Live Price</a>' +
        '</div>';
      wrap.appendChild(card);
    });
    m.appendChild(wrap); scrollBot();
  }
})();
