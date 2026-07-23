# Generierte Styleframe-Assets

Stand: 21. Juli 2026. Alle hier aufgeführten finalen Assets wurden mit Built-in Imagegen erzeugt. Es wurde kein CLI-Fallback verwendet.

## Feedback-Asset-Paket vom 22. Juli 2026

Alle drei Atlanten wurden mit Built-in Imagegen und dem bestehenden
`comic-vfx-sheet.png` als direkter Stilreferenz erzeugt. Die flachen
Chroma-Key-Hintergründe wurden mit dem installierten Imagegen-Helfer,
Soft-Matte und Despill entfernt. Das Chicken aus Task 020 wurde dabei bewusst
nicht erzeugt.

### Projektil-Sheet: `comic-projectile-sheet.png`

**Technik:** transparentes 1254×1254-PNG, 2×2 Frames zu je 627×627 Pixeln.
Rakete und Geländebrecher sind nach rechts normalisiert. Frame 1 und 3 bilden
das kosmetische Zündflackern der Granate.

```text
Use case: stylized-concept
Asset type: production-minded 2 by 2 projectile sprite atlas for the original side-view 2D comic artillery browser game Projekt Abriss
Input image: use Image 1 only as the exact visual style reference for bold dark-teal outlines, restrained hand-painted cel shading, warm palette, clarity at small size, and modest browser-game polish.
Primary request: exactly four isolated projectile sprites, one centered in each equal square cell. Top-left: a compact cream-and-coral demolition rocket with a blunt pointed nose, small navy band and tiny rear fins, pointing perfectly horizontally to the RIGHT, no exhaust or smoke. Top-right: a round charcoal-indigo timed grenade with a cream metal cap and short curved fuse ending in a small yellow-orange spark. Bottom-left: a chunky ochre-and-cyan terrain-breaker drill missile with a distinctive faceted drill tip, small coral rear fins, pointing perfectly horizontally to the RIGHT, no exhaust or smoke. Bottom-right: the exact same timed grenade as top-right, same placement and orientation, but with a larger bright fuse spark for a two-frame flicker.
Scene/backdrop: perfectly flat uniform solid #ff00ff chroma-key background in every empty pixel; no floor, shadow, gradient, texture, grid lines, cell dividers or reflections.
Composition: exact-feeling 2 columns by 2 rows, one centered object per equal cell, identical scale within relevant variants, generous padding, no object touches an edge. Side view. Rocket and breaker long axis exactly horizontal.
Style/medium: original hand-drawn dimensional comic game art, confident dark-teal ink contour, simple cel-painted volume, slightly irregular and playful, crisp at 24-40 screen pixels; not papercut, pixel art, flat vector, glossy 3D, photorealistic or franchise-specific.
Constraints: exactly four sprites; no characters, hands, text, UI, logos, watermark, scenery, explosions, motion streaks, cast shadows, extra marks, or magenta within any projectile.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-285726a3-8c4f-423e-b010-2a7904609dc6.png`

### Sekundär-VFX: `secondary-vfx-sheet.png`

**Technik:** transparentes 1254×1254-PNG, 2×2 Frames zu je 627×627 Pixeln.
Frames 0–1 zeigen Granatenkontakt, Frames 2–3 Landestaub.

```text
Use case: stylized-concept
Asset type: production-minded 2 by 2 secondary VFX sprite atlas for the original side-view 2D comic artillery browser game Projekt Abriss
Input image: use Image 1 as the exact visual style reference for bold dark-teal outlines, irregular comic shapes, restrained cel shading, clarity at small size and the established coral, cream, ochre and lavender palette.
Primary request: exactly four isolated opaque comic effect sprites, one centered in each equal square cell. Top-left and top-right are two consecutive frames of one small grenade bounce effect: a low cream-yellow contact spark with two coral flecks and a tiny lavender dust curl, second frame slightly wider and dimmer. Bottom-left and bottom-right are two consecutive frames of one landing effect: a low horizontal pair of warm ochre-lavender dust puffs close to the ground, second frame wider, softer and breaking into three small motes.
Scene/backdrop: perfectly flat uniform solid #00ff00 chroma-key background everywhere outside the effects; no floor, shadow, gradient, texture, grid lines, cell dividers or reflections.
Composition: exact-feeling 2 columns by 2 rows, one centered effect per equal cell, consistent baseline and scale for each pair, generous padding, no effect touches an edge.
Style/medium: original hand-drawn 2D comic game VFX, confident dark-teal contours, simple cel-painted volume, playful and readable at 24-60 screen pixels; not papercut, pixel art, flat vector, glossy, photorealistic or franchise-specific.
Constraints: exactly four effects and nothing else; no text, characters, weapons, scenery, logos, frames, watermark, soft transparency, extra marks, or green within an effect.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-c2d6c449-7b1c-49e2-8b58-9c6a455a51fd.png`

