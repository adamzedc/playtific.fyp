import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY, // Use Expo's native env handling
  dangerouslyAllowBrowser: true, // Only enable this if running in the browser
});

// 🔹 Define the TypeScript Type for Roadmaps
type Roadmap = {
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

// 🔹 Function to Generate Roadmap from OpenAI
export const generateRoadmap = async (goal: string, timeframe: string): Promise<Roadmap | null> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content:  `You are an expert roadmap maker. You specialize in creating monthly milestones with realistic action steps that a user can follow to reach their goal within a specified timeframe. Your responses must:
          - Provide only JSON and no additional text.
          - Break down each month with a milestone and an actionable list of tasks.
          - Omit disclaimers or suggestions; focus on actionable steps.
          - Keep it concise, relevant, and achievable within each monthly milestone.`, },
        {
          role: "user",
          content: `I want to achieve the goal: "${goal}" within ${timeframe}. Please generate a structured roadmap with milestones and tasks. Respond only in JSON format, like:
          {
            "goal": "Your goal here",
            "timeframe": "Your timeframe here",
            "milestones": [
              {
                "name": "Milestone name",
                "tasks": [
                  "Task 1",
                  "Task 2"
                ]
              }
              // ... subsequent months
            ]
          }
          No explanations or disclaimers, just the JSON.`,
        },
      ],
    });

    let content = response.choices[0].message.content;
    
    // 🔹 Remove unwanted Markdown JSON formatting if present
    content = content.replace(/```json|```/g, "").trim();

    // 🔹 Parse and return the roadmap object
    return JSON.parse(content) as Roadmap;
  } catch (error) {
    console.error(" Error generating roadmap:", error);
    return null; // Return `null` instead of failing silently
  }
};
