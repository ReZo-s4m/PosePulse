import { NextResponse } from "next/server";

const demoSessions = [
  {
    id: 'demo-1',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0],
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    duration: 1800,
    totalReps: 120,
    exerciseName: 'Bicep Curl',
    reps: [{ id: 'r1', exerciseName: 'Bicep Curl', reps: 120, timestamp: new Date().toISOString(), sessionId: 'demo-1' }]
  },
  {
    id: 'demo-2',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    duration: 1500,
    totalReps: 95,
    exerciseName: 'Bicep Curl',
    reps: [{ id: 'r2', exerciseName: 'Bicep Curl', reps: 95, timestamp: new Date().toISOString(), sessionId: 'demo-2' }]
  },
  {
    id: 'demo-3',
    date: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString().split('T')[0],
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    duration: 2100,
    totalReps: 140,
    exerciseName: 'Bicep Curl',
    reps: [{ id: 'r3', exerciseName: 'Bicep Curl', reps: 140, timestamp: new Date().toISOString(), sessionId: 'demo-3' }]
  },
];

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Use demo data
    const todayDemo = demoSessions.filter(s => s.date === today);
    const todaysTotal = todayDemo.reduce((sum: number, s) => sum + (s.totalReps || 0), 0);
    return NextResponse.json({ ok: true, data: { todaySessions: todayDemo, recent: demoSessions, todaysTotal } });
  } catch (err) {
    console.error('Error fetching sessions:', err);
    return NextResponse.json({ ok: false, error: 'Failed to load sessions' }, { status: 500 });
  }
}
