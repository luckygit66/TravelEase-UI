import React from 'react';
import './CalendarView.css';

const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];
const DAY_NAMES = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

function getOrdinal(n) {
  const v = n % 100;
  const s = ['th', 'st', 'nd', 'rd'];
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// Extract day-of-month from any reasonable date string format — format-independent
function extractDayNumber(raw) {
  if (!raw) return null;
  // YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD  →  last segment
  let m = raw.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (m) return parseInt(m[3], 10);
  // DD-MM-YYYY, DD/MM/YYYY  →  first segment
  m = raw.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (m) return parseInt(m[1], 10);
  return null;
}

function buildAviasalesUrl(from, to, dateStr) {
  const [, m, d] = dateStr.split('-');
  return `https://www.aviasales.com/search/${from}${d}${m}${to}1?marker=437825`;
}

export default function CalendarView({ from, to, month, days }) {
  const [year, mon] = month.split('-').map(Number);
  const monthName = MONTH_NAMES[mon - 1];

  // Key by day number — completely format-independent
  const dayMap = {};
  days.forEach(d => {
    const n = extractDayNumber(d.date);
    if (n && n >= 1 && n <= 31) dayMap[n] = d;
  });

  const prices = days.map(d => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = maxPrice - minPrice || 1;

  function priceClass(price) {
    const pct = (price - minPrice) / range;
    if (pct <= 0.33) return 'cal-cheap';
    if (pct <= 0.66) return 'cal-mid';
    return 'cal-expensive';
  }

  const cheapestEntry = days.reduce((a, b) => a.price < b.price ? a : b, days[0]);
  const cheapestDay   = extractDayNumber(cheapestEntry?.date);

  const firstDay    = new Date(year, mon - 1, 1).getDay();
  const daysInMonth = new Date(year, mon, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  return (
    <div className="cal-wrapper">
      <div className="cal-header">
        <span className="cal-title">{from} → {to} · {monthName} {year}</span>
        {cheapestEntry && cheapestDay && (
          <span className="cal-cheapest-label">
            🔥 Cheapest: <strong>${cheapestEntry.price.toLocaleString('en-US')}</strong> on {getOrdinal(cheapestDay)}
          </span>
        )}
      </div>
      <div className="cal-legend">
        <span className="cal-dot cal-cheap" /> Cheapest &nbsp;
        <span className="cal-dot cal-mid" /> Average &nbsp;
        <span className="cal-dot cal-expensive" /> Expensive
      </div>
      <div className="cal-grid">
        {DAY_NAMES.map(d => <div key={d} className="cal-day-name">{d}</div>)}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} className="cal-cell cal-empty" />;
          const data = dayMap[day];
          const dateStr = `${year}-${String(mon).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          if (!data) return <div key={dateStr} className="cal-cell cal-no-data">{day}</div>;
          return (
            <a
              key={dateStr}
              href={buildAviasalesUrl(from, to, dateStr)}
              target="_blank"
              rel="noopener noreferrer"
              className={`cal-cell cal-has-price ${priceClass(data.price)}`}
            >
              <span className="cal-day-num">{day}</span>
              <span className="cal-price">${(data.price / 1000).toFixed(1)}k</span>
              {data.stops === 0 && <span className="cal-direct-dot" title="Direct" />}
            </a>
          );
        })}
      </div>
    </div>
  );
}
