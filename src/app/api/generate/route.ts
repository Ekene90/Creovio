import OpenAI from "openai";
import { NextResponse } from "next/server";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";
const DEMO_MODE = process.env.CREOVIO_DEMO_MODE === "true";

function buildPrompt(
  type: string,
  topic: string,
  content: string,
  action: string
) {
  if (action === "create") {
    return `
You are Creovio, a professional AI writing assistant.

Create a high-quality ${type} based on the user's request below.

USER REQUEST:
${topic}

Requirements:
- Write original, useful, natural-sounding content.
- Match the requested content type.
- Use clear structure and good formatting.
- Do not mention that you are an AI.
- Do not mention Creovio unless the user asks.
- Do not add notes about how you generated the content.
- Do not repeat the user's request unnecessarily.
- Do not use fake statistics or unsupported specific claims.
- Return only the finished content.
`;
  }

  const actionInstructions: Record<string, string> = {
    improve: `
Improve the writing while preserving the original meaning.
Make it clearer, more engaging, natural, and useful.
Remove unnecessary repetition.
Do not add commentary about what you changed.
`,

    professional: `
Rewrite the content in a polished, professional, confident tone.
Preserve the original meaning and important details.
Improve grammar, clarity, structure, and word choice.
Do not add commentary about what you changed.
`,

    shorten: `
Make the content substantially shorter while preserving its most important information.
Remove repetition, filler, and unnecessary wording.
Keep the main message and useful details.
Return only the shortened content.
`,

    expand: `
Expand the content with useful, relevant information.
Add depth, examples, explanations, or practical details where appropriate.
Do not repeat existing paragraphs just to make the response longer.
Keep the original purpose and tone.
`,
  };

  return `
You are Creovio, a professional AI writing assistant.

ACTION:
${action}

CONTENT TYPE:
${type}

INSTRUCTIONS:
${actionInstructions[action] || "Rewrite the content appropriately."}

ORIGINAL CONTENT:
${content}

Return only the finished revised content.
Do not include labels such as "Improved Version", "Professional Version",
"Additional Insights", "Notes", or "Created with Creovio".
Do not explain your work.
`;
}

function demoGenerate(
  type: string,
  topic: string,
  content: string,
  action: string
) {
  const cleanTopic = topic.trim();
  const cleanContent = content.trim();

  if (action === "create") {
    return `# ${cleanTopic}

## Introduction

${cleanTopic} is an important opportunity for individuals and businesses looking to achieve better results.

## Key Strategies

1. Understand your audience.
2. Define a clear objective.
3. Create useful and relevant content.
4. Stay consistent.
5. Measure what works.
6. Improve your approach over time.

## Practical Approach

Start with a simple strategy that matches your goals and available resources. Focus on providing genuine value, communicating clearly, and learning from your results.

## Conclusion

Success comes from combining a clear strategy with consistent execution and continuous improvement.`;
  }

  if (action === "improve") {
    return cleanContent
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) return "";

        if (
          trimmed.startsWith("# ") ||
          trimmed.startsWith("## ") ||
          trimmed.startsWith("### ")
        ) {
          return trimmed;
        }

        return trimmed
          .replace(/\bis important\b/gi, "plays an important role")
          .replace(/\bget more customers\b/gi, "attract more customers")
          .replace(/\bbetter results\b/gi, "stronger results")
          .replace(/\buse social media\b/gi, "leverage social media")
          .replace(/\bStay consistent\b/g, "Maintain a consistent approach")
          .replace(/\bImprove your approach\b/g, "Continuously improve your approach")
          .replace(/\bStart with\b/gi, "Begin with");
      })
      .join("\n")
      .trim();
  }

  if (action === "professional") {
    return cleanContent
      .split("\n")
      .map((line) => {
        const trimmed = line.trim();

        if (!trimmed) return "";

        if (
          trimmed.startsWith("# ") ||
          trimmed.startsWith("## ") ||
          trimmed.startsWith("### ")
        ) {
          return trimmed;
        }

        return trimmed
          .replace(/\bget more customers\b/gi, "increase customer acquisition")
          .replace(/\bbetter results\b/gi, "improved outcomes")
          .replace(/\buse social media\b/gi, "leverage social media")
          .replace(/\bStart with\b/gi, "Begin with")
          .replace(/\bStay consistent\b/g, "Maintain consistency")
          .replace(/\bImprove your approach\b/g, "Continuously refine your approach")
          .replace(/\bimportant opportunity\b/gi, "valuable opportunity");
      })
      .join("\n")
      .trim();
  }

  if (action === "shorten") {
    const lines = cleanContent.split("\n");
    const output: string[] = [];
    const bodySentences: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed) {
        continue;
      }

      if (
        trimmed.startsWith("# ") ||
        trimmed.startsWith("## ") ||
        trimmed.startsWith("### ")
      ) {
        output.push(trimmed);
      } else {
        const sentences = trimmed
          .split(/(?<=[.!?])\s+/)
          .filter(Boolean);

        bodySentences.push(...sentences);
      }
    }

    const target = Math.max(3, Math.ceil(bodySentences.length * 0.5));
    let used = 0;

    for (const sentence of bodySentences) {
      if (used >= target) break;

      output.push(sentence);
      used++;
    }

    return output.join("\n\n").trim();
  }

  if (action === "expand") {
    return `${cleanContent}

## Practical Tips

- Start with one clear objective and focus your effort on the activities most likely to support it.
- Keep the approach simple enough to maintain consistently.
- Review your results regularly and adjust what is not working.

## Common Mistakes to Avoid

Avoid trying to do everything at once. Focus on a small number of meaningful actions, communicate clearly, and make decisions based on useful feedback.

## Additional Considerations

Consider your audience, objectives, available resources, and measurable results when developing this approach.

A strong strategy should be practical enough to implement consistently and flexible enough to improve as you learn what works.`;
  }

  return cleanContent;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = String(body.type || "Blog Post");
    const topic = String(body.topic || "");
    const content = String(body.content || "");
    const action = String(body.action || "create");

    if (action === "create" && !topic.trim()) {
      return NextResponse.json(
        { error: "Please provide a topic or request." },
        { status: 400 }
      );
    }

    if (action !== "create" && !content.trim()) {
      return NextResponse.json(
        { error: "Please provide content to modify." },
        { status: 400 }
      );
    }

    if (DEMO_MODE) {
      const result = demoGenerate(type, topic, content, action);

      return NextResponse.json({
        content: result,
        demo: true,
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      );
    }

    const prompt = buildPrompt(type, topic, content, action);

    const response = await client.responses.create({
      model: MODEL,
      input: prompt,
    });

    const result = response.output_text?.trim();

    if (!result) {
      return NextResponse.json(
        { error: "The AI returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      content: result,
      demo: false,
      model: MODEL,
    });
  } catch (error) {
    console.error("Creovio API error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unknown API error.";

    return NextResponse.json(
      {
        error: `Creovio could not generate the content: ${message}`,
      },
      { status: 500 }
    );
  }
}
