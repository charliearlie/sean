type Direction = "ltr" | "rtl";

export function insetInlineStart(dir: Direction, value: string | number): React.CSSProperties {
  return dir === "rtl" ? { right: value } : { left: value };
}

export function insetInlineEnd(dir: Direction, value: string | number): React.CSSProperties {
  return dir === "rtl" ? { left: value } : { right: value };
}

export function borderInlineStart(dir: Direction, value: string): React.CSSProperties {
  return dir === "rtl" ? { borderRight: value } : { borderLeft: value };
}

export function borderInlineEnd(dir: Direction, value: string): React.CSSProperties {
  return dir === "rtl" ? { borderLeft: value } : { borderRight: value };
}

export function textAlignStart(dir: Direction): React.CSSProperties {
  return { textAlign: dir === "rtl" ? "right" : "left" };
}

export function textAlignEnd(dir: Direction): React.CSSProperties {
  return { textAlign: dir === "rtl" ? "left" : "right" };
}
