# Arkeanos World · Modo HARDCORE (TikTok 9:16)

Video vertical 1080x1920 a 30 fps, de 38 s, hecho con [Remotion](https://remotion.dev).
El render final está en `render/arkeanos-hardcore.mp4`.

## Uso

```bash
npm install
npm run dev        # abre Remotion Studio para previsualizar
npm run render     # renderiza a out/arkeanos-hardcore.mp4
npm run audio      # regenera música y efectos (requiere python3 + numpy + scipy)
```

En el Studio podés activar la prop `showSafeZone` para ver la zona segura de TikTok
(150px arriba, 250px abajo y la columna de botones a la derecha).

## Dónde editar

| Qué | Archivo |
| --- | --- |
| Textos y datos del server (IP, puerto, Discord, versiones, vidas) | `src/config.ts` |
| Timing, BPM, transiciones, efectos de sonido, shakes y flashes | `src/timeline.ts` |
| Colores y fuentes | `src/theme.ts` |
| Música y efectos (síntesis procedural, libre de derechos) | `scripts/generate_audio.py` |

En los textos: `*palabra*` = rojo, `~palabra~` = amarillo, `|` = salto de línea.

## Estructura

- **0-3 s Gancho**: latido, electrocardiograma y "¿CUÁNTO VAS A DURAR?".
- **3-8 s Logo**: calavera + ARKEANOS WORLD con glitch y flash rojo, cuenta regresiva 3-2-1.
- **8-20 s Drop 1, Modo Hardcore**: sin protecciones, TNT que explota en el beat, espadas que chocan, y los 3 corazones que se rompen uno por uno.
- **20-28 s Ritmo rápido**: clanes y alianzas, dominá el server, streamers y rango MEDIA gratis, "¿ESTÁS LISTO?" con redoble.
- **28-38 s Drop 2, Cierre**: IP tipeada, puerto, compatibilidad Java/Bedrock, pantalla final con Discord y el CTA. La música hace fade out.

La música va a 120 BPM (1 beat = 15 frames), así cada corte cae sobre un beat. Si cambiás
el BPM o los drops en `src/timeline.ts`, cambialos también en `scripts/generate_audio.py` y regenerá el audio.
