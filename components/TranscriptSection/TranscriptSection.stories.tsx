import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { expect } from 'storybook/test';
import { TranscriptSection } from './TranscriptSection';

/** Verbatim from the Figma component "transcriptSection" (node 15676:16088). */
const FIGMA_DESCRIPTION = `"WHAT YOU SAID" section label above a tinted transcript box. Shows the STT transcript of the student's last answer on the result screen.

**LAYER ANATOMY**

\`\`\`
transcriptSection   vertical, gap: Space/200
  Section Label     "WHAT YOU SAID", Greed/Caption S Bold (font/size/2xs, font/lineHeight/2xs)
                    fill: text/disabled, tracking: font/tracking/loose
  Transcript box    fill: background/elevated (nearest to original rgba(255,255,255,0.05))
                    radius: Radius/200, clips content
    Transcript Text Greed/Caption M Regular (font/size/xs, font/lineHeight/xs)
                    fill: text/secondary, padding: Space/300 left, Space/200 top
\`\`\`

**DON'T**
- Do not use this component during the processing state — it requires a verdict to have content.
- Do not confuse with the Transcript layer inside recallResponseCard — that is a different component.

---

**Why it exists.** Voice_UX principle 4: *"Briefly show what was heard (the transcript) alongside the result, so a misheard answer reads as 'the app misheard me,' not 'I failed.'"* It is a transparency aid, explicitly **not** a correction step — \`sprint-context.md\` rules that out.

**The label uses \`text/secondary\`, not Figma's \`text/disabled\`.** Same 3.79:1 failure, same fix as \`typeAnswerComponent\`. \`text/secondary\` is 8.36:1.

**Every other binding resolved exactly** — \`background/elevated\`, \`Radius/200\` → \`radius/tab\`, \`caption/S-bold\`, \`caption/M-regular\`, \`text/secondary\`. No new tokens.

**It was instanced only inside \`recallResponseCard\`**, never standalone, despite the description placing it on the result screen.`;

const meta = {
  title: 'Components/TranscriptSection',
  component: TranscriptSection,
  parameters: { layout: 'centered', docs: { description: { component: FIGMA_DESCRIPTION } } },
  argTypes: { label: { control: 'text' }, transcript: { control: 'text' } },
  decorators: [(Story) => (<div style={{ width: '330px' }}><Story /></div>)],
  tags: ['autodocs'],
} satisfies Meta<typeof TranscriptSection>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  name: 'transcriptSection',
  args: {},
  play: async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText('WHAT YOU SAID')).toBeVisible();

    // Proves the token stylesheet reached it.
    const label = getComputedStyle(canvas.getByText('WHAT YOU SAID'));
    await expect(label.fontSize).toBe('9px');
    await expect(label.lineHeight).toBe('12px');
    await expect(label.color).toBe('rgba(245, 243, 255, 0.68)');

    const box = canvasElement.querySelector('.knw-transcript__box') as HTMLElement;
    const bs = getComputedStyle(box);
    await expect(bs.backgroundColor).toBe('rgba(255, 255, 255, 0.1)');
    await expect(bs.borderRadius).toBe('8px');

    const text = canvasElement.querySelector('.knw-transcript__text') as HTMLElement;
    const ts = getComputedStyle(text);
    await expect(ts.fontSize).toBe('12px');
    await expect(ts.lineHeight).toBe('16px');
    await expect(ts.color).toBe('rgba(245, 243, 255, 0.68)');
  },
};

export const LongTranscript: Story = {
  name: 'A long transcript',
  args: {
    transcript: '"Primary sources are documents created at the time of the event by someone who was there, and secondary sources are written later by people interpreting those first-hand accounts, so you have to weigh them differently."',
  },
  play: async ({ canvasElement }) => {
    // The box grows with the text rather than clipping it.
    const box = canvasElement.querySelector('.knw-transcript__box') as HTMLElement;
    const text = canvasElement.querySelector('.knw-transcript__text') as HTMLElement;
    await expect(box.getBoundingClientRect().height).toBeGreaterThan(text.getBoundingClientRect().height - 1);
  },
};

export const CustomLabel: Story = {
  name: 'label override',
  args: { label: 'WAS DU GESAGT HAST' },
  play: async ({ canvas }) => {
    await expect(canvas.getByText('WAS DU GESAGT HAST')).toBeVisible();
  },
};
