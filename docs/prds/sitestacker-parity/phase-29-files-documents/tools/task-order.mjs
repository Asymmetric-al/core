const TASK_ID = /\d+\.\d+/g;
const TRACE_ID = /\b(?:REQ|AC)29-[A-Z]\d{2,3}(?:-\d{2,3})?\b/g;

function expandTaskRanges(text) {
  return text.replace(
    /(\d+)\.(\d+)\s*(?:–|—|-|through)\s*(\d+)\.(\d+)/g,
    (full, majorA, minorA, majorB, minorB) => {
      if (majorA !== majorB) return full;
      const start = Number(minorA);
      const end = Number(minorB);
      if (end < start || end - start > 40) return full;
      const ids = [];
      for (let minor = start; minor <= end; minor += 1) {
        ids.push(`${majorA}.${minor}`);
      }
      return ids.join(" ");
    },
  );
}

function expandTraceRanges(text) {
  return text.replace(
    /\b((?:REQ|AC)29-[A-Z]\d{2,3})-(\d{2,3})\s*(?:–|—|-|through)\s*\1-(\d{2,3})\b/g,
    (full, prefix, startRaw, endRaw) => {
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (end < start || end - start > 40) return full;
      const width = startRaw.length;
      const ids = [];
      for (let value = start; value <= end; value += 1) {
        ids.push(`${prefix}-${String(value).padStart(width, "0")}`);
      }
      return ids.join(" ");
    },
  );
}

export function taskDependencyIds(text) {
  return [...expandTaskRanges(text).matchAll(TASK_ID)].map((match) => match[0]);
}

export function citedTraceIds(text) {
  return [...expandTraceRanges(text).matchAll(TRACE_ID)].map(
    (match) => match[0],
  );
}
