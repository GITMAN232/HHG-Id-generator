export function generatePassportNumber(name: string): string {
  const prefix = 'HHG26';
  const cleanName = (name || 'BUILDER').toUpperCase().replace(/[^A-Z]/g, '');
  const hash = Math.abs(
    cleanName.split('').reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
  );
  const code = (hash % 8999 + 1000).toString();
  const suffix = String.fromCharCode(65 + (hash % 26)) + String.fromCharCode(65 + ((hash * 7) % 26));
  return `${prefix}-${code}-${suffix}`;
}

export function generateDNAStats(role: string, stack: string) {
  const combined = (role + stack).toLowerCase();
  const hash = combined.length * 13;
  const baseBuild = combined.includes('rust') || combined.includes('python') || combined.includes('code') ? 92 : 86;
  const baseHack = combined.includes('cyber') || combined.includes('sec') || combined.includes('ai') ? 94 : 88;
  const baseShip = combined.includes('react') || combined.includes('ship') || combined.includes('web') ? 95 : 90;
  const baseCreate = combined.includes('design') || combined.includes('ui') || combined.includes('art') ? 96 : 91;

  return {
    build: Math.min(99, Math.max(70, baseBuild + (hash % 7) - 3)),
    hack: Math.min(99, Math.max(70, baseHack + ((hash * 3) % 7) - 3)),
    ship: Math.min(99, Math.max(70, baseShip + ((hash * 5) % 7) - 3)),
    create: Math.min(99, Math.max(70, baseCreate + ((hash * 9) % 7) - 3)),
  };
}

export function generateLoadout(stack: string): string[] {
  const items: string[] = [];
  const lower = (stack || '').toLowerCase();

  if (lower.includes('python')) items.push('⚡ PYTHON');
  else if (lower.includes('rust')) items.push('🦀 RUST');
  else if (lower.includes('go') || lower.includes('golang')) items.push('🐹 GOLANG');
  else if (lower.includes('ts') || lower.includes('typescript')) items.push('📘 TYPESCRIPT');
  else items.push('💻 CODE');

  if (lower.includes('ai') || lower.includes('llm') || lower.includes('gpt')) items.push('🧠 AI MODEL');
  else if (lower.includes('react') || lower.includes('vue') || lower.includes('ui')) items.push('✨ SHADCN / TAILWIND');
  else if (lower.includes('cyber') || lower.includes('sec')) items.push('🛡️ CYBERSEC');
  else items.push('🛠️ VS CODE');

  if (lower.includes('lo-fi') || lower.includes('music')) items.push('🎧 LO-FI CHILL');
  else items.push('☕ GOA ESPRESSO');

  items.push('🏖️ BEACH VIBES');

  return items.slice(0, 4);
}
