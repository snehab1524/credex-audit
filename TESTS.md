# Tests

All tests are in `tests/audit-engine.test.ts` and cover the audit engine specifically, as required.

## How to Run

```bash
npm test          # run once
npm run test:watch  # watch mode
```

## Test List

| Test | File | What It Covers |
|---|---|---|
| Detects plan downgrade opportunity | tests/audit-engine.test.ts | Cursor Business for 2-person team should recommend Pro downgrade |
| Detects seat waste | tests/audit-engine.test.ts | 10 Copilot seats for 4-person team should surface savings |
| Detects switch_tool alternative | tests/audit-engine.test.ts | Cursor Pro should surface a cheaper alternative |
| Already optimal returns correct action | tests/audit-engine.test.ts | Copilot Individual for 1 person → `already_optimal`, $0 savings |
| Total savings calculation is correct | tests/audit-engine.test.ts | Sum of per-tool savings matches `totalMonthlySavings` |
| isHighSavings flag triggers at $500 | tests/audit-engine.test.ts | `isHighSavings` is `true` when monthly savings > $500 |
| Unique IDs per audit run | tests/audit-engine.test.ts | Two identical audits produce different UUIDs |
| Credits recommendation for high spend | tests/audit-engine.test.ts | Returns a defined recommendation for high-spend Cursor plan |

## Test Philosophy

The audit engine is the financial heart of the product. Every recommendation it makes should be defensible to a finance-literate reviewer. Tests verify:

1. **Correctness of rule triggers** — that the right rule fires for the right input
2. **Math accuracy** — that savings totals are correct
3. **Edge cases** — optimal setups return `already_optimal`, not false positives
4. **Isolation** — tests use no real network, DB, or API calls. Pure function inputs → outputs.
