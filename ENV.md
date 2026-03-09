# Dónde obtener cada valor del `.env`

## Cal.com — `PUBLIC_CAL_LINK` (obligatorio para que Reservar funcione)

1. Entra en [cal.com](https://cal.com) e inicia sesión.
2. Ve a **Event Types** y copia el enlace del evento que quieres usar (o el de tu perfil).
3. **Valor:** solo la parte después de `cal.com/`, sin barras al inicio.
   - Ejemplo: si la URL es `https://cal.com/daniel-torres-calvo` → `PUBLIC_CAL_LINK="daniel-torres-calvo"`.
   - Si usas un tipo de evento: `daniel-torres-calvo/secret` o `daniel-torres-calvo/30min`.
4. Si ves **404 - Cal Link seems to be wrong**, el valor no coincide con tu Cal.com: revisa el slug en la URL de tu evento y ponlo exacto en `.env`.

## Sanity — `PUBLIC_SANITY_PROJECT_ID`

1. Entra en [sanity.io/manage](https://www.sanity.io/manage).
2. Selecciona tu proyecto (o créalo si aún no existe).
3. **Project ID** lo ves en:
   - La URL: `https://www.sanity.io/manage/project/fcrjghqs` → el ID es `fcrjghqs`.
   - O en **Project settings** (engranaje) → **Project ID**.
4. **Valor:** `PUBLIC_SANITY_PROJECT_ID="fcrjghqs"` (o el ID de tu proyecto).

## Sanity — `PUBLIC_SANITY_DATASET`

1. En [sanity.io/manage](https://www.sanity.io/manage) → tu proyecto.
2. Menú **API** → **Datasets**.
3. Normalmente existe el dataset **production**. Si creaste otro, usa su nombre.
4. **Valor:** `PUBLIC_SANITY_DATASET="production"`.

## WhatsApp (botón flotante) — opcionales

- **`PUBLIC_WHATSAPP_NUMBER`** — Número con código de país sin + ni espacios. Por defecto: `50684872727`.
- **`PUBLIC_WHATSAPP_MESSAGE`** — Mensaje por defecto al abrir WhatsApp. Por defecto: "Hola, vengo de la web y me gustaría información..."

## Mapa de contacto — opcional

- **`PUBLIC_GOOGLE_MAPS_EMBED`** — URL del iframe de Google Maps (Share → Insertar un mapa). Si no se define, se muestra un enlace "Ver ubicación en Google Maps".

## Google Places (reseñas en la Home) — opcionales

- **`PUBLIC_GOOGLE_PLACE_ID`** — Place ID de tu negocio en Google. Por defecto ya está configurado el de Blue Royale Spa (`ChIJlSq-Tts5no8RFNWJ7oxh7AE`). Para otro negocio: [Place ID Finder](https://developers.google.com/maps/documentation/places/web-service/place-id).
- **`PUBLIC_GOOGLE_PLACES_API_KEY`** — API Key de Google Cloud con **Places API (New)** habilitada. Crear en [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create API Key; luego en "API & Services" → "Library" activar "Places API (New)".

Las reseñas se obtienen en **tiempo de build** (no en cada visita) y solo se muestran las de 4 y 5 estrellas.

---

Después de editar `.env`, reinicia el servidor de desarrollo (`npm run dev`) o vuelve a hacer `npm run build` para que Astro cargue las nuevas variables.
