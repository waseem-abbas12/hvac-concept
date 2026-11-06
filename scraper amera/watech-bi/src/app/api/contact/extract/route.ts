import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { url, businessId } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = `https://${targetUrl}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    let html = '';
    let fetchedUrl = targetUrl;
    try {
      const res = await fetch(targetUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Watech-ContactEngine/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });
      clearTimeout(timeoutId);
      html = await res.text();
      fetchedUrl = res.url || targetUrl;
    } catch (err: any) {
      clearTimeout(timeoutId);
      return NextResponse.json({
        error: `Could not reach ${targetUrl}: ${err.message || 'Connection timeout'}`,
      }, { status: 502 });
    }

    // 1. Title
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const pageTitle = titleMatch ? titleMatch[1].trim() : '';

    // 2. Email extraction
    const rawEmails = html.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi) || [];
    const validEmails = Array.from(new Set(
      rawEmails
        .map(e => e.toLowerCase())
        .filter(e => !e.endsWith('.png') && !e.endsWith('.jpg') && !e.endsWith('.webp') && !e.includes('example.com') && !e.includes('sentry.io'))
    ));

    // 3. Phone extraction
    const telMatches = (html.match(/href=["']tel:([^"']*)["']/gi) || []).map(t =>
      t.replace(/href=["']tel:/i, '').replace(/["']/g, '').trim()
    );
    const patternPhones = html.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
    const allPhones = Array.from(new Set([...telMatches, ...patternPhones])).slice(0, 5);

    // 4. Contact page links
    const internalLinks = (html.match(/href=["']([^"']*)["']/gi) || []).map(l =>
      l.replace(/href=["']/i, '').replace(/["']/g, '')
    );
    const contactLinks = internalLinks.filter(l =>
      /contact|about|team|leadership|staff|locations/i.test(l)
    ).slice(0, 5);

    // 5. Leadership / staff candidates found in text
    const staffCandidates: { name: string; title: string; excerpt: string }[] = [];
    const leaderPatterns = [
      /([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})\s*[-–,]\s*(President|Owner|Founder|CEO|General Manager|Managing Director|Director of Operations|Chief Executive Officer)/g,
      /(President|Owner|Founder|CEO|General Manager)\s*[-–,:]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,2})/g,
    ];

    for (const pat of leaderPatterns) {
      let match;
      while ((match = pat.exec(html)) !== null && staffCandidates.length < 5) {
        if (match[1] && match[2]) {
          const isNameFirst = !/President|Owner|Founder|CEO|General Manager/i.test(match[1]);
          const name = isNameFirst ? match[1].trim() : match[2].trim();
          const title = isNameFirst ? match[2].trim() : match[1].trim();
          if (name.length > 3 && !staffCandidates.some(c => c.name === name)) {
            staffCandidates.push({
              name,
              title,
              excerpt: match[0],
            });
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      url: fetchedUrl,
      pageTitle,
      emails: validEmails,
      phones: allPhones,
      contactPageLinks: contactLinks,
      staffCandidates,
      retrievalDate: new Date().toISOString().split('T')[0],
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Contact extraction failed' }, { status: 500 });
  }
}
