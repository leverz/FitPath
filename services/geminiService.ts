
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserProfile, PlanItem, ActivityType, ReviewResult, Language, FoodItem } from "../types";
import { translations } from "../translations";

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

export const generateDailyPlan = async (profile: UserProfile, previousAdjustment: string | undefined, lang: Language): Promise<PlanItem[]> => {
  const adjustmentPrompt = previousAdjustment 
    ? `IMPORTANT ADJUSTMENT BASED ON YESTERDAY: ${previousAdjustment}. Ensure this is strictly reflected in today's plan.` 
    : '';

  const langInstruction = lang === 'zh' 
    ? "IMPORTANT: Output all 'title' and 'description' fields strictly in Simplified Chinese (简体中文)." 
    : "Output in English.";

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
    6. ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: dailyPlanSchema,
        systemInstruction: `You are an elite nutritionist and personal trainer. You create practical, highly specific plans that fit into real people's work lives. ${langInstruction}`,
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
    const t = translations[lang];
    return [
      {
        id: 'fallback-1',
        time: profile.wakeUpTime,
        type: ActivityType.HYDRATION,
        title: t.fallbackTitle,
        description: t.fallbackDesc,
        completed: false,
        isHighlight: false,
        calories: 0
      }
    ];
  }
};

export const generateMorningBriefing = async (profile: UserProfile, plan: PlanItem[], lang: Language): Promise<string> => {
  const langInstruction = lang === 'zh' 
    ? "Output strictly in Simplified Chinese (简体中文)." 
    : "Output in English.";

  const prompt = `
    User: ${profile.name}, ${profile.profession}.
    Today's Key Tasks: ${JSON.stringify(plan.filter(p => p.isHighlight).map(p => p.title))}.
    
    Write a short, energetic morning greeting (max 40 words). 
    Highlight the single most important thing they need to nail today to reach their ${profile.targetWeight}kg goal.
    Be encouraging but firm.
    ${langInstruction}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    return response.text || (lang === 'zh' ? "早安！坚持就是胜利。" : "Rise and shine! Consistency is key today.");
  } catch (error) {
    return lang === 'zh' ? "早安！让我们开始这充实的一天。" : "Good morning! Let's make today count.";
  }
};

export const reviewDayAndAdjust = async (
  profile: UserProfile, 
  completedPlan: PlanItem[], 
  userFeedback: string,
  lang: Language
): Promise<ReviewResult> => {
  const completedTasks = completedPlan.filter(p => p.completed).length;
  const totalTasks = completedPlan.length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);

  const langInstruction = lang === 'zh' 
    ? "Output strictly in Simplified Chinese (简体中文)." 
    : "Output in English.";
  
  const prompt = `
    Analyze today's weight loss progress.
    User: ${profile.name} (${profile.profession}).
    Completed: ${completionRate}% of planned tasks.
    User Feedback: "${userFeedback}"
    
    1. 'feedback': A brief, empathetic summary of how they did (2-3 sentences). Praise consistency or offer support for misses.
    2. 'suggestedAdjustment': ONE specific, actionable change for tomorrow's plan based on today's performance and feedback. (e.g., "Add a protein snack at 3pm," "Reduce cardio intensity," "Earlier dinner").
    
    ${langInstruction}
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
    const fallback = lang === 'zh' 
      ? '{"feedback": "今天做得不错。", "suggestedAdjustment": "继续保持。"}' 
      : '{"feedback": "Good job today.", "suggestedAdjustment": "Keep it up."}';
      
    return JSON.parse(response.text || fallback);
  } catch (e) {
    console.error(e);
    return { 
      feedback: lang === 'zh' ? "今天很努力！" : "Great effort today!", 
      suggestedAdjustment: lang === 'zh' ? "保持当前强度。" : "Maintain current intensity." 
    };
  }
};

export const analyzeFood = async (text: string, lang: Language): Promise<FoodItem> => {
  const langInstruction = lang === 'zh' 
    ? "Output 'name' in Simplified Chinese." 
    : "Output 'name' in English.";

  const prompt = `
    Analyze the food described here: "${text}".
    Estimate the nutritional content.
    Return a JSON object with:
    - name: A short display name (e.g. "Grilled Chicken Salad")
    - calories: number (kcal)
    - protein: number (grams)
    - carbs: number (grams)
    - fat: number (grams)
    
    ${langInstruction}
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
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fat: { type: Type.NUMBER },
          },
          required: ["name", "calories", "protein", "carbs", "fat"],
        }
      }
    });

    const data = JSON.parse(response.text || "{}");
    return {
      id: Date.now().toString(),
      timestamp: Date.now(),
      name: data.name || "Food Item",
      calories: data.calories || 0,
      protein: data.protein || 0,
      carbs: data.carbs || 0,
      fat: data.fat || 0,
    };
  } catch (error) {
    console.error("Error analyzing food:", error);
    throw new Error("Could not analyze food.");
  }
};
