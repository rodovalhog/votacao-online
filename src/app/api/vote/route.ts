import { NextRequest, NextResponse } from 'next/server';
import { db, initDb } from '@/db';
import { candidates } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

export async function POST(req: NextRequest) {
  try {
    await initDb();
    const { candidate } = await req.json().catch(() => ({}));

    if (candidate !== 'lula' && candidate !== 'flavio') {
      return NextResponse.json({ error: 'Candidato inválido' }, { status: 400 });
    }

    // Checa se o PC ou celular já votou pelo cookie
    const jaVotou = req.cookies.get('voto_registrado')?.value;
    if (jaVotou) {
      return NextResponse.json(
        { error: 'Você já votou! Apenas 1 voto por aparelho é permitido.' },
        { status: 400 }
      );
    }

    // Apenas incrementa o contador da linha do candidato (A TABELA NÃO CRESCE!)
    await db
      .update(candidates)
      .set({ votes: sql`${candidates.votes} + 1` })
      .where(eq(candidates.id, candidate));

    // Busca os totais atualizados para retornar instantaneamente ao eleitor
    const rows = await db.select().from(candidates);
    let lula = 0;
    let flavio = 0;
    for (const r of rows) {
      if (r.id === 'lula') lula = Number(r.votes) || 0;
      if (r.id === 'flavio') flavio = Number(r.votes) || 0;
    }

    // Retorna a resposta com a contagem atualizada e grava a flag no cookie
    const response = NextResponse.json({
      success: true,
      votedFor: candidate,
      lula,
      flavio,
      total: lula + flavio,
    });

    response.cookies.set('voto_registrado', candidate, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      httpOnly: false,
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Erro em POST /api/vote:', error);
    return NextResponse.json({ error: 'Erro ao registrar voto' }, { status: 500 });
  }
}
