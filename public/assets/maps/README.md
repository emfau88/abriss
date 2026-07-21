# Good-Mood-Inselkarte

- `sunny-sky-background-hd.png`: verwendeter 3200×1800-Hintergrund
- `good-mood-terrain-hd.png`: verwendetes 3200×1800-Terrain mit Alpha

Das Vordergrundbild enthält eine massive untere Landform und zwei schwebende Inseln. Seine Alphaform wird zur Laufzeit auf die 1600×900-Zellen-Terrainmaske abgetastet. Die Darstellung bleibt davon getrennt in voller Weltauflösung. Darstellung, Ballistik und Zerstörung verwenden dadurch dieselbe Form, ohne die Grafik auf Maskenauflösung zu reduzieren. Die kleineren Dateien bleiben als ursprüngliche Styleframe-Quellen erhalten.

Die Assets wurden mit Built-in Imagegen erzeugt. Das Terrain wurde auf grünem Chroma-Key generiert und anschließend mit Soft-Matte und Despill freigestellt. Die vollständigen Prompts stehen in `docs/ASSET_GENERATION.md`. Die kleineren ursprünglichen Styleframe-Quellen liegen außerhalb des ausgelieferten Web-Builds unter `source-assets/maps/`.
