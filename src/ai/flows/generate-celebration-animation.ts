'use server';
/**
 * @fileOverview Flow to generate celebration animations when a goal is scored.
 *
 * - generateCelebrationAnimation - A function that generates a celebration animation.
 * - GenerateCelebrationAnimationInput - The input type for the generateCelebrationAnimation function.
 * - GenerateCelebrationAnimationOutput - The return type for the generateCelebrationAnimation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const GenerateCelebrationAnimationInputSchema = z.object({
  teamName: z.string().describe('The name of the team that scored.'),
  playerName: z.string().describe('The name of the player who scored.'),
});
export type GenerateCelebrationAnimationInput = z.infer<typeof GenerateCelebrationAnimationInputSchema>;

const GenerateCelebrationAnimationOutputSchema = z.object({
  animationDataUri: z
    .string()
    .describe(
      'A data URI containing the animation data in a suitable format (e.g., GIF, video/mp4).'
    ),
  celebrationSpeech: z.string().describe('Audio data as data URI in WAV format'),
});
export type GenerateCelebrationAnimationOutput = z.infer<typeof GenerateCelebrationAnimationOutputSchema>;

export async function generateCelebrationAnimation(input: GenerateCelebrationAnimationInput): Promise<GenerateCelebrationAnimationOutput> {
  return generateCelebrationAnimationFlow(input);
}

const celebratePrompt = ai.definePrompt({
  name: 'celebratePrompt',
  input: {schema: GenerateCelebrationAnimationInputSchema},
  output: {schema: GenerateCelebrationAnimationOutputSchema},
  prompt: `Create a short, fun celebration animation and corresponding audio for when {{{teamName}}} scores a goal by player {{{playerName}}}. The animation should be in a suitable format like GIF or a short video. Return the animation as a data URI. The crowd is excited and very loud.

Animation should be cartoon style.

Output the audio portion as data URI with wav format.

DO NOT generate a video if the video takes longer than 5 seconds to generate.
DO NOT generate a video if the request comes from mobile device.`,
});

const generateCelebrationAnimationFlow = ai.defineFlow(
  {
    name: 'generateCelebrationAnimationFlow',
    inputSchema: GenerateCelebrationAnimationInputSchema,
    outputSchema: GenerateCelebrationAnimationOutputSchema,
  },
  async input => {
    try {
      const {output} = await celebratePrompt(input);
      return output!;
    } catch (e: any) {
      console.error('celebratePrompt failed', e);
      return {
        animationDataUri: '',
        celebrationSpeech: '',
      };
    }
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