### UI-Icons: `feedback-icon-sheet.png`

**Technik:** transparentes 1536×1024-PNG, 3×2 Frames zu je 512×512 Pixeln.
Die sechs Frames sind Rakete, Granate, Geländebrecher, Teamgesundheit,
Zugreihenfolge und Managerkommando.

```text
Use case: stylized-concept
Asset type: production-minded 3 columns by 2 rows UI icon atlas for the original side-view 2D comic artillery browser game Projekt Abriss
Input image: use Image 1 as the exact visual style reference for bold dark-teal outlines, restrained hand-painted cel shading, warm friendly palette, slightly irregular shapes and crisp small-scale readability.
Primary request: exactly six isolated compact icons, one centered in each equal cell. Top row left-to-right: demolition rocket pointing right, round timed grenade, chunky terrain-breaker drill missile pointing right. Bottom row left-to-right: sturdy coral heart for team health, cream-and-yellow curved turn-order arrow, small teal manager megaphone with a yellow mouth and one coral sound mark. Each icon must have a single strong silhouette and minimal internal detail.
Scene/backdrop: perfectly flat uniform solid #ff00ff chroma-key background in every empty pixel; no floor, shadows, gradients, texture, grid lines, cell dividers or reflections.
Composition: exact-feeling 3 columns by 2 rows, one centered icon per equal cell, consistent visual weight, generous padding, no icon touches an edge.
Style/medium: original hand-drawn dimensional comic UI art, confident dark-teal ink contour, simple cel-painted volume, slightly irregular and playful, readable at 18-32 screen pixels; not papercut, pixel art, generic flat vector, emoji, glossy 3D, photorealistic or franchise-specific.
Constraints: exactly six icons; no text, letters, numbers, characters, hands, scenery, logos, borders, watermark, extra marks or magenta within an icon.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-6aa81298-3a5e-4816-a5e0-aebad997312d.png`

Nicht zur Laufzeit verwendete ursprüngliche Karten-Styleframes liegen unter `source-assets/maps/`; nur die HD-Laufzeitfassungen werden über `public/assets/maps/` ausgeliefert.

## Verbindliche Referenzregel ab Task 013

`beispiele figuren/1.jpg`, `2.jpg` und `3.jpg` sind keine fremden oder nur losen Moodboards, sondern eigens für dieses Spiel erzeugte konkrete Figuren-Mockups. Bei der nächsten Figurengeneration sollen die ausgewählten Designs so genau wie möglich rekonstruiert werden; lediglich von der Bild-KI hinzugefügte Fantasietitel, Schriftzüge und Logos werden weggelassen. Die weiter unten dokumentierten Moki-/Vela-Prompts verwendeten die Bilder historisch nur als breite Inspiration und entsprechen deshalb ausdrücklich noch nicht dieser neuen Vorgabe.

## Hintergrund: `sunny-sky-background.png`

