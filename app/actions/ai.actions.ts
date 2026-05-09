'use server';

export async function generateTaskBreakdown(title: string, description: string | null): Promise<string[]> {
  // TODO: Replace with actual LLM call (e.g., Gemini or OpenAI)
  // Prompt: "Break down this task into 3-5 manageable subtasks. Use a casual Gen Z vibe."
  
  // Simulate AI processing time
  await new Promise(resolve => setTimeout(resolve, 2000));

  return [
    `Googling tipis-tipis cari referensi buat "${title}" 🔍`,
    `Bikin kerangka kasarnya dulu, no overthinking ✍️`,
    `Drafting isinya, yang penting kelar dulu bos 🏃‍♂️`,
    `Review bentar sambil ngopi biar makin mantap ☕`,
    `Submit! You nailed it ngab! 🎉`
  ];
}
