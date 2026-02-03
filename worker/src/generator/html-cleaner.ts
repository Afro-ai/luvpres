export function cleanHtml(raw: string): string {
  let html = raw;
  
  // 1. Remove markdown code blocks if present
  html = html.replace(/^```html\s*/i, '');
  html = html.replace(/```\s*$/i, '');
  html = html.trim();
  
  // 2. Ensure starts with DOCTYPE
  if (!html.toLowerCase().startsWith('<!doctype')) {
    const doctypeIndex = html.toLowerCase().indexOf('<!doctype');
    if (doctypeIndex > 0) {
      html = html.substring(doctypeIndex);
    } else {
      html = '<!DOCTYPE html>\n' + html;
    }
  }
  
  return html;
}

export function validateHtml(html: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!html.includes('<html')) errors.push('Missing <html> tag');
  if (!html.includes('<body')) errors.push('Missing <body> tag');
  if (!html.includes('<style')) errors.push('Missing <style> tag');
  if (!html.includes('<script')) errors.push('Missing <script> tag');
  
  return {
    valid: errors.length === 0,
    errors
  };
}