```text
Use case: stylized-concept
Asset type: wide background layer for an original side-view 2D comic artillery test game
Primary request: a cheerful fantasy sky world seen from the side, with a warm turquoise-to-blue sky, soft rounded clouds, distant rolling candy-colored hills, a few tiny far-away floating land silhouettes, and a subtle sunny glow. It should feel playful and optimistic, suitable behind a destructible gameplay map.
Scene/backdrop: only distant non-playable scenery. Keep the lower and middle foreground open so a separate terrain layer can be placed on top. Distant elements must be soft and clearly atmospheric, never resembling solid playable platforms.
Style/medium: hand-drawn comic game background with rounded forms, confident ink accents, gentle cel-painted volume and soft color variation. Original classic side-view cartoon artillery mood, but no copied characters, layouts, weapons, logos, or recognizable franchise elements. More dimensional comic illustration, not paper-cut, not flat vector poster, not photorealistic, not highly polished concept art.
Composition/framing: wide 16:9 game view, horizon low, ample readable sky for projectile arcs, balanced negative space through the center.
Lighting/mood: bright late-morning light, good-humored, adventurous, saturated but not neon.
Color palette: turquoise sky, creamy clouds, muted lavender and blue distant hills, touches of warm peach and yellow.
Constraints: no text, UI, characters, weapons, buildings, construction site, foreground ground mass, large foreground islands, logos, borders, frames, or watermark.
```

## Terrain: `good-mood-terrain.png`

```text
Use case: stylized-concept
Asset type: destructible foreground terrain layer for an original side-view 2D comic artillery test game
Primary request: one complete playable terrain composition made from a thick irregular lower landmass plus exactly two separate floating islands above it. The lower landmass forms several clearly different elevations and contains broad standing areas for small cartoon characters.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background; every empty area around the floating islands uses the same uniform key color.
Subject: chunky fantasy terrain with warm ochre and coral earth, cream rock strata, lavender-blue turf and a few tiny decorations embedded directly into the land. Thick destructible masses and playful overhangs, without thin fragile spikes.
Style/medium: hand-drawn comic game terrain with bold dark teal ink outlines, rounded organic shapes, cel-painted volume, soft chunky texture and modest detail. Original side-view cartoon artillery mood; not paper-cut, layered paper, flat vector, pixel art, photorealistic or over-polished.
Composition/framing: wide 16:9 side view; terrain across the lower portion; exactly two floating islands at different heights; generous open sky between tiers.
Constraints: no text, UI, characters, weapons, buildings, construction props, logos, frames, loose background objects or watermark; no bright green in the terrain.
```

## Wesen: `blue-hornling-sheet.png`

**Status:** nur technischer Platzhalter. Pose und Freistellung sind verwendbar; Niedlichkeit, perfekte Rundungen und starkes Maskottchengefühl werden nicht als Stilreferenz fortgeführt.

```text
Use case: stylized-concept
Asset type: one original fantasy creature character sprite sheet for a simple side-view 2D comic artillery test game
Primary request: exactly four isolated full-body sprites of the same single creature in a clean 2-column by 2-row sheet.
Scene/backdrop: perfectly flat solid #00ff00 chroma-key background without shadows, gradients, texture, floor, grid or reflections.
Subject: one compact bipedal fantasy creature with a pear-shaped turquoise-blue body, creamy belly, sturdy legs, three-fingered hands, broad expressive face, two fin-like ears, one ivory forehead horn, tiny dark eyes and a mustard scarf. No job uniform, helmet, armor, shoes, tool belt or construction theme. Preserve anatomy, facial features, colors, scarf, proportions and scale across all cells.
Poses: alert neutral stance; thoughtful and pointing; energetic action pose; comic startled reaction.
Style/medium: hand-drawn 2D comic game sprite with bold dark teal outlines, rounded forms, expressive squash-and-stretch, gentle cel-painted volume and modest texture. Original side-view cartoon artillery mood; not a worm, not an existing character, not paper-cut, flat vector, pixel art, photorealistic or over-polished.
Constraints: no text, logos, watermark, shadows, scenery, particles, weapons, tools, extra creatures, grid, frames or bright green in the creature.
```

## Animiertes Pilzwesen: `moki-mushroom-sheet.png`

**Verfahren:** Built-in Imagegen mit `beispiele figuren/1.jpg` nur als breitem Moodboard für Speziesvielfalt, Silhouetten und Posen. Das eigenständige Ergebnis wurde auf einem einheitlichen Magenta-Hintergrund erzeugt, mit dem Chroma-Key-Helfer des Imagegen-Skills (`--auto-key border`, Soft-Matte, Despill) freigestellt und lokal in 16 Frames zu je 256×256 Pixeln geteilt. Jeder Frame wurde horizontal zentriert und auf eine gemeinsame Fußachse gesetzt; das finale Sheet misst 1024×1024 Pixel.

