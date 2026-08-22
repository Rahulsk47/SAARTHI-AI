import * as cheerio from 'cheerio';

export interface ScrapedData {
  url: string;
  title: string;
  lang: string | null;
  metaDescription: string;
  headings: { level: string; text: string }[];
  imagesTotal: number;
  imagesMissingAlt: number;
  imagesDetails: { src?: string; alt?: string }[];
  inputsTotal: number;
  inputsMissingLabels: number;
  buttonsMissingText: number;
  linksTotal: number;
  linksEmpty: number;
  hasMainLandmark: boolean;
  hasNavLandmark: boolean;
  hasFooterLandmark: boolean;
  hasAriaLive: boolean;
  rawTextSample: string;
  interactiveElements: { tag: string; text: string; role?: string }[];
}

export async function scrapeWebsite(targetUrl: string): Promise<ScrapedData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const response = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SAARTHI-Accessibility-Auditor/1.0',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Failed to fetch URL with HTTP status ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const title = $('title').first().text().trim() || $('h1').first().text().trim() || targetUrl;
    const lang = $('html').attr('lang') || null;
    const metaDescription = $('meta[name="description"]').attr('content')?.trim() || '';

    // Headings
    const headings: { level: string; text: string }[] = [];
    $('h1, h2, h3, h4, h5, h6').each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        headings.push({ level: el.tagName.toLowerCase(), text: text.slice(0, 120) });
      }
    });

    // Images
    let imagesTotal = 0;
    let imagesMissingAlt = 0;
    const imagesDetails: { src?: string; alt?: string }[] = [];
    $('img').each((_, el) => {
      imagesTotal++;
      const alt = $(el).attr('alt');
      const src = $(el).attr('src');
      if (alt === undefined || alt === null || alt.trim() === '') {
        imagesMissingAlt++;
      }
      if (imagesDetails.length < 10) {
        imagesDetails.push({ src: src ? src.slice(0, 100) : undefined, alt });
      }
    });

    // Inputs & Forms
    let inputsTotal = 0;
    let inputsMissingLabels = 0;
    $('input, select, textarea').each((_, el) => {
      const type = $(el).attr('type');
      if (type === 'hidden' || type === 'submit' || type === 'button') return;
      inputsTotal++;
      const id = $(el).attr('id');
      const ariaLabel = $(el).attr('aria-label') || $(el).attr('aria-labelledby');
      const hasAssociatedLabel = id ? $(`label[for="${id}"]`).length > 0 : false;
      const wrappedByLabel = $(el).closest('label').length > 0;
      if (!ariaLabel && !hasAssociatedLabel && !wrappedByLabel) {
        inputsMissingLabels++;
      }
    });

    // Buttons
    let buttonsMissingText = 0;
    $('button, [role="button"]').each((_, el) => {
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label') || $(el).attr('aria-labelledby');
      const titleAttr = $(el).attr('title');
      if (!text && !ariaLabel && !titleAttr && $(el).find('img[alt]').length === 0) {
        buttonsMissingText++;
      }
    });

    // Links
    let linksTotal = 0;
    let linksEmpty = 0;
    $('a[href]').each((_, el) => {
      linksTotal++;
      const text = $(el).text().trim();
      const ariaLabel = $(el).attr('aria-label');
      const titleAttr = $(el).attr('title');
      if (!text && !ariaLabel && !titleAttr && $(el).find('img[alt]').length === 0) {
        linksEmpty++;
      }
    });

    // Landmarks
    const hasMainLandmark = $('main, [role="main"]').length > 0;
    const hasNavLandmark = $('nav, [role="navigation"]').length > 0;
    const hasFooterLandmark = $('footer, [role="contentinfo"]').length > 0;
    const hasAriaLive = $('[aria-live]').length > 0;

    // Clean text sample for summarization / transformation
    $('script, style, noscript, svg, iframe').remove();
    const rawTextSample = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 4000);

    // Interactive elements sample
    const interactiveElements: { tag: string; text: string; role?: string }[] = [];
    $('a, button, input[type="submit"]').slice(0, 15).each((_, el) => {
      const text = $(el).text().trim() || $(el).attr('aria-label') || $(el).attr('value') || '';
      if (text) {
        interactiveElements.push({
          tag: el.tagName.toLowerCase(),
          text: text.slice(0, 80),
          role: $(el).attr('role'),
        });
      }
    });

    return {
      url: targetUrl,
      title,
      lang,
      metaDescription,
      headings: headings.slice(0, 15),
      imagesTotal,
      imagesMissingAlt,
      imagesDetails,
      inputsTotal,
      inputsMissingLabels,
      buttonsMissingText,
      linksTotal,
      linksEmpty,
      hasMainLandmark,
      hasNavLandmark,
      hasFooterLandmark,
      hasAriaLive,
      rawTextSample,
      interactiveElements,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}
