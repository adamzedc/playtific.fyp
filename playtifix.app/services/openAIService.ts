import { OpenAI } from "openai";

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_OPENAI_API_KEY, 
  dangerouslyAllowBrowser: true, 
});


type Roadmap = {
  goal: string;
  timeframe: string;
  milestones: {
    name: string;
    tasks: string[];
  }[];
};

//  Function to Generate Roadmap from OpenAI
export const generateRoadmap = async (goal: string, timeframe: string): Promise<Roadmap | null> => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are an expert roadmap maker. You specialize in creating monthly milestones with realistic action steps that a user can follow to reach their goal within a specified timeframe. Your responses must:
          - Provide only JSON and no additional text.
          - Break down each month with a milestone and an actionable list of tasks.
          - Omit disclaimers or suggestions; focus on actionable steps.
          - Keep it concise, relevant, and achievable within each monthly milestone.
          - Prioritize foundational or high-impact tasks early in the roadmap.
          - Vary the types of tasks to reduce monotony (e.g., research, practice, build).
          - Avoid repeating similar tasks across months.
          - Make each milestone build on the skills or knowledge from the previous month.`,
        },
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

    // Check if response.choices exists and has content
    const content = response.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("No content returned from OpenAI API.");
    }

    // Remove unwanted Markdown JSON formatting if present
    const cleanedContent = content.replace(/```json|```/g, "").trim();

    // 🔹 Parse and return the roadmap object
    return JSON.parse(cleanedContent) as Roadmap;
  } catch (error) {
    console.error("Error generating roadmap:", error);
    return null; // Return `null` instead of failing silently
  }
};
