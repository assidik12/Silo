import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const name = searchParams.get('name') || 'Dojo User';
    const major = searchParams.get('major') || 'Mahasiswa';
    const xp = searchParams.get('xp') || '0';
    const streak = searchParams.get('streak') || '0';
    const learningType = searchParams.get('learningType') || '';

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#4f46e5',
            backgroundImage: 'linear-gradient(to bottom right, #4f46e5, #7c3aed, #c026d3)',
            padding: '40px',
            color: 'white',
            fontFamily: 'sans-serif',
          }}
        >
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '40px', position: 'absolute', top: '40px', left: '40px' }}>
            <div style={{ width: '40px', height: '40px', backgroundColor: 'white', borderRadius: '10px', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#4f46e5', fontSize: '24px', fontWeight: 'bold', fontStyle: 'italic' }}>D</span>
            </div>
            <span style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-1px' }}>DoJo</span>
          </div>

          <div style={{ fontSize: '12px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '2px', backgroundColor: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '100px', marginBottom: '20px' }}>
            Achievement Unlocked
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '64px', fontWeight: '900', textAlign: 'center', lineHeight: '1.1' }}>
              {name}
            </div>
            <div style={{ fontSize: '24px', opacity: 0.9, fontWeight: 'bold' }}>
              🎓 {major}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#e0e7ff', textTransform: 'uppercase', marginBottom: '5px' }}>Total XP</div>
              <div style={{ fontSize: '48px', fontWeight: '900' }}>🏆 {xp}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: '20px 40px', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.2)' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#ffedd5', textTransform: 'uppercase', marginBottom: '5px' }}>Streak</div>
              <div style={{ fontSize: '48px', fontWeight: '900' }}>🔥 {streak}</div>
            </div>
          </div>

          <div style={{ marginTop: '40px', display: 'flex', gap: '15px' }}>
             <div style={{ fontSize: '32px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🎯</div>
             {parseInt(streak) >= 3 && <div style={{ fontSize: '32px' }}>🔥</div>}
             {parseInt(xp) >= 1000 && <div style={{ fontSize: '32px' }}>👑</div>}
             {learningType === 'ngebut' && <div style={{ fontSize: '32px' }}>⚡</div>}
          </div>

          <div style={{ position: 'absolute', bottom: '40px', fontSize: '12px', opacity: 0.6, fontWeight: 'bold', letterSpacing: '4px' }}>
            DOJO-APP.VERCEL.APP
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.log(`${e.message}`);
    return new Response(`Failed to generate the image`, {
      status: 500,
    });
  }
}
