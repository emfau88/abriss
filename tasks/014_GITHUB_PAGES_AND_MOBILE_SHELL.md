# Task 014: GitHub Pages und mobile Spielhülle

## Status

`abgeschlossen`

## Ziel

Der bestehende Vertical Slice wird ohne Gameplayänderungen als reproduzierbarer GitHub-Pages-Build veröffentlicht und nutzt den verfügbaren Browserbereich auf Desktop sowie mobilen Hoch- und Querformaten sinnvoll aus.

## Pflichtlektüre

- `AGENTS.md`
- `docs/00_PROJECT_INDEX.md`
- `docs/03_TECHNICAL_ARCHITECTURE.md`
- `docs/04_VERTICAL_SLICE.md`
- `docs/DECISIONS.md`

## Scope

- Vite-Basispfad und öffentliche Assetpfade funktionieren unter `/abriss/`,
- GitHub-Actions-Workflow baut und veröffentlicht `dist/` über GitHub Pages,
- responsive Spielhülle ohne unnötige Außenabstände oder Rundungen auf kleinen Displays,
- Berücksichtigung mobiler Safe Areas und `100dvh`,
- Hoch- und Querformat bleiben bedienbar; das 16:9-Spiel wird vollständig eingepasst,
- Repository-Metadaten und README erklären lokale Nutzung und Pages-Veröffentlichung,
- Browserprüfung des Produktionsbuilds unter einem Pages-ähnlichen Unterpfad.

## Nichtziele

- Umbau des 16:9-HUDs in eine eigene Hochformat-Spieloberfläche,
- Touch-Neuentwurf aller Controls,
- Hauptmenü, Manager-Ebene oder neue Gameplayregeln,
- PWA, Offlinecache oder App-Store-Paketierung.

## Akzeptanzkriterien

1. `npm test`, Typprüfung und Produktionsbuild sind erfolgreich.
2. Alle Karten-, Figuren- und VFX-Dateien laden aus dem Pages-Unterpfad.
3. Desktop, mobiles Querformat und mobiles Hochformat zeigen das vollständige Spiel ohne Seiten-Scrolling.
4. Ein Workflow kann den Build aus dem Standardbranch auf GitHub Pages veröffentlichen.
5. Der geprüfte Stand ist im angegebenen GitHub-Repository vorhanden.

## Verifikation

- `npm test`
- `npm run build`
- lokaler Preview-Test unter `/abriss/`
- Browser-Screenshots bei Desktop, 844×390 und 390×844
- Kontrolle des GitHub-Remotes und Push-Ergebnisses

## Abschlussbericht

- Vite und sämtliche Laufzeitassets verwenden portable relative Pfade; derselbe Build funktioniert an der Domainwurzel und unter `/abriss/`.
- Der Workflow installiert aus dem Lockfile, führt Tests und Build aus, aktiviert Pages bei einem leeren Repository und veröffentlicht das geprüfte `dist/`-Artefakt.
- Die Browserhülle nutzt `100dvh`, Notch-Safe-Areas, randlosen mobilen Platz und einen Vollbildschalter auf unterstützten Touch-Browsern.
- Desktop, 844×390 und 390×844 wurden visuell geprüft. Hochformat zeigt das vollständige 16:9-Spiel, bleibt wegen der kleineren HUD-Schrift aber eine sekundäre Darstellung.
- Ungenutzte kleinere Karten-Styleframes bleiben unter `source-assets/maps/` erhalten und werden nicht mehr an Spieler ausgeliefert.
- Verifiziert am 21. Juli 2026 mit 44 Vitest-Tests, erfolgreicher Typprüfung und Produktionsbuild sowie erfolgreichem GitHub-Pages-Deployment unter `https://emfau88.github.io/abriss/`.
