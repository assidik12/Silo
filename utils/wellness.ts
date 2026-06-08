export function getAffirmationCategory(score: number): { category: string; affirmation: string; color: string } {
  if (score >= 8) {
    return {
      category: "On Fire! 🔥",
      affirmation: "Energi kamu lagi bagus banget! Pertahankan momentum ini dan jangan lupa istirahat secukupnya.",
      color: "text-green-500",
    };
  } else if (score >= 5) {
    return {
      category: "Doing Okay 🍃",
      affirmation: "Kamu berjalan di kecepatan yang pas. Gak usah terlalu keras sama diri sendiri, you're doing great.",
      color: "text-blue-500",
    };
  } else {
    return {
      category: "Take a Breath 💙",
      affirmation: "Lagi berat ya fasenya? It's okay not to be okay. Istirahat sejenak, dunia gak akan runtuh kok kalau kamu rehat sebentar.",
      color: "text-red-400",
    };
  }
}

export function getRecommendedPomodoro(score: number): { workMinutes: number; breakMinutes: number } {
  if (score >= 8) {
    return { workMinutes: 25, breakMinutes: 5 }; // Normal
  } else if (score >= 5) {
    return { workMinutes: 20, breakMinutes: 5 }; // Sedikit rileks
  } else {
    return { workMinutes: 15, breakMinutes: 10 }; // Sedang stres, fokus sebentar, istirahat lama
  }
}
