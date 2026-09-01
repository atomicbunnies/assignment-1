// Smart Natural Language Parser for Quick Add Task Inputs

import { addDays, format, nextDay } from 'date-fns';

export function parseNaturalLanguage(input) {
  if (!input || typeof input !== 'string') {
    return {
      title: '',
      priority: 'medium',
      tags: [],
      dueDate: null,
      estimate: 0,
      tokens: []
    };
  }

  let text = input.trim();
  const tokens = [];
  let priority = 'medium';
  const tags = [];
  let dueDate = null;
  let estimate = 0;

  // 1. Priority Parser (!urgent, !high, !medium, !low, !critical)
  const priorityRegex = /(?:^|\s)!([a-zA-Z]+)/i;
  const pMatch = text.match(priorityRegex);
  if (pMatch) {
    const pVal = pMatch[1].toLowerCase();
    if (['urgent', 'crit', 'critical', 'u'].includes(pVal)) {
      priority = 'urgent';
      tokens.push({ type: 'priority', value: 'Urgent', class: 'priority-urgent' });
    } else if (['high', 'h', 'important'].includes(pVal)) {
      priority = 'high';
      tokens.push({ type: 'priority', value: 'High', class: 'priority-high' });
    } else if (['medium', 'med', 'm', 'normal'].includes(pVal)) {
      priority = 'medium';
      tokens.push({ type: 'priority', value: 'Medium', class: 'priority-medium' });
    } else if (['low', 'l'].includes(pVal)) {
      priority = 'low';
      tokens.push({ type: 'priority', value: 'Low', class: 'priority-low' });
    }
    text = text.replace(pMatch[0], ' ');
  }

  // 2. Tag Parser (#tag1 #tag2)
  const tagRegex = /(?:^|\s)#([a-zA-Z0-9_\-]+)/g;
  let tagMatch;
  while ((tagMatch = tagRegex.exec(input)) !== null) {
    const tagName = tagMatch[1].toLowerCase();
    if (!tags.includes(tagName)) {
      tags.push(tagName);
      tokens.push({ type: 'tag', value: `#${tagName}`, class: 'tag' });
    }
  }
  text = text.replace(/(?:^|\s)#[a-zA-Z0-9_\-]+/g, ' ');

  // 3. Time Estimate (~30m, ~1h, ~90min, ~2.5h)
  const estRegex = /(?:^|\s)~([0-9.]+)(m|min|h|hr)?/i;
  const estMatch = text.match(estRegex);
  if (estMatch) {
    const num = parseFloat(estMatch[1]);
    const unit = (estMatch[2] || 'm').toLowerCase();
    if (unit.startsWith('h')) {
      estimate = Math.round(num * 60);
    } else {
      estimate = Math.round(num);
    }
    tokens.push({ type: 'estimate', value: `${estimate}m estimate`, class: 'estimate' });
    text = text.replace(estMatch[0], ' ');
  }

  // 4. Date Parser (@today, @tomorrow, @next week, @friday, @2026-08-25, etc.)
  const now = new Date();
  const dateKeywordRegex = /(?:^|\s)@([a-zA-Z0-9_\-]+)/i;
  const dateMatch = text.match(dateKeywordRegex);
  if (dateMatch) {
    const dateVal = dateMatch[1].toLowerCase();
    if (dateVal === 'today' || dateVal === 'tod') {
      dueDate = format(now, 'yyyy-MM-dd');
      tokens.push({ type: 'date', value: 'Today', class: 'date' });
    } else if (dateVal === 'tomorrow' || dateVal === 'tom') {
      dueDate = format(addDays(now, 1), 'yyyy-MM-dd');
      tokens.push({ type: 'date', value: 'Tomorrow', class: 'date' });
    } else if (dateVal === 'yesterday') {
      dueDate = format(addDays(now, -1), 'yyyy-MM-dd');
      tokens.push({ type: 'date', value: 'Yesterday', class: 'date' });
    } else if (dateVal === 'nextweek') {
      dueDate = format(addDays(now, 7), 'yyyy-MM-dd');
      tokens.push({ type: 'date', value: 'Next Week', class: 'date' });
    } else if (/^\d{4}-\d{2}-\d{2}$/.test(dateVal)) {
      dueDate = dateVal;
      tokens.push({ type: 'date', value: dateVal, class: 'date' });
    } else {
      const daysOfWeek = {
        sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
        thursday: 4, friday: 5, saturday: 6,
        sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6
      };
      if (daysOfWeek[dateVal] !== undefined) {
        const targetDay = daysOfWeek[dateVal];
        const nextDate = nextDay(now, targetDay);
        dueDate = format(nextDate, 'yyyy-MM-dd');
        tokens.push({ type: 'date', value: dateVal.toUpperCase(), class: 'date' });
      }
    }
    text = text.replace(dateMatch[0], ' ');
  }

  // Clean title
  const cleanTitle = text.replace(/\s+/g, ' ').trim();

  return {
    title: cleanTitle,
    priority,
    tags,
    dueDate,
    estimate,
    tokens
  };
}
