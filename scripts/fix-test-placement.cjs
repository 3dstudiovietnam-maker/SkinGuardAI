/**
 * Fixes test: section placement for all 9 non-EN/HU languages.
 *
 * Problem: test: {} ended up INSIDE the disclaimer: {} object instead of
 * after it, at the language-section level.
 *
 * Fix per language type:
 *  HI/ZH/VI/DE/ES/PT/RU → swap test: and disclaimer-close
 *  TH  → remove duplicate test inside disclaimer, keep the one outside
 *  RO  → remove duplicate test section
 */
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'client', 'src', 'lib', 'translations.ts');
let content = fs.readFileSync(filePath, 'utf8');
let changes = 0;

// ─── Helper: swap test-inside-disclaimer to after-disclaimer ─────────────────
// Pattern:
//   "      ctaBtn: 'UNIQUE',\r\n" +
//   "    test: { ... },\r\n"       ← test is INSIDE disclaimer (wrong)
//   "    },\r\n"                   ← disclaimer close
//   "  },\r\n"                     ← language section close
// Fix: move test AFTER disclaimer close (before section close)

function fixStandard(lang, ctaBtn) {
  // Escape special chars in ctaBtn for use in regex
  const escaped = ctaBtn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  // Match: ctaBtn line, then test line, then disclaimer-close, then section-close
  // Use \r?\n to handle both CRLF and LF
  const re = new RegExp(
    `(      ctaBtn: '${escaped}',\r?\n)` +    // group 1: ctaBtn line
    `(    test: \\{[^\r\n]+\\},\r?\n)` +       // group 2: test line (single line)
    `(    \\},\r?\n)` +                         // group 3: disclaimer close
    `(  \\},\r?\n)`                             // group 4: section close
  );

  const m = content.match(re);
  if (!m) {
    console.warn(`⚠️  ${lang}: pattern not found`);
    return;
  }

  // Swap groups 2 and 3: ctaBtn → disclaimer-close → test → section-close
  const fixed = m[1] + m[3] + m[2] + m[4];
  content = content.replace(re, fixed);
  console.log(`✅ ${lang}: test section moved outside disclaimer`);
  changes++;
}

// ─── Fix HI, ZH, VI, DE, ES, PT, RU ─────────────────────────────────────────
fixStandard('HI', 'त्वचा विशेषज्ञ खोजें');
fixStandard('ZH', '寻找皮肤科医生');
fixStandard('VI', 'Tìm bác sĩ da liễu');
fixStandard('DE', 'Dermatologen finden');
fixStandard('ES', 'Encontrar un dermatólogo');
fixStandard('PT', 'Encontrar um dermatologista');
fixStandard('RU', 'Найти дерматолога');

// ─── Fix TH: remove the duplicate test INSIDE disclaimer ─────────────────────
// Structure:
//   ctaBtn line
//   test line   ← WRONG (inside disclaimer)
//   },           ← disclaimer close
//   test line   ← CORRECT (outside, before section close `},`)
//   },           ← section close (TH uses `},` not `  },`)
{
  const ctaBtn = 'ค้นหาแพทย์ผิวหนัง';
  const escaped = ctaBtn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const re = new RegExp(
    `(      ctaBtn: '${escaped}',\r?\n)` +  // group 1
    `(    test: \\{[^\r\n]+\\},\r?\n)` +    // group 2: test INSIDE (to remove)
    `(    \\},\r?\n)` +                      // group 3: disclaimer close
    `(    test: \\{[^\r\n]+\\},\r?\n)` +    // group 4: test OUTSIDE (keep)
    `(\\},\r?\n)`                            // group 5: TH section close
  );

  const m = content.match(re);
  if (m) {
    // Keep: ctaBtn, disclaimer-close, test-outside, section-close
    const fixed = m[1] + m[3] + m[4] + m[5];
    content = content.replace(re, fixed);
    console.log('✅ TH: duplicate test removed, correct placement kept');
    changes++;
  } else {
    // Maybe already has only one — check if test is outside disclaimer
    const reSingle = new RegExp(
      `(      ctaBtn: '${escaped}',\r?\n)` +
      `(    \\},\r?\n)` +
      `(    test: \\{[^\r\n]+\\},\r?\n)`
    );
    if (reSingle.test(content)) {
      console.log('✅ TH: already correct (test outside disclaimer)');
    } else {
      console.warn('⚠️  TH: pattern not found — manual check needed');
    }
  }
}

// ─── Fix RO: remove duplicate test section ────────────────────────────────────
// Structure after disclaimer close:
//   },             ← disclaimer close  (line 4586)
//   test line      ← CORRECT (line 4587)
//   test line      ← DUPLICATE to remove (line 4588)
{
  const ctaBtn = 'Găsești un dermatolog';
  const escaped = ctaBtn.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  const re = new RegExp(
    `(      ctaBtn: '${escaped}',\r?\n)` +  // group 1
    `(    \\},\r?\n)` +                      // group 2: disclaimer close
    `(    test: \\{[^\r\n]+\\},\r?\n)` +    // group 3: test (KEEP)
    `(    test: \\{[^\r\n]+\\},\r?\n)`      // group 4: test DUPLICATE (remove)
  );

  const m = content.match(re);
  if (m) {
    const fixed = m[1] + m[2] + m[3]; // drop group 4 (duplicate)
    content = content.replace(re, fixed);
    console.log('✅ RO: duplicate test section removed');
    changes++;
  } else {
    // Check if already clean
    const reCheck = new RegExp(`ctaBtn: '${escaped}',\r?\n    \\},\r?\n    test:`);
    if (reCheck.test(content)) {
      console.log('✅ RO: already has single test section after disclaimer');
    } else {
      console.warn('⚠️  RO: pattern not found — manual check needed');
    }
  }
}

// ─── Save ─────────────────────────────────────────────────────────────────────
if (changes > 0) {
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`\n✅ Saved. ${changes} fix(es) applied.`);
} else {
  console.log('\nℹ️  No changes needed or all patterns already correct.');
}