```text
Use case: stylized-concept
Asset type: one original animated character sprite sheet for a side-view 2D comic artillery test game
Reference use: use the supplied moodboard only for broad inspiration such as varied fantasy species, readable side silhouettes and expressive poses. Do not copy any depicted character, costume, weapon, text, layout or branding.
Primary request: exactly sixteen isolated full-body sprites of the same single adult mushroom-folk character in a precise 4-column by 4-row grid. Keep anatomy, burnt-orange asymmetric mushroom cap, small face, mossy green cloak, twig-like limbs, colors, proportions and scale consistent in every cell.
Animation rows: row 1 four subtle idle/breathing frames; row 2 four clear walking frames with readable alternating steps; row 3 four jump frames from takeoff through airborne pose to landing preparation; row 4 four action/reaction poses: operating a simple launcher, throwing a grenade, comic hit reaction, restrained victory pose.
Scene/backdrop: perfectly flat uniform solid #ff00ff chroma-key background in every empty pixel; no floor, shadow, gradient, texture, grid lines, dividers or reflections.
Style/medium: original hand-drawn dimensional 2D comic game sprite, confident dark-teal/brown ink contour, simple cel-painted volume, modest organic texture and slightly dry expression. Friendly and humorous but not cute mascot art, not glossy, not papercut, not flat vector, pixel art, photorealistic or over-polished.
Composition: equal 4×4 cells, one centered character per cell, consistent baseline, generous padding, nothing touches a cell edge.
Constraints: no text, UI, logos, watermark, extra characters, scenery, construction uniform, recognizable franchise design or bright magenta inside the character.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-bb717cbc-8de9-461b-81a7-76a2223d2b40.png`

## Animierter Geist: `vela-ghost-sheet.png`

**Verfahren:** Built-in Imagegen mit `beispiele figuren/2.jpg` nur als Moodboard für Silhouetten- und Speziesvielfalt. Der Magenta-Key wurde mit Soft-Matte und Despill entfernt. Die 16 Zellen wurden auf 256×256 Pixel vereinheitlicht, horizontal zentriert und auf eine gemeinsame Schwebeachse stabilisiert; das finale Sheet misst 1024×1024 Pixel.

```text
Use case: stylized-concept
Asset type: one original animated character sprite sheet for a side-view 2D comic artillery test game
Reference use: use the supplied moodboard only for broad inspiration such as varied fantasy species, strong silhouettes and expressive action posing. Do not copy any depicted character, costume, weapon, text, layout or branding.
Primary request: exactly sixteen isolated full-body sprites of the same single adult ghost character in a precise 4-column by 4-row grid. Keep the long pale blue-gray spectral body, expressive angular face, flowing arms, plum scarf, colors, proportions and scale consistent in every cell. The ghost must look like opaque painted spectral material, not transparent glass.
Animation rows: row 1 four restrained idle/hover frames; row 2 four directional glide frames with clear body flow; row 3 four jump/swoop frames from lift through airborne arc to settling; row 4 four action/reaction poses: operating a simple launcher, throwing a grenade, comic hit reaction, restrained victory pose.
Scene/backdrop: perfectly flat uniform solid #ff00ff chroma-key background in every empty pixel; no floor, shadow, gradient, texture, grid lines, dividers or reflections.
Style/medium: original hand-drawn dimensional 2D comic game sprite, confident dark blue-gray contours, simple cel-painted volume, modest fabric and spectral texture, mischievous rather than adorable. Friendly and humorous but not cute mascot art, not glossy, not papercut, flat vector, pixel art, photorealistic or over-polished.
Composition: equal 4×4 cells, one centered character per cell, consistent hover baseline, generous padding, nothing touches a cell edge.
Constraints: no text, UI, logos, watermark, extra characters, scenery, construction theme, recognizable franchise design or bright magenta inside the character.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-d706aa24-94ad-4b8f-81da-91060c7067a5.png`

## Flüssiger Slime: `slime-fluid-sheet.png`

