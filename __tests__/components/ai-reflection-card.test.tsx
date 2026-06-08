import React from "react";
import { render, screen } from "@testing-library/react";
import AiReflectionCard from "@/components/wellness/ai-reflection-card";

describe("AiReflectionCard Component", () => {
  // UI-11: Teks refleksi ditampilkan
  it("UI-11: Menampilkan teks refleksi dari props", () => {
    render(<AiReflectionCard reflection="Tarik napas, kamu sudah melakukan yang terbaik." persona="mindful" />);
    expect(screen.getByText(/tarik napas/i)).toBeInTheDocument();
  });

  // UI-12: Persona Mindful — judul benar
  it("UI-12: Persona 'mindful' → menampilkan 'Mindful Reflection 🌿'", () => {
    render(<AiReflectionCard reflection="test" persona="mindful" />);
    expect(screen.getByText(/mindful reflection/i)).toBeInTheDocument();
  });

  // UI-13: Persona Savage — judul benar
  it("UI-13: Persona 'savage' → menampilkan 'Savage Truth 🔥'", () => {
    render(<AiReflectionCard reflection="test" persona="savage" />);
    expect(screen.getByText(/savage truth/i)).toBeInTheDocument();
  });

  // UI-14: Persona Aesthetic — judul benar
  it("UI-14: Persona 'aesthetic' → menampilkan 'Aesthetic Notes ✨'", () => {
    render(<AiReflectionCard reflection="test" persona="aesthetic" />);
    expect(screen.getByText(/aesthetic notes/i)).toBeInTheDocument();
  });

  // UI-15: Styling berbeda per persona (class warna di container)
  it("UI-15: Setiap persona memiliki class warna yang berbeda di container", () => {
    const { rerender, container } = render(
      <AiReflectionCard reflection="test" persona="mindful" />
    );
    const mindfulClass = (container.firstChild as HTMLElement)?.className ?? "";

    rerender(<AiReflectionCard reflection="test" persona="savage" />);
    const savageClass = (container.firstChild as HTMLElement)?.className ?? "";

    rerender(<AiReflectionCard reflection="test" persona="aesthetic" />);
    const aestheticClass = (container.firstChild as HTMLElement)?.className ?? "";

    expect(mindfulClass).not.toEqual(savageClass);
    expect(savageClass).not.toEqual(aestheticClass);
    expect(mindfulClass).not.toEqual(aestheticClass);
  });
});
