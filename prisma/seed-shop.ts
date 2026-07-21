import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { DESIGN_PRESETS, GEMSTONE_DB, generateDefaultCatalog } from '../src/data';
import { calculateBasePrice } from '../src/pricing';
import { calculateBeadCountForCircumference } from '../src/geometry';
import type { BeadInstance } from '../src/types';

/**
 * Seeds the ready-made shop with items derived from the existing
 * DESIGN_PRESETS, so /shop has real content before any photography exists.
 *
 * Prices are computed with the same calculateBasePrice() the studio uses, so
 * a ready-made piece is not arbitrarily priced differently from the identical
 * custom build. Once seeded the price is authoritative in the DB - checkout
 * reads it from there and ignores whatever the client claims.
 *
 * Idempotent: upserts by slug, so re-running will not duplicate rows. Only
 * fields that are safe to regenerate are updated - stock and status are left
 * alone on update so a re-seed never silently restocks a sold-out piece or
 * un-publishes something.
 */

const prisma = new PrismaClient({
  adapter: new PrismaBetterSqlite3({
    url: process.env.DATABASE_URL?.replace('file:', '') || './dev.db',
  }),
});

const MARKUP = 2.5;
const LABOR = 0;
const WRIST_MM = 165;
const EASE = 6;

const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function main() {
  const catalog = generateDefaultCatalog();

  for (const preset of DESIGN_PRESETS) {
    /*
     * DesignPreset.pattern is a repeating *motif*, not a finished strand -
     * "Aura of Serenity" is 4 beads that repeat. Seeding the motif verbatim
     * priced it as a 4-bead bracelet. StudioPage's applyPreset() expands the
     * motif to fill the wrist circumference, so this mirrors that exactly,
     * with the same special case for the one preset that is already a
     * full-length exact design.
     */
    const targetMm = WRIST_MM + EASE;
    const beadCount =
      preset.name === 'Coral Jade Fossil'
        ? preset.pattern.length
        : Math.round(calculateBeadCountForCircumference(targetMm, preset.size));

    const fullPattern = Array.from(
      { length: beadCount },
      (_, i) => preset.pattern[i % preset.pattern.length]
    );

    const beads: BeadInstance[] = fullPattern.map((name, i) => {
      const item =
        catalog.find((c) => c.type === 'stone' && c.name === name && c.size === preset.size) ??
        catalog.find((c) => c.type === 'stone' && c.name === name)!;
      return {
        id: `seed-${i}`,
        itemId: item.id,
        type: 'stone',
        name: item.name,
        quality: item.quality,
        size: item.size,
        lengthMm: item.lengthMm,
        hex: item.hex,
        secondaryHex: item.secondaryHex,
        cost: item.cost,
      };
    });

    const { basePrice } = calculateBasePrice(beads, null, LABOR, MARKUP);
    const slug = slugify(preset.name);
    const info = GEMSTONE_DB[preset.pattern[0]];

    await prisma.shopItem.upsert({
      where: { slug },
      // Deliberately narrow: never resets stockQty or status on re-seed.
      update: {
        name: preset.name,
        tagline: preset.sub,
        composition: JSON.stringify(fullPattern),
        sizeMm: preset.size,
        wristMm: WRIST_MM,
        ease: EASE,
      },
      create: {
        slug,
        name: preset.name,
        tagline: preset.sub,
        description: info?.description ?? null,
        price: basePrice,
        status: 'ACTIVE',
        stockQty: 3,
        composition: JSON.stringify(fullPattern),
        sizeMm: preset.size,
        wristMm: WRIST_MM,
        ease: EASE,
        // No photography yet. spinFrameCount 0 makes SpinViewer fall back to
        // the hero image, so an item can be listed before it is shot.
        heroImage: null,
        spinBasePath: null,
        spinFrameCount: 0,
      },
    });

    console.log(`  ${slug.padEnd(22)} ₱${String(basePrice).padStart(5)}  (${beads.length} beads)`);
  }

  const total = await prisma.shopItem.count();
  console.log(`\nShop seeded. ${total} item(s) total.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
