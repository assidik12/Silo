import React from "react";
import { render, screen } from "@testing-library/react";
import MentalEnergyWidget from "@/components/dashboard/mental-energy-widget";
import { JournalEntry } from "@/types";

const makeEntry = (score: number): JournalEntry => ({
  id: "e-1",
  user_id: "u-1",
  raw_text: "test",
  ai_reflection: "test",
  sentiment_score: score,
  created_at: new Date().toISOString(),
});

describe("MentalEnergyWidget Component", () => {
  // UI-16: Tidak ada entri — tampilkan default (score 5 = "Doing Okay")
  it("UI-16: recentEntries kosong → tampilkan kategori default (Doing Okay)", () => {
    render(<MentalEnergyWidget recentEntries={[]} />);
    expect(screen.getByText(/doing okay/i)).toBeInTheDocument();
  });

  // UI-17: Skor tinggi — "On Fire"
  it("UI-17: score = 9 → tampilkan 'On Fire! 🔥'", () => {
    render(<MentalEnergyWidget recentEntries={[makeEntry(9)]} />);
    expect(screen.getByText(/on fire/i)).toBeInTheDocument();
  });

  // UI-18: Skor rendah — "Take a Breath"
  it("UI-18: score = 2 → tampilkan 'Take a Breath 💙'", () => {
    render(<MentalEnergyWidget recentEntries={[makeEntry(2)]} />);
    expect(screen.getByText(/take a breath/i)).toBeInTheDocument();
  });

  // UI-19: Label skor tidak muncul jika tidak ada entri
  it("UI-19: recentEntries kosong → label 'Score: X/10' tidak muncul", () => {
    render(<MentalEnergyWidget recentEntries={[]} />);
    expect(screen.queryByText(/score:/i)).not.toBeInTheDocument();
  });

  // UI-20: Label skor muncul jika ada entri
  it("UI-20: Saat ada entri → label 'Score: 7/10' muncul", () => {
    render(<MentalEnergyWidget recentEntries={[makeEntry(7)]} />);
    expect(screen.getByText(/score: 7\/10/i)).toBeInTheDocument();
  });
});
