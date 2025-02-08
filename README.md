# Lps-Tuva Backend


### Ramverk: 
Express

## Installationer med Express med CORS och supabase:
- npm init -y
- npm install express
- npm install cors
- npm install --save-dev @types/node // Vid typescript. Kanske även när jag har js ibackend och ts i frontend.
- npm install dotenv
- npm install @supabase/supabase-js
- npm install multer sharp  // för filuppladdning och multer sharp för bildbearbetning (för att ändra storlek, komprimera, etc.)

- npm install typescript --save-dev  // isstallerar typescript så att npx fungerar

- npx tsc --init  // skapa en tsconfig.json-fil

- npm install ts-node --save-dev  // Om du använder TypeScript måste du köra servern med ts-node för att köra TypeScript-kod direkt

- npm install --save-dev @types/express @types/multer // igen, för att det inte fungerade att ansluta till servern

## Servern körs på:

npx ts-node server.ts


