#!/usr/bin/env python3
"""Generate app/globals.css from tokens/tokens.json.

Dark is the only mode; the semantic layer has no light palette.

  npm run tokens:css

Exits non-zero on any unresolved reference, literal semantic value,
unmapped font weight, unknown token type, or custom-property name
collision -- a broken token pipeline should fail loudly, never emit
a half-correct stylesheet.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "tokens" / "tokens.json"
OUT = ROOT / "app" / "globals.css"

# Font weights are stored as Figma style names ("SemiBold"), which are not
# valid CSS font-weight values. This mapping is NOT in tokens.json; it is a
# build-time decision. Update it here if the type ramp gains a weight.
WEIGHT = {"Regular": "400", "SemiBold": "600", "Bold": "700", "Heavy": "900"}


def flatten(node, path=""):
    """Walk a DTCG token tree, yielding (dotted.path, value, type) leaves."""
    out = []
    if isinstance(node, dict):
        if "value" in node or "$value" in node:
            out.append(
                (
                    path,
                    node.get("value", node.get("$value")),
                    node.get("type", node.get("$type")),
                )
            )
        else:
            for key, child in node.items():
                if key.startswith("$"):
                    continue
                out += flatten(child, f"{path}.{key}" if path else key)
    return out


def prop(path):
    """tokens.json path -> CSS custom property name."""
    kebab = re.sub(r"(?<=[a-z0-9])(?=[A-Z])", "-", path)
    return "--" + re.sub(r"[^A-Za-z0-9]+", "-", kebab).lower().strip("-")


def literal(value, type_, path):
    """Render a primitive value as CSS. Primitives are the only literals."""
    if type_ == "color":
        return value
    if type_ == "dimension":
        return f"{value}px"
    if type_ == "fontWeight":
        if value not in WEIGHT:
            sys.exit(f"FATAL unmapped fontWeight {value!r} at {path}")
        return WEIGHT[value]
    if type_ == "fontFamily":
        return f'"{value}"'
    if type_ == "number":
        # $metadata: letterSpacing values are raw percent. CSS letter-spacing
        # takes no percentage, so express as em.
        return f"{float(value) / 100:g}em"
    sys.exit(f"FATAL unknown token type {type_!r} at {path}")


def main():
    tokens = json.loads(SRC.read_text())
    meta = tokens.get("$metadata", {})
    primitives = flatten(tokens["primitive"], "primitive")
    semantics = flatten(tokens["semantic"], "semantic")
    by_path = {p: (v, t) for p, v, t in primitives}

    names = {}
    for path, _, _ in primitives + semantics:
        names.setdefault(prop(path), []).append(path)
    collisions = {k: v for k, v in names.items() if len(v) > 1}
    if collisions:
        sys.exit(f"FATAL custom-property name collisions: {collisions}")

    lines = [
        '@import "tailwindcss";',
        "",
        f'/* Generated from tokens/tokens.json (version {meta.get("version")}, '
        f'mode: {meta.get("mode")}) by scripts/generate-globals-css.py.',
        "   Do not hand-edit. Run `npm run tokens:css` after changing tokens/tokens.json.",
        "   Dark is the only mode; there is no light palette in the semantic layer. */",
        "",
        ":root {",
        "  color-scheme: dark;",
        "",
        "  /* ===== primitive layer =====",
        "     Raw values. The only place a literal appears.",
        "     Never consume these in a component -- use the semantic layer below. */",
    ]

    group = None
    for path, value, type_ in primitives:
        current = path.split(".")[1]
        if current != group:
            lines.append("")
            group = current
        lines.append(f"  {prop(path)}: {literal(value, type_, path)};")

    lines += [
        "",
        "  /* ===== semantic layer =====",
        "     Every token is an alias into a primitive. This is the layer",
        "     components consume. No literals, no var() fallbacks. */",
    ]

    group = None
    for path, value, _ in semantics:
        if not (isinstance(value, str) and value.startswith("{")):
            sys.exit(f"FATAL semantic token {path} holds a literal, not a reference: {value!r}")
        ref = value.strip("{}")
        if ref not in by_path:
            sys.exit(f"FATAL unresolved reference at {path}: {ref}")
        current = path.split(".")[1]
        if current != group:
            lines.append("")
            group = current
        lines.append(f"  {prop(path)}: var({prop(ref)});")

    lines += [
        "}",
        "",
        "/* Bridges the two tokens the create-next-app boilerplate still references",
        "   (bg-foreground / text-background in app/page.tsx). Remove both once that",
        "   page is replaced with real screens. */",
        "@theme inline {",
        "  --color-background: var(--semantic-background-page);",
        "  --color-foreground: var(--semantic-text-primary);",
        "  --font-sans: var(--semantic-type-scale-body-m-regular-font-family);",
        "}",
        "",
        "html {",
        "  background: var(--semantic-background-page);",
        "}",
        "",
        "body {",
        "  background: var(--semantic-background-page);",
        "  color: var(--semantic-text-primary);",
        "  font-family: var(--semantic-type-scale-body-m-regular-font-family);",
        "  font-weight: var(--semantic-type-scale-body-m-regular-font-weight);",
        "  font-size: var(--semantic-type-scale-body-m-regular-font-size);",
        "  line-height: var(--semantic-type-scale-body-m-regular-line-height);",
        "  letter-spacing: var(--semantic-type-scale-body-m-regular-letter-spacing);",
        "}",
        "",
    ]

    OUT.write_text("\n".join(lines))
    rel = OUT.relative_to(ROOT)
    print(f"wrote {rel}  ({len(primitives)} primitives, {len(semantics)} semantic aliases)")


if __name__ == "__main__":
    main()
