# Aufgabenwarteschlange

Tasks werden in numerischer Reihenfolge bearbeitet, sofern der Nutzer keine
andere Priorität bestätigt. Es darf höchstens ein Task als `in Arbeit` gelten.

## Status

| Task | Status | Ergebnis |
| --- | --- | --- |
| `001_PROJECT_SETUP.md` | abgeschlossen | lauffähige, getestete Browserprojekt-Basis |
| `002_TERRAIN_PROTOTYPE.md` | abgeschlossen | veränderbare Terrainmaske und sichtbare Krater |
| `003_BALLISTICS_PROTOTYPE.md` | abgeschlossen | gemeinsame Vorschau- und Ausführungsballistik |
| `004_AUTONOMOUS_ACTION_SLICE.md` | abgeschlossen | erklärte autonome Aktion mit Managerintervention |
| `005_WORLD_AND_CAMERA_FOUNDATION.md` | abgeschlossen | große Inselwelt, Übersicht und automatische Aktionskamera |
| `006_TERRAIN_FALL_AND_COMIC_VFX.md` | abgeschlossen | Figurenfall und grafisches VFX-Paket |
| `007_HD_WORLD_RENDERING.md` | abgeschlossen | Fullscreen-taugliche Karten- und Terrainqualität |
| `008_ALTERNATING_ACTION_LOOP.md` | abgeschlossen | fortlaufender Teamwechsel und Matchausgang |
| `009_TEAM_STATUS_HUD.md` | abgeschlossen | kompakte Teamzuordnung und HP |
| `010_HUD_DECLUTTER_AND_TURN_ORDER.md` | abgeschlossen | schmale HUD-Leiste und Zugvorschau |
| `011_PLAYER_CONTROL_EXPERIMENT.md` | bereit | direkter Steuerungsvergleich |
| `012_AUTONOMY_MOVEMENT_AND_CREATURES.md` | abgeschlossen | 3-gegen-3-Autonomietest mit Bewegung |
| `013_KNOCKBACK_GRENADES_AND_WEAPON_COMMAND.md` | abgeschlossen | Rückstoß, Zeitzünder und Waffenwahl |
| `014_GITHUB_PAGES_AND_MOBILE_SHELL.md` | abgeschlossen | Pages-Veröffentlichung und mobile Hülle |
| `015_FLUID_SLIME_CHARACTER.md` | abgeschlossen | GLIB als 32-Frame-Animationsbeweis |
| `016_THIN_MANAGER_LOOP.md` | abgeschlossen | Menü, Crewplanung, Bericht und Freischaltung |
| `017_SECOND_SPACE_MAP.md` | abgeschlossen | zweite Fullscreen-Karte und Kartenwahl |
| `018_TOUCH_CAMERA_GESTURES.md` | abgeschlossen | Ein-Finger-Pan und Zwei-Finger-Zoom |
| `019_FLUID_GHOST_CHARACTER.md` | abgeschlossen | referenznaher Ghost als jitterfreies 32-Frame-Sheet |
| `020_CHICKEN_AND_FEEDBACK_ASSET_PACK.md` | bereit | Chicken, Projektil-/Sekundär-VFX und kleine Zusatzassets |
| `021_HEADLESS_MATCH_ENGINE.md` | bereit | rendererunabhängige Zug-Orchestrierung unter `src/simulation/match/` |

Ein Status wird erst nach überprüfter Abnahme geändert. Scope-Erweiterungen
gehören in einen neuen Task, nicht stillschweigend in einen bestehenden.
