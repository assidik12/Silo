import { calculateXp } from '@/utils/gamification';

describe('XP Calculator', () => {
  it('Selesai > 12 jam sebelum deadline = 100% EXP (Max 50)', () => {
    const deadlineTime = new Date('2026-05-05T20:00:00.000Z');
    const completedAt = new Date('2026-05-05T06:00:00.000Z'); // 14 hours early

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, deadlineTime);
    expect(earnedXp).toBe(50);
    expect(isEarlyBonus).toBe(true);
  });

  it('Selesai = 12 jam sebelum deadline = 100% EXP (Max 50)', () => {
    const deadlineTime = new Date('2026-05-05T20:00:00.000Z');
    const completedAt = new Date('2026-05-05T08:00:00.000Z'); // exactly 12 hours early

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, deadlineTime);
    expect(earnedXp).toBe(50);
    expect(isEarlyBonus).toBe(true);
  });

  it('Selesai < 12 jam sebelum deadline = 50% EXP (Max 25)', () => {
    const deadlineTime = new Date('2026-05-05T14:00:00.000Z');
    const completedAt = new Date('2026-05-05T09:00:00.000Z'); // 5 hours early

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, deadlineTime);
    expect(earnedXp).toBe(25);
    expect(isEarlyBonus).toBe(false);
  });

  it('Selesai tepat saat deadline = 50% EXP (Max 25)', () => {
    const deadlineTime = new Date('2026-05-05T12:00:00.000Z');
    const completedAt = new Date('2026-05-05T12:00:00.000Z'); // exactly on time

    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, deadlineTime);
    expect(earnedXp).toBe(25);
    expect(isEarlyBonus).toBe(false);
  });

  it('Terlambat & Hanya Sebagian Selesai = (Jumlah sub-task selesai * 5%) + (10% dari EXP sub-task)', () => {
    const deadlineTime = new Date('2026-05-05T10:00:00.000Z');
    const completedAt = new Date('2026-05-05T12:00:00.000Z'); // 2 hours late
    
    // total subtasks = 4. done = 2.
    // MAX_XP = 50
    // expSubTask = 50 / 4 = 12.5
    // calc = (2 * 2.5) + (0.10 * 12.5 * 2) = 5 + 2.5 = 7.5 -> rounded = 8
    const { earnedXp, isEarlyBonus } = calculateXp(completedAt, deadlineTime, 2, 4);

    expect(earnedXp).toBe(8); // Math.round(7.5) = 8
    expect(isEarlyBonus).toBe(false);
  });

  it('Terlambat & Hanya Sebagian Selesai tidak boleh lebih dari 25% EXP utama', () => {
    const deadlineTime = new Date('2026-05-05T10:00:00.000Z');
    const completedAt = new Date('2026-05-05T12:00:00.000Z'); // 2 hours late
    
    // total subtasks = 4. done = 4.
    // expSubTask = 50 / 4 = 12.5
    // calc = (4 * 2.5) + (0.10 * 12.5 * 4) = 10 + 5 = 15
    // max allowed = 0.25 * 50 = 12.5 -> rounded = 13
    const { earnedXp } = calculateXp(completedAt, deadlineTime, 4, 4);

    expect(earnedXp).toBe(13); // Math.round(12.5) = 13
  });

  it('Tidak ada progres saat deadline = 0 EXP', () => {
    const deadlineTime = new Date('2026-05-05T10:00:00.000Z');
    const completedAt = new Date('2026-05-05T12:00:00.000Z'); // 2 hours late
    
    // 0 subtasks done
    const { earnedXp } = calculateXp(completedAt, deadlineTime, 0, 4);

    expect(earnedXp).toBe(0);
  });
});
