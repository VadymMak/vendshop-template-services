import { createWriteStream } from 'fs';
import https from 'https';

const TOKEN = process.env.REPLICATE_API_TOKEN!;
const MODEL = 'black-forest-labs/flux-schnell';

async function waitForOutput(predictionId: string): Promise<string> {
  while (true) {
    const res = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
      headers: { Authorization: `Token ${TOKEN}` },
    });
    const data = await res.json() as { status: string; output?: string[]; error?: string };

    if (data.status === 'succeeded' && data.output?.length) return data.output[0];
    if (data.status === 'failed') throw new Error(data.error ?? 'Prediction failed');

    await new Promise(r => setTimeout(r, 2000));
  }
}

async function download(url: string, dest: string) {
  const file = createWriteStream(dest);
  return new Promise<void>((resolve, reject) => {
    https.get(url, res => {
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(); });
    }).on('error', reject);
  });
}

async function main() {
  console.log('Starting prediction...');

  const res = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: {
      Authorization: `Token ${TOKEN}`,
      'Content-Type': 'application/json',
      Prefer: 'wait=30',
    },
    body: JSON.stringify({
      input: {
        prompt: `Interior of a premium barbershop, vintage leather barber chairs,
large mirrors with Hollywood lighting, wooden shelves lined with grooming products
and straight razors, warm copper and amber Edison bulb lighting, dark walls with
exposed brick, moody cinematic atmosphere, shallow depth of field, no people,
professional architectural photography, 8K detail`,
        width: 1024,
        height: 768,
        num_outputs: 1,
        num_inference_steps: 4,
      },
    }),
  });

  const prediction = await res.json() as { id: string; status: string; output?: string[] };
  console.log(`Prediction ${prediction.id} — status: ${prediction.status}`);

  let imageUrl: string;
  if (prediction.status === 'succeeded' && prediction.output?.length) {
    imageUrl = prediction.output[0];
  } else {
    console.log('Waiting for result...');
    imageUrl = await waitForOutput(prediction.id);
  }

  console.log(`Downloading from: ${imageUrl}`);
  await download(imageUrl, 'public/about-barbershop.webp');
  console.log('Saved: public/about-barbershop.webp');
}

main().catch(console.error);