**Verfahren:** Built-in Imagegen mit `beispiele figuren/2.jpg` als direkte projektspezifische Designvorlage. Verwendet wurde ausschließlich der grüne Slime unten rechts; Fantasietitel, Logo und andere Figuren des Mockups wurden nicht übernommen. Der einheitliche Magenta-Hintergrund wurde mit dem Chroma-Key-Helfer des Imagegen-Skills (`--auto-key border`, Soft-Matte und Despill) entfernt. Das 8×4-Ergebnis wurde in 32 quadratische Frames zu je 256×256 Pixeln geteilt und als transparentes 2048×1024-PNG zusammengesetzt.

```text
Use case: stylized-concept
Asset type: production-minded 8-column by 4-row sprite sheet for one animated 2D comic artillery character
Input image: use the supplied project-owned character mockup as a direct design reference. Reproduce specifically the small green slime creature at the lower right as closely as possible: rounded translucent pea-green blob body, darker green lower rim, two tall white eyes with tiny dark pupils, wide friendly open mouth, tiny cheek/bubble details and simple charming proportions. Ignore every fantasy title, logo, text and all other characters in the mockup.
Primary request: exactly thirty-two isolated full-body sprites of the same single slime in a precise 8×4 grid. Keep anatomy, face, color, outline weight, scale and baseline consistent. Motion must read as very fluid through clear in-between shapes, elastic squash-and-stretch and stable contact with the ground.
Animation rows: row 1 eight subtle idle/breathing and blinking frames; row 2 eight forward hop/walk frames with compression, push-off, airborne stretch and soft landing; row 3 eight jump frames from anticipation through ascent, apex, fall, impact squash and recovery; row 4 eight action frames grouped left to right: launcher anticipation/fire/recoil, grenade hold/throw/follow-through, comic splat hit and cheerful victory.
Scene/backdrop: perfectly flat uniform solid #ff00ff chroma-key background in every empty pixel; no floor, shadow, texture, gradient, grid lines or cell dividers.
Style/medium: dimensional hand-drawn comic game sprite with confident dark green ink contour, simple cel-painted volume and modest glossy slime highlights. Friendly and charming, simple rather than over-polished; not paper-cut, pixel art, flat vector, photorealistic, 3D render or copied franchise art.
Composition: one centered character per equal cell, generous padding, stable bottom anchor, nothing touching cell edges or another cell.
Constraints: exactly 32 sprites; no text, logo, UI, scenery, extra creatures, construction clothing, watermark or magenta inside the slime.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-3df46c5c-1569-41f5-aa5f-b47022d31265.png`

## VFX: `comic-vfx-sheet.png`

**Technische Aufbereitung:** Der einheitliche grüne Hintergrund wurde lokal mit dem Chroma-Key-Helfer des Imagegen-Skills, Soft-Matte und Despill entfernt. Das Ergebnis ist ein transparentes 1254×1254-PNG mit vier Frames zu je 627×627 Pixeln.

```text
Use case: stylized-concept
Asset type: simple 2 by 2 game VFX sprite atlas
Primary request: exactly four isolated, opaque comic effects, one centered in each equal cell: top-left a short yellow-orange exhaust burst pointing left; top-right a coral-and-cream impact starburst; bottom-left a chunky lavender-blue smoke puff; bottom-right a small ochre-and-coral group of flying terrain chips.
Backdrop: perfectly uniform solid #00ff00 chroma-key background everywhere outside the effects; no gradient, shadow, texture, floor, grid, dividers, or reflection.
Style: original hand-drawn 2D comic game art, bold dark-teal outlines, simple cel shading, slightly irregular and playful, modest prototype polish, clearly readable when small; not paper-cut, pixel art, photorealistic, glossy, or franchise-specific.
Layout: equal scale, generous padding, crisp closed silhouettes, no effect touches a canvas edge or another cell.
Palette: cream, yellow, orange, coral, ochre, muted lavender-blue, dark teal; absolutely no green inside an effect.
Constraints: exactly four effects; no text, characters, weapons, scenery, logos, frames, watermark, soft transparency, or extra marks.
```

## HD-Hintergrund: `sunny-sky-background-hd.png`

**Verfahren:** Built-in Imagegen als Edit der ursprünglichen Hintergrunddatei. Das Ergebnis wurde lokal mit Lanczos auf 3200×1800 gebracht und leicht nachgeschärft.

