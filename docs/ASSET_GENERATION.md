# Generierte Styleframe-Assets

Stand: 21. Juli 2026. Alle hier aufgeführten finalen Assets wurden mit Built-in Imagegen erzeugt. Es wurde kein CLI-Fallback verwendet.

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
