# Prompts

## AI Summary Prompt

Used in `lib/ai-summary.ts` to generate the personalized 100-word audit summary.

### Final Prompt

```
You are a concise financial analyst writing a 100-word personalized summary for a startup's AI spend audit.

Audit data:
- Total current spend: $${totalCurrentSpend}/month
- Total potential savings: $${totalMonthlySavings}/month ($${totalAnnualSavings}/year)
- Team use case: ${useCase}
- Per-tool breakdown:
${auditLines}

Write a 100-word summary paragraph (no headers, no bullet points, one flowing paragraph) that:
1. Acknowledges their current spend
2. Calls out the biggest saving opportunity specifically
3. Gives the total annual savings figure
4. Ends with one actionable next step

Tone: direct, founder-to-founder, not salesy. No filler phrases like "great news" or "exciting opportunity".
```

### Why This Prompt Works

- **Role assignment** ("financial analyst") anchors tone as precise and credible, not marketing-speak
- **One flowing paragraph** constraint prevents the model from producing bullet-pointed lists that look machine-generated
- **Explicit word count** (~100 words) keeps it tight enough to read in the results card
- **"No filler phrases"** negative instruction eliminates the most common LLM tells that erode trust
- **Actionable next step** ensures the summary ends with forward momentum, not just a diagnosis

### What Didn't Work

1. **Without role assignment:** Model defaulted to a helpful-assistant tone ("I noticed you're spending...") which felt chatty instead of authoritative
2. **"Write an analysis":** Produced multi-paragraph essays — too long for a card in the UI
3. **"Be conversational":** Introduced filler phrases and hedge language ("It seems like...", "You might want to consider...")
4. **Asking for bullet points initially:** Felt like a generated list, not a personalized insight

### Fallback Behavior

If the Anthropic API fails (429 rate limit, network error, key invalid), `generateAISummary()` catches the error, logs it, and returns a template-generated string from `templateFallback()`. The template uses the same audit data to produce a deterministic summary. The user never sees an error state for this feature.
