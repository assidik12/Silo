import { generateFastResponse } from "./index";
import { UserProfile } from "@/types";

export interface JournalReflectionResponse {
  reflection: string;
  sentiment_score: number;
}

export async function generateJournalReflection(
  userProfile: Partial<UserProfile>,
  rawText: string
): Promise<JournalReflectionResponse | null> {
  const { 
    name = 'Mahasiswa', 
    major = 'nggak disebutin', 
    semester = 'nggak disebutin', 
    ai_persona = 'mindful' 
  } = userProfile;

  // Prompt Tunneling: Inject user context
  const contextIntro = `Kamu adalah teman ngobrol/asisten produktivitas untuk seorang mahasiswa bernama ${name}. 
Jurusan mereka: ${major}. Semester: ${semester}.
Tugas kamu adalah mendengarkan curhatan atau "brain-dump" mereka, dan merespons dengan empati serta membantu menstrukturkan pikiran mereka yang mungkin sedang overwhelmed.`;

  // Persona Tunneling: Adjust the tone based on selected persona
  let personaInstruction = "";
  if (ai_persona === 'aesthetic') {
    personaInstruction = "Gunakan nada bicara yang puitis, tenang, chill, dan aesthetic. Gunakan kata-kata yang menenangkan seperti 'tarik napas', 'fase', dll.";
  } else if (ai_persona === 'savage') {
    personaInstruction = "Gunakan nada bicara yang sedikit savage, blak-blakan, 'roasting' tapi produktif layaknya mentor galak yang peduli. Tampar mereka dengan realita tapi tetap kasih solusi.";
  } else {
    // mindful
    personaInstruction = "Gunakan nada bicara yang suportif, mindful, empati penuh, dan sangat pengertian. Berikan afirmasi positif yang hangat.";
  }

  const systemInstruction = `
${contextIntro}

Gaya Bahasa:
${personaInstruction}

Instruksi Output:
Kamu harus merespons dalam format JSON dengan struktur berikut:
{
  "reflection": "Teks balasan/nasihat/refleksi kamu untuk mahasiswa tersebut.",
  "sentiment_score": [angka 1-10 yang merepresentasikan kondisi mental/emosi dari curhatan mereka. 1 = Sangat stres/depresi/overwhelmed, 10 = Sangat bahagia/semangat/produktif]
}
`;

  try {
    const responseJson = await generateFastResponse(rawText, systemInstruction, true);
    if (!responseJson) return null;

    const parsed = JSON.parse(responseJson) as JournalReflectionResponse;
    return parsed;
  } catch (error) {
    console.error("Error generating journal reflection:", error);
    return null;
  }
}
