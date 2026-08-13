/**
 * captionGenerator.ts — Team-Aware Dynamic X (Twitter) Caption Engine
 * 
 * Generates witty, personality-driven, highly shareable X post captions 
 * based on user Name, Role, Stack, optional Team Name, and Loadout.
 * Completely free of Builder Class concepts.
 */

import { BuilderData } from '../types/builder';

// ─── Stack-based humor lines ──────────────────────────────────────────────────

function getStackJoke(stackStr: string): string {
  const lower = (stackStr || '').toLowerCase();

  if (lower.includes('python')) {
    return 'Running on Python, caffeine, and questionable indentation.';
  }
  if (lower.includes('rust')) {
    return 'Came to Goa to relax. Ended up fighting the borrow checker.';
  }
  if (lower.includes('react') || lower.includes('vue') || lower.includes('frontend')) {
    return 'Rendered the UI. Now praying React does not re-render me out of existence.';
  }
  if (lower.includes('ai') || lower.includes('ml') || lower.includes('llm') || lower.includes('gpt')) {
    return 'Fed the model enough data to qualify as a Goa local.';
  }
  if (lower.includes('cyber') || lower.includes('security')) {
    return 'Security status: probably suspicious.';
  }
  if (lower.includes('solidity') || lower.includes('web3') || lower.includes('crypto')) {
    return 'Trustless architecture, questionable sleep schedule.';
  }
  if (lower.includes('typescript')) {
    return 'Strict mode enabled. Types checked. Ready to ship.';
  }
  if (lower.includes('design') || lower.includes('figma') || lower.includes('css')) {
    return 'Moved 3 pixels to the left. Called it a major redesign.';
  }
  if (lower.includes('node') || lower.includes('backend') || lower.includes('api')) {
    return 'Indexed my skills. Still searching for sleep.';
  }

  return 'Shipping code at 2 AM is officially a personality trait.';
}

// ─── Team-aware hooks ─────────────────────────────────────────────────────────

const TEAM_HOOKS: string[] = [
  "Representing {team} at Hacker House Goa 2026. Code committed, caffeine loaded. 🌴💻",
  "{team} has entered Goa. Now we just need to ship before the coffee runs out. 🚀",
  "Team {team} is officially registered for Hacker House Goa. 🌴⚡",
  "Code is deployed. Team {team} is Goa bound.",
  "{team} operation moved to Anjuna Beach."
];

// ─── Solo Builder hooks ───────────────────────────────────────────────────────

const SOLO_HOOKS: string[] = [
  "HR asked for an ID card. I brought a Hacker House Goa Builder Passport instead. 🌴",
  "My official Builder Passport has arrived. My sleep schedule has not. 💻",
  "Goa was supposed to be a vacation. Then someone said 'ship it' and I took it personally. 🚀",
  "Apparently shipping code at 2 AM in Goa is acceptable now. 🌴⚡",
  "New passport unlocked. Immigration says code is verified."
];

// ─── Punchlines ───────────────────────────────────────────────────────────────

const PUNCHLINES: string[] = [
  "Production is somewhere between GitHub and Anjuna Beach. 🌴💻",
  "Ship code. Touch sand. Repeat. 🌴⚡",
  "Debugging, but with much better sunsets. 🌅⚡",
  "Finally a workplace where 'going to production' means going to Goa. 🚀"
];

// ─── Dynamic Caption Generator ────────────────────────────────────────────────

export function generateCreativeCaption(data: BuilderData, variantIndex = 0): string {
  try {
    const hasTeam = Boolean(data.teamName && data.teamName.trim().length > 0);
    const teamName = hasTeam ? data.teamName!.trim().toUpperCase() : '';

    let hook = '';
    if (hasTeam) {
      const template = TEAM_HOOKS[variantIndex % TEAM_HOOKS.length];
      hook = template.replace('{team}', teamName);
    } else {
      hook = SOLO_HOOKS[variantIndex % SOLO_HOOKS.length];
    }

    const stackJoke = getStackJoke(data.stack);
    const punchline = PUNCHLINES[(variantIndex + Math.floor((data.name || '').length)) % PUNCHLINES.length];

    // Loadout snippet if items exist
    let loadoutLine = '';
    if (data.loadout && data.loadout.length >= 2) {
      const item1 = data.loadout[0].replace(/[^\w\s]/gi, '').trim();
      const item2 = data.loadout[1].replace(/[^\w\s]/gi, '').trim();
      if (item1 && item2) {
        loadoutLine = `Loadout: ${item1} + ${item2}.`;
      }
    }

    // Alternate structure templates
    const templateType = variantIndex % 3;
    let mainBody = '';

    if (templateType === 0) {
      mainBody = `${hook}\n\n${stackJoke}\n\n${punchline}`;
    } else if (templateType === 1) {
      const roleText = (data.role || 'Builder').toUpperCase();
      const identityLine = hasTeam
        ? `Official Passport: ${data.name.toUpperCase()} • ${roleText} [${teamName}]`
        : `Official Passport: ${data.name.toUpperCase()} • ${roleText}`;
      mainBody = `${identityLine}\n\n${hook}\n\n${punchline}`;
    } else {
      mainBody = `${hook}\n\n${loadoutLine ? loadoutLine + ' ' : ''}${stackJoke}\n\nSee you at Hacker House Goa 2026. 🌴⚡`;
    }

    // Append Hashtags
    const caption = `${mainBody}\n\n#HackerHouseGoa #FrameInGoa`;

    // Ensure safe Twitter character length (<= 275 chars)
    if (caption.length <= 275) {
      return caption;
    } else {
      // Compact version if too long
      const teamPart = hasTeam ? ` [${teamName}]` : '';
      return `${hook}\n\nIdentity: ${data.name.toUpperCase()}${teamPart}\n\n#HackerHouseGoa #FrameInGoa`;
    }
  } catch (err) {
    console.warn('Caption generation fallback:', err);
    return `Got my Hacker House Goa 2026 Builder Passport. 🌴💻\n\nIdentity: ${(data.name || 'BUILDER').toUpperCase()}\n\n#HackerHouseGoa #FrameInGoa`;
  }
}