```text
Use case: precise-object-edit
Asset type: high-resolution 16:9 background layer for an original side-view 2D comic artillery game
Input images: Image 1 is the edit target and composition reference.
Primary request: redraw Image 1 as a sharper, production-quality fullscreen game background while preserving its exact overall composition, horizon placement, open central sky, cloud groups, distant hills, color relationships and cheerful mood.
Style/medium: retain the same hand-drawn dimensional comic illustration, confident painted shapes, gentle cel-painted volume and restrained brush texture. Improve edge definition, local texture clarity and tonal separation so close camera views remain crisp, without turning it into photorealism or glossy concept art.
Composition/framing: exact 16:9 landscape; preserve the existing placement and scale of all major cloud banks and distant hills; keep the central and middle sky open for projectile arcs.
Constraints: change only rendering fidelity and clarity; do not redesign the scene or move major elements; no playable foreground terrain, characters, weapons, buildings, construction theme, text, UI, logos, borders or watermark; not paper-cut, flat vector or pixel art.
Output intent: a clean high-definition source suitable for final local resizing to 3200×1800 pixels.
```

## HD-Terrain: `good-mood-terrain-hd.png`

**Verfahren:** Built-in Imagegen als Edit der ursprünglichen Terraindatei. Der einheitliche grüne Hintergrund wurde mit Soft-Matte und Despill entfernt; das Alpha-Ergebnis wurde lokal mit Lanczos auf 3200×1800 gebracht und leicht nachgeschärft.

```text
Use case: precise-object-edit
Asset type: high-resolution destructible foreground terrain layer for an original side-view 2D comic artillery game
Input images: Image 1 is the edit target and exact composition reference.
Primary request: redraw Image 1 as sharper, production-quality fullscreen terrain while preserving the complete terrain silhouette, all platform positions, floating islands, valleys, ledges, proportions and gameplay layout.
Scene/backdrop: perfectly flat uniform solid #00ff00 chroma-key background in every non-terrain pixel, including all gaps below and between floating islands; no gradients, lighting variation, texture, shadows, floor, reflections or stray marks in the key background.
Style/medium: retain the same hand-drawn dimensional comic terrain, bold dark-teal contours, purple turf, warm coral and ochre strata, cream stones, simple cel-painted volume and modest organic texture. Improve edge definition, ink clarity, rock texture separation and small decorative detail so close camera views remain crisp; not photorealistic or over-polished.
Composition/framing: exact 16:9 landscape and exact original gameplay composition; all major top surfaces and island positions must remain where they are.
Constraints: change only rendering fidelity and clarity; do not redesign, move, add or remove major terrain masses; no characters, weapons, buildings, construction props, UI, text, logos, border or watermark; no bright green inside the terrain; not paper-cut, flat vector or pixel art.
Output intent: a clean chroma-key source suitable for alpha removal and final local resizing to 3200×1800 pixels.
```

## Space-Resort-Hintergrund: `space-resort-background-hd.png`

**Verfahren:** Built-in Imagegen, danach 16:9-Beschnitt, Lanczos-Skalierung auf
3200×1800 und leichte Nachschärfung.

```text
Use case: stylized-concept
Asset type: high-resolution wide background layer for an original side-view 2D comic artillery browser game
Primary request: create a cheerful humorous outer-space holiday-resort backdrop, clearly different from a blue daytime fantasy sky. Show deep indigo and midnight-blue space, a huge softly painted lavender ringed planet partly off-frame, a peach-and-cyan nebula, star clusters, tiny distant vacation satellites, one absurdly small floating pool ring and a few remote domed resort modules that read only as far-away scenery.
Scene/backdrop: distant non-playable scenery only. Keep the central and lower-middle area visually open and low-contrast for projectile arcs and a separate terrain layer. Nothing in the background may look like a solid playable platform.
Style/medium: high-quality hand-drawn dimensional 2D comic game background with confident painted shapes, restrained ink accents, simple cel-painted volume, modest texture and crisp fullscreen detail. Friendly, playful and premium browser-game quality; not paper-cut, flat vector, pixel art, photorealistic, glossy 3D or grimdark.
Composition/framing: exact-feeling 16:9 landscape, zoomed-out side view, open center, large ringed planet framing one upper corner, nebula flowing diagonally, small distant resort jokes around the perimeter.
Lighting/mood: bright starlight and colorful nebula glow; adventurous holiday mood, never threatening.
Color palette: deep indigo, midnight blue, lavender, dusty coral, peach, cream and restrained cyan; substantially darker and cooler than the existing sunny map.
Constraints: no foreground terrain, no playable land masses, no characters, no weapons, no UI, no text, no logos, no borders, no watermark, no construction theme, no franchise-specific imagery.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-3dbedad1-af7c-438e-8154-a9095eb7e2c5.png`

