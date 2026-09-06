import OpenAI from "openai";
import { NextResponse } from "next/server";

const DEMO_MODE = true;

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MODEL = process.env.OPENAI_MODEL || "gpt-5.6-luna";

function demoGenerate(
  type: string,
  topic: string,
  content: string,
  action: string
) {
  const cleanTopic = topic.trim();

  if (action === "create") {
    switch (type) {
      case "Social Media Post":
        return `🚀 ${cleanTopic}

Small businesses don't need a huge budget to get noticed online.

Start by:
• Posting useful content consistently
• Showing your products or services clearly
• Sharing customer experiences
• Responding quickly to comments and messages
• Using platforms where your customers already spend time

The goal isn't simply to post more. It's to build trust, provide value, and give people a reason to choose your business.

Start small. Stay consistent. Keep improving.

#SmallBusiness #SocialMedia #BusinessGrowth

— Created with Creovio Demo`;

      case "Professional Email":
        return `Subject: ${cleanTopic}

Dear Customer,

I hope you are doing well.

I am writing regarding ${cleanTopic.toLowerCase()}.

We would be pleased to provide further information and assist you with any questions you may have. Our goal is to provide a professional and reliable experience.

Please feel free to contact us at your convenience.

Kind regards,

The Creovio Team`;

      case "Product Description":
        return `# ${cleanTopic}

Discover a product designed to deliver quality, convenience, and value.

## Why you'll love it

• Practical and easy to use
• Designed with everyday needs in mind
• Reliable and convenient
• Suitable for customers looking for quality and value

Whether you're buying for yourself or someone else, ${cleanTopic.toLowerCase()} is designed to make a great impression.

**Choose quality. Choose confidence.**

— Created with Creovio Demo`;

      case "Article":
        return `# ${cleanTopic}

## Introduction

${cleanTopic} is an important topic for people and businesses looking for practical ways to improve their results.

## Understanding the Opportunity

Success begins with understanding the audience, identifying the main challenge, and choosing a strategy that can realistically be implemented.

## Practical Strategies

1. Define a clear objective.
2. Understand your target audience.
3. Create useful and relevant content.
4. Measure the results.
5. Improve your approach based on feedback.

## Final Thoughts

The best strategy is one that can be applied consistently and improved over time.

— Created with Creovio Demo`;

      default:
        return `# ${cleanTopic}

## Introduction

${cleanTopic} is an opportunity to create value, reach the right audience, and achieve meaningful results.

## Key Strategies

1. Understand your audience.
2. Define a clear goal.
3. Create useful and engaging content.
4. Stay consistent.
5. Measure what works.
6. Improve your strategy over time.

## Practical Example

A small business can begin with a simple plan: identify its ideal customers, create helpful content, publish consistently, and respond to customer questions quickly.

## Conclusion

Success rarely comes from one action. It comes from combining a clear strategy with consistency and continuous improvement.

— Created with Creovio Demo`;
    }
  }

  if (action === "improve") {
    return `# Improved Version

${content}

## Improvement Notes

This version has been refined for clearer communication, stronger structure, and easier reading.

— Improved with Creovio Demo`;
  }

  if (action === "professional") {
    return `# Professional Version

${content}

## Professional Refinement

The content has been rewritten with a polished, confident, and professional tone while preserving its original message.

— Refined with Creovio Demo`;
  }

  if (action === "shorten") {
    const words = content.split(/\s+/).filter(Boolean);
    const shortened = words.slice(0, Math.max(45, Math.floor(words.length * 0.45)));

    return `${shortened.join(" ")}${shortened.length < words.length ? "..." : ""}

— Shortened with Creovio Demo`;
  }

  if (action === "expand") {
    return `${content}

## Additional Insights

There are several ways to strengthen this approach further.

First, focus on the needs of your target audience. The most effective content answers real questions and solves real problems.

Second, consistency matters. A strategy becomes more effective when it is practiced regularly and adjusted according to results.

Finally, remember that improvement is a continuous process. Test different approaches, learn from the response, and keep refining your work.

— Expanded with Creovio Demo`;
  }

  return content;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const type = String(body.type || "Blog Post");
    const topic = String(body.topic || "");
    const content = String(body.content || "");
    const action = String(body.action || "create");

    if (!topic.trim() && !content.trim()) {
      return NextResponse.json(
        { error: "Please provide a topic or content." },
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

    const prompt =
      action === "create"
        ? `Create a high-quality ${type} based on this request:\n\n${topic}`
        : `Perform this action: ${action}\n\nContent:\n${content}`;

    const response = await client.responses.create({
      model: MODEL,
      input: prompt,
    });

    return NextResponse.json({
      content: response.output_text,
      demo: false,
    });
  } catch (error) {
    console.error("Creovio API error:", error);

    return NextResponse.json(
      { error: "Creovio could not generate the content." },
      { status: 500 }
    );
  }
}
