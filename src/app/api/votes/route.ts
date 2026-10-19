import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/db';
import { candidates } from '@/db/schema';

export async function GET(req: NextRequest) {
  try {
    await initDb();

    // Busca as duas linhas da tabela
    const rows = await db.select().from(candidates);

    let lula = 0;
    let flavio = 0;

    for (const r of rows) {
      if (r.id === 'lula') lula = Number(r.votes) || 0;
      if (r.id === 'flavio') flavio = Number(r.votes) || 0;
    }

    // Checa a flag no cookie do navegador (bloqueio do PC / celular)
    const cookieVote = req.cookies.get('voto_registrado')?.value as 'lula' | 'flavio' | undefined;

    return NextResponse.json({
      lula,
      flavio,
      total: lula + flavio,
      hasVoted: Boolean(cookieVote),
      votedFor: cookieVote || null,
    });
  } catch (error: unknown) {
    console.error('Erro em GET /api/votes:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Erro ao buscar votos', details: msg }, { status: 500 });
  }
}
