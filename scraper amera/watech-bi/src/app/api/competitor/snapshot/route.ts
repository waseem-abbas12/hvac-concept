import { NextRequest, NextResponse } from 'next/server';
import { isSafePublicUrl, parseCompetitorHtml } from '@/lib/engines/competitorChangeEngine';
import type { CompetitorSnapshot } from '@/types';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { watchId, url } = body;

    if (!watchId || !url) {
      return NextResponse.json({ error: 'watchId and url are required' }, { status: 400 });
    }

    // SSRF Guardrail
    const safetyCheck = isSafePublicUrl(url);
    if (!safetyCheck.safe) {
      return NextResponse.json(
        { error: `URL blocked by SSRF Security Policy: ${safetyCheck.reason}` },
        { status: 400 }
      );
    }

    let httpStatus = 200;
    let htmlContent = '';

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) WatechCompetitorMonitor/1.0 (Business Intelligence Surveillance)',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: controller.signal,
        redirect: 'follow',
      });

      clearTimeout(timeoutId);
      httpStatus = res.status;
      if (res.ok) {
        // Read at most 500KB to prevent memory exhaustion
        const text = await res.text();
        htmlContent = text.slice(0, 500000);
      } else {
        htmlContent = `<html><head><title>HTTP Error ${res.status}</title></head><body><h1>HTTP ${res.status}</h1></body></html>`;
      }
    } catch (fetchErr: any) {
      console.warn(`Competitor fetch error for ${url}:`, fetchErr.message);
      httpStatus = 503;
      htmlContent = `<html><head><title>Unreachable Host</title></head><body><h1>Connection Failed: ${fetchErr.name === 'AbortError' ? 'Timeout' : 'Unreachable'}</h1></body></html>`;
    }

    const snapshot: CompetitorSnapshot = parseCompetitorHtml(htmlContent, watchId, httpStatus);

    return NextResponse.json({ success: true, snapshot });
  } catch (error: any) {
    console.error('Competitor snapshot error:', error);
    return NextResponse.json({ error: error.message || 'Snapshot crawl failure' }, { status: 500 });
  }
}