## Space-Resort-Terrain: `space-resort-terrain-hd.png`

**Verfahren:** Built-in Imagegen mit dem vorhandenen Terrain nur als technische
Stilreferenz. Grüner Chroma-Key wurde mit Soft-Matte und Despill entfernt;
anschließend 16:9-Beschnitt, Lanczos-Skalierung auf 3200×1800 und leichte
Nachschärfung.

```text
Use case: stylized-concept
Asset type: high-resolution destructible foreground terrain layer for an original side-view 2D comic artillery browser game
Input image: Image 1 is a style and technical-layer reference only. Preserve its confident comic ink, readable chunky mass, cel-painted dimensionality and transparent-layer intent, but create a completely different terrain silhouette, setting, palette, platform arrangement and decorations.
Primary request: create a humorous outer-space holiday-resort battlefield made from thick floating asteroids and moon-rock. The playable layout must contain one substantial irregular lower asteroid mass with two clearly different floor elevations, plus exactly three separate floating asteroid islands above it at varied heights. Provide at least six broad, almost-horizontal standing pads distributed across left, center and right.
Scene/backdrop: perfectly flat uniform solid #00ff00 chroma-key background in every non-terrain pixel, including every gap beneath and between islands. No gradient, stars, shadows, lighting variation, texture or stray marks in the key background.
Subject/materials: chunky dusty coral and lavender moon-rock, cream crater strata, deep indigo undersides, a thin cyan mineral/rim accent, embedded meteor pebbles. Tiny harmless resort jokes may be embedded into the terrain: one crooked beach umbrella, a deflated pool ring, a miniature luggage case and a sunscreen bottle. Keep all jokes small and non-blocking.
Style/medium: high-quality hand-drawn dimensional 2D comic terrain, bold dark-navy ink contours, simple cel-painted volume, crisp fullscreen rock texture and modest detail. Friendly and premium browser-game quality; not paper-cut, layered paper, flat vector, pixel art, photorealistic, glossy 3D or over-polished concept art.
Composition/framing: exact-feeling 16:9 side view, zoomed-out large battlefield. Lower mass spans most of the width but has a deep central bowl and asymmetric tall left and right shoulders. Three floating islands should not mirror Image 1 and should leave generous projectile lanes between tiers. Thick destructible masses only; no thin spikes.
Color palette: dusty coral, mauve, lavender, cream, indigo and restrained cyan. Absolutely no green inside terrain or decorations.
Constraints: no text, UI, characters, weapons, buildings, construction props, logos, border, frames or watermark; no separate background scenery; no bright green anywhere except the perfectly uniform key background.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-d29ff169-000c-482a-83c9-99f25dd7e4f0.png`

## Pop-Diva und Chicken: `pop-diva-sheet.png`, `chicken-sheet.png`

**Verfahren:** Built-in Imagegen mit `beispiele figuren/3.jpg` (Pop-Diva)
und `beispiele figuren/1.jpg` (Chicken) als direkte projektspezifische
Designvorlagen. Die einfarbigen Chroma-Key-Hintergründe wurden mit Soft-Matte
und Despill entfernt. Anschließend wurden die 4×4-Ergebnisse in 16 einzelne
Zellen geteilt, einheitlich auf 256×256 Pixel normalisiert und je Zustand an
einer festen Fußlinie ausgerichtet. Die neuen Testassets sind bewusst eine
Stufe einfacher als die 32-Frame-Sheets: nur Idle, Laufen, Sprung und Treffer
mit je vier klar unterscheidbaren Phasen.

**Imagegen-Prompt (zusammengefasst):**

