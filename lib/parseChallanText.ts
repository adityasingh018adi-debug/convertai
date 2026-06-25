export type ParsedChallanItem = { desc: string; qty: number; unit: string };
export type ParsedChallan = {
  deliverTo?: string;
  vehicle?: string;
  items: ParsedChallanItem[];
};

const UNIT_WORDS = [
  "kgs", "kg", "pcs", "pieces", "piece", "box", "boxes", "metres", "meters",
  "metre", "meter", "litre", "litres", "liter", "liters", "ltr", "dozen",
  "packets", "packet", "units", "unit", "spools", "spool", "rolls", "roll", "bags", "bag",
];

const DELIVER_LABELS = ["deliver to", "ship to", "to", "delivered to", "consignee"];
const VEHICLE_LABELS = ["vehicle no", "vehicle", "truck no", "truck"];

function matchLabel(line: string, labels: string[]): string | null {
  const lower = line.toLowerCase();
  for (const label of labels) {
    const idx = lower.indexOf(label + ":");
    if (idx !== -1 && idx < 3) {
      return line.slice(idx + label.length + 1).trim();
    }
  }
  return null;
}

function parseItemLine(line: string): ParsedChallanItem {
  // "5 boxes of steel rods" / "5x steel rods" / "5 steel rods"
  const leadingQty = line.match(/^(\d+(?:\.\d+)?)\s*(?:x|×)?\s*(.+)$/i);
  if (leadingQty) {
    const qty = parseFloat(leadingQty[1]);
    let rest = leadingQty[2].trim();
    let unit = "pcs";
    const lowerRest = rest.toLowerCase();
    for (const u of UNIT_WORDS) {
      const re = new RegExp(`^(of\\s+)?${u}\\b`, "i");
      if (re.test(lowerRest)) {
        unit = u;
        rest = rest.replace(re, "").trim();
        break;
      }
      const trailingRe = new RegExp(`\\b${u}\\s+of\\s+(.+)$`, "i");
      const trailingMatch = rest.match(trailingRe);
      if (trailingMatch) {
        unit = u;
        rest = trailingMatch[1].trim();
        break;
      }
    }
    return { desc: rest.replace(/^of\s+/i, ""), qty, unit };
  }

  // "Steel rods - 5 kg" / "Steel rods: 5"
  const trailingQty = line.match(/^(.+?)[\s:-]+(\d+(?:\.\d+)?)\s*([a-zA-Z]*)$/);
  if (trailingQty) {
    return {
      desc: trailingQty[1].trim(),
      qty: parseFloat(trailingQty[2]),
      unit: trailingQty[3]?.trim() || "pcs",
    };
  }

  return { desc: line.trim(), qty: 1, unit: "pcs" };
}

export function parseChallanText(raw: string): ParsedChallan {
  const lines = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  let deliverTo: string | undefined;
  let vehicle: string | undefined;
  const itemLines: string[] = [];

  for (const line of lines) {
    const deliver = matchLabel(line, DELIVER_LABELS);
    if (deliver !== null) {
      deliverTo = deliverTo ? `${deliverTo}\n${deliver}` : deliver;
      continue;
    }
    const veh = matchLabel(line, VEHICLE_LABELS);
    if (veh !== null) {
      vehicle = veh;
      continue;
    }
    itemLines.push(line);
  }

  return {
    deliverTo,
    vehicle,
    items: itemLines.map(parseItemLine).filter((i) => i.desc.length > 0),
  };
}
