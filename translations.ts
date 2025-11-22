
export type Language = 'en' | 'zh';

export const translations = {
  en: {
    appTitle: "FitPath AI",
    step: "Step",
    of: "of",
    back: "Back",
    continue: "Continue",
    generate: "Generate My Plan",
    analyzing: "Analyzing...",
    completeDay: "Complete Day",
    
    // Onboarding
    whoAreYou: "Who are you?",
    whoAreYouDesc: "Let's get to know you better.",
    yourName: "Your Name",
    gender: "Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    profession: "Profession",
    professionDesc: "We tailor your plan to your work schedule.",
    yourGoals: "Your Goals",
    yourGoalsDesc: "Where are you now, and where are we going?",
    height: "Height (cm)",
    currentWeight: "Current (kg)",
    targetWeight: "Target Weight (kg)",
    age: "Age",
    activityLevel: "Activity Level",
    sedentary: "Sedentary",
    light: "Light",
    moderate: "Moderate",
    active: "Active",
    dailyRoutine: "Daily Routine",
    dailyRoutineDesc: "Help us build your schedule.",
    wakeUp: "Wake Up",
    sleep: "Sleep",
    dietary: "Dietary Preferences (Optional)",
    
    // Dashboard
    todaySchedule: "Today's Schedule",
    currentGoal: "Current Goal",
    priority: "Priority",
    editProfile: "Edit Profile",
    designing: "Designing Your Day...",
    designingDesc: "Analyzing your profession and goals",
    retry: "Retry",
    noPlan: "No plan generated yet.",
    endDay: "End Day & Review Check-in",
    morningBriefing: "Morning Briefing",
    
    // Nutrition
    addFood: "Log Meal",
    calories: "Calories",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    whatDidYouEat: "What did you eat?",
    describeMeal: "e.g., 2 eggs and a slice of toast",
    analyzeFood: "Analyze Food",
    saveLog: "Save to Log",
    dailyIntake: "Daily Intake",
    goal: "Goal",
    
    // Review
    eveningCheckin: "Evening Check-in",
    tasksCompleted: "You completed {completed} out of {total} tasks today ({percent}%).",
    howDidYouFeel: "How did you feel today?",
    dayComplete: "Day Complete!",
    summaryTitle: "Here is your summary.",
    dailySummary: "Daily Summary",
    planAdjustment: "Plan Adjustment",
    startTomorrow: "Start Tomorrow's Plan",
    
    // Quick Tags
    tags: ["Feeling Great", "Too Hungry", "Energetic", "Tired", "Workout was hard", "Ate too much"],
    
    // Fallback
    fallbackTitle: "Morning Water",
    fallbackDesc: "Drink 500ml of water immediately after waking up.",
  },
  zh: {
    appTitle: "FitPath AI",
    step: "第",
    of: "步 / 共",
    back: "上一步",
    continue: "下一步",
    generate: "生成我的计划",
    analyzing: "分析中...",
    completeDay: "完成今日",
    
    // Onboarding
    whoAreYou: "基本信息",
    whoAreYouDesc: "让我们了解一下您。",
    yourName: "您的称呼",
    gender: "性别",
    male: "男",
    female: "女",
    other: "其他",
    profession: "职业",
    professionDesc: "我们将根据您的工作安排定制计划。",
    yourGoals: "身体目标",
    yourGoalsDesc: "您的现状与目标。",
    height: "身高 (cm)",
    currentWeight: "当前体重 (kg)",
    targetWeight: "目标体重 (kg)",
    age: "年龄",
    activityLevel: "日常活动量",
    sedentary: "久坐 (极少运动)",
    light: "轻度 (偶尔运动)",
    moderate: "中度 (规律运动)",
    active: "重度 (体力劳动/高强运动)",
    dailyRoutine: "作息时间",
    dailyRoutineDesc: "帮助我们规划您的时间表。",
    wakeUp: "起床时间",
    sleep: "睡觉时间",
    dietary: "饮食偏好 (选填)",
    
    // Dashboard
    todaySchedule: "今日计划",
    currentGoal: "当前目标",
    priority: "重点",
    editProfile: "编辑档案",
    designing: "正在规划您的一天...",
    designingDesc: "正在根据您的职业和目标进行分析",
    retry: "重试",
    noPlan: "尚未生成计划。",
    endDay: "结束今日 & 晚间打卡",
    morningBriefing: "早间简报",
    
    // Nutrition
    addFood: "记录饮食",
    calories: "卡路里",
    protein: "蛋白质",
    carbs: "碳水",
    fat: "脂肪",
    whatDidYouEat: "您吃了什么？",
    describeMeal: "如：一碗牛肉面和一个鸡蛋",
    analyzeFood: "分析营养",
    saveLog: "保存记录",
    dailyIntake: "今日摄入",
    goal: "目标",
    
    // Review
    eveningCheckin: "晚间打卡",
    tasksCompleted: "您完成了 {total} 项任务中的 {completed} 项 ({percent}%)。",
    howDidYouFeel: "今天感觉如何？",
    dayComplete: "今日已结！",
    summaryTitle: "这是您的今日总结。",
    dailySummary: "每日总结",
    planAdjustment: "计划调整建议",
    startTomorrow: "开启明天的计划",
    
    // Quick Tags
    tags: ["感觉很棒", "太饿了", "精力充沛", "很累", "运动量太大", "吃太多了"],
    
    // Fallback
    fallbackTitle: "晨间饮水",
    fallbackDesc: "起床后立即饮用 500ml 温水。",
  }
};
