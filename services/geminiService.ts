import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, PlanItem, ActivityType, ReviewResult } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const planItemSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    time: { type: Type.STRING, description: "Time of the activity in HH:MM format (24h)" },
    type: { type: Type.STRING, enum: Object.values(ActivityType), description: "Category of the activity" },
    title: { type: Type.STRING, description: "Short title of the activity" },
    description: { type: Type.STRING, description: "Detailed instruction. For meals, include ingredients. For exercise, include reps/sets." },
    calories: { type: Type.NUMBER, description: "Estimated calories (positive for food, negative for exercise, 0 otherwise)" },
    isHighlight: { type: Type.BOOLEAN, description: "True if this is a key meal or workout" },
  },
  required: ["time", "type", "title", "description", "isHighlight"],
};

const dailyPlanSchema: Schema = {
  type: Type.ARRAY,
  items: planItemSchema,
};

export const generateDailyPlan = async (profile: UserProfile, previousAdjustment?: string): Promise<PlanItem[]> => {
  const adjustmentPrompt = previousAdjustment 
    ? `IMPORTANT ADJUSTMENT BASED ON YESTERDAY: ${previousAdjustment}. Ensure this is strictly reflected in today's plan.` 
    : '';

  const prompt = `
    Create a highly personalized daily weight loss schedule for a user.
    
    User Profile:
    - Name: ${profile.name}
    - Profession: ${profile.profession} (CRITICAL: The schedule MUST be practical for this job. e.g., if they are a driver, no complex cooking for lunch. If office worker, include desk stretches.)
    - Stats: ${profile.height}cm, ${profile.currentWeight}kg -> Goal: ${profile.targetWeight}kg
    - Schedule: Wakes up at ${profile.wakeUpTime}, Sleeps at ${profile.sleepTime}
    - Preferences: ${profile.dietaryPreferences || 'None'}

    ${adjustmentPrompt}
    
    Requirements:
    1. Plan from Wake Up (${profile.wakeUpTime}) to Sleep (${profile.sleepTime}).
    2. Suggest 3 main meals and 2 snacks (if appropriate) with specific healthy food ideas.
    3. Include 2 hydration reminders.
    4. Include specific workout/exercise slots. If the profession is sedentary, suggest active breaks. If active, suggest recovery or strength.
    5. Output JSON only.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyPlanSchema,
        systemInstruction: "You are an elite nutritionist and personal trainer. You create practical, highly specific plans that fit into real people's work lives. You focus on caloric deficit and macronutrient balance.",
      },
    });

    const data = JSON.parse(response.text || "[]");
    
    return data.map((item: any, index: number) => ({
      ...item,
      id: `task-${Date.now()}-${index}`,
      completed: false,
    }));
  } catch (error) {
    console.error("Error generating plan:", error);
    // Return a fallback plan if AI fails
    return [
      {
        id: 'fallback-1',
        time: profile.wakeUpTime,
        type: ActivityType.HYDRATION,
        title: 'Morning Water',
        description: 'Drink 500ml of water immediately after waking up.',
        completed: false,
        isHighlight: false,
        calories: 0
      }
    ];
  }
};

export const generateMorningBriefing = async (profile: UserProfile, plan: PlanItem[]): Promise<string> => {
  const prompt = `
    User: ${profile.name}, ${profile.profession}.
    Today's Key Tasks: ${JSON.stringify(plan.filter(p => p.isHighlight).map(p => p.title))}.
    
    Write a short, energetic morning greeting (max 40 words). 
    Highlight the single most important thing they need to nail today to reach their ${profile.targetWeight}kg goal.
    Be encouraging but firm.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || "Rise and shine! Consistency is key today.";
  } catch (error) {
    return "Good morning! Let's make today count.";
  }
};

export const reviewDayAndAdjust = async (
  profile: UserProfile, 
  completedPlan: PlanItem[], 
  userFeedback: string
): Promise<ReviewResult> => {
  const completedTasks = completedPlan.filter(p => p.completed).length;
  const totalTasks = completedPlan.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  
  const prompt = `
    Analyze today's weight loss progress.
    User: ${profile.name} (${profile.profession}).
    Completed: ${completionRate}% of planned tasks.
    User Feedback: "${userFeedback}"
    
    1. 'feedback': A brief, empathetic summary of how they did (2-3 sentences). Praise consistency or offer support for misses.
    2. 'suggestedAdjustment': ONE specific, actionable change for tomorrow's plan based on today's performance and feedback. (e.g., "Add a protein snack at 3pm," "Reduce cardio intensity," "Earlier dinner").
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feedback: { type: Type.STRING },
            suggestedAdjustment: { type: Type.STRING }
          },
          required: ["feedback", "suggestedAdjustment"]
        }
      }
    });
    return JSON.parse(response.text || '{"feedback": "Good job today.", "suggestedAdjustment": "Keep it up."}');
  } catch (e) {
    console.error(e);
    return { feedback: "Great effort today!", suggestedAdjustment: "Maintain current intensity." };
  }
};