```text
Create a 4 columns × 4 rows character sheet closely reproducing the Pop Diva
or Chicken from the supplied project reference. Make idle, walk, jump and
slapstick hurt with four frames each. Simplify one production level with large
readable color regions, thick dark navy outlines, one cel-shadow, fixed scale
and foot line. Use a flat chroma-key background; no text, borders, weapons,
scenery or other characters.
```

**Imagegen-Originale:**
`C:\Users\madde\.codex\generated_images\019f8bb5-2912-7fe2-ba57-5b71981f52d6\exec-2ff04f3f-5708-46b3-b59e-ac033232ae3c.png`
und
`C:\Users\madde\.codex\generated_images\019f8bb5-2912-7fe2-ba57-5b71981f52d6\exec-88fb8f16-615e-4e5b-a0e2-e8ba1ef369f7.png`.

## Flüssiger Ghost: `ghost-fluid-sheet.png`

**Verfahren:** Built-in Imagegen mit `beispiele figuren/2.jpg` als direkte
projektspezifische Designvorlage. Verwendet wurde nur der helle Ghost oben,
zweite Figur von links. Der Magenta-Key wurde mit Soft-Matte und Despill
entfernt. Das 8×4-Ergebnis wurde in 32 Frames zu je 256×256 Pixeln geteilt;
eine helle Kernmaske stabilisiert die horizontale Körpermitte und bei
Schwebezyklen die vertikale Achse. Das finale Sheet misst 2048×1024 Pixel.

```text
Use case: game-asset sprite sheet
Create one production-ready 8 columns × 4 rows sprite sheet (exactly 32 equal square cells) for the original 2D comic artillery browser game "Projekt Abriss". The character must closely reproduce the specific GHOST design in the supplied reference image: the pale mint-white rounded sheet ghost in the top row, second character from the left. Preserve its simple bulbous head/body silhouette, two narrow dark mischievous eyes, tiny confident curved smile, faint mint/cyan underside shading, and several soft trailing scalloped wisps. No clothing, no arms unless briefly needed to hold a weapon, no accessories, no branding. Ignore every title, label, logo, and all other characters in the reference.
Character direction: simple, charming, a little sly rather than cute or sugary. Hand-drawn dimensional comic style, clean dark teal-navy ink contour, restrained cel-painted volume and subtle paperless brush texture. It must visually belong beside the existing Projekt Abriss slime/mushroom characters, not look like papercut, pixel art, glossy 3D, photorealism, emoji, mascot merchandise or a known franchise character.
Sheet layout and animation, left-to-right with exactly eight cells per row:
- Row 1, frames 0–7: seamless idle hover loop. Stable head/eye height, subtle inhale/exhale, wisps rhythmically curling, only a very small deliberate vertical bob.
- Row 2, frames 8–15: seamless lateral glide/walk equivalent. Body leans gently into motion, underside wisps flow backward then recover. Stable visual body center across frames; no translation drift.
- Row 3, frames 16–23: jump/dodge/float cycle. Compress slightly, lift, stretch, apex, drift, descend, soft squash, recover. Keep face and silhouette consistent.
- Row 4: frames 24–26 fire a compact coral-and-indigo cartoon rocket launcher; frames 27–29 toss a round timed grenade; frame 30 reacts to a hit with a readable squashed/shocked expression; frame 31 celebrates with a proud upward curl and cheeky grin. Weapons appear only in their assigned action frames.
Technical consistency: every cell has the same character scale and camera, straight side/three-quarter game view facing right, fully visible with generous transparent-safe padding. Keep the face identity, body width, ink weight, palette and apparent lighting identical in all 32 frames. Use a stable hover anchor and stable horizontal body center so animation does not jitter. No frame dividers and no cast shadows.
Background: perfectly uniform solid #ff00ff magenta chroma-key in every non-character pixel and every gap, with no gradient, texture, shadow, antialias contamination, text or marks. Do not use magenta anywhere on the character or weapons.
Output constraints: wide 2:1 sheet, exact-feeling 8×4 grid, no text, labels, numbers, arrows, borders, gutters, UI, logos, watermark, scenery or additional characters.
```

**Imagegen-Original:** `C:\Users\madde\.codex\generated_images\019f859c-8d0d-73c0-89ac-43f40a2637a4\exec-ed84c96c-1b04-4e23-b85e-5649451c8cd2.png`
