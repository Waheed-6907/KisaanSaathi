import { NextRequest, NextResponse } from 'next/server';
import { PricingAgent } from '@/lib/agent/pricing-agent';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message || body.query || '';
    const history = body.history || [];

    if (!message.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message cannot be empty' },
        { status: 400 }
      );
    }

    const agent = new PricingAgent();
    const result = await agent.processQuery(message, history);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      toolExecutions: result.toolExecutions,
      provenance: result.provenance,
      timestamp: new Date().toISOString()
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
