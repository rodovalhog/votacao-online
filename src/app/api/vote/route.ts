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

    // Retorna a resposta e grava a flag no cookie do navegador por 1 ano
    const response = NextResponse.json({ success: true, votedFor: candidate });
    response.cookies.set('voto_registrado', candidate, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 ano
      httpOnly: false, // Permite checar também via JS/localStorage
      sameSite: 'lax',
    });

    return response;
  } catch (error: any) {
    console.error('Erro em POST /api/vote:', error);
    return NextResponse.json({ error: 'Erro ao registrar voto' }, { status: 500 });
  }
}
