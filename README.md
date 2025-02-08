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
- npm start

### För att installera typescript globalt
- npm install -g typescript
- tsc --version 

// Om det här kommandot inte visar vilken verion det är måste du skriva följande:
- Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

Prova igen med tsc --version  om det visar vilken version är typescript korrekt installerat
När du har en tsconfig.json kan du använda TypeScript-kompilatorn (tsc) för att bygga ditt projekt. I terminalen, i din projektmapp (där tsconfig.json finns), skriv: tsc

Nu måste jag köra tsc varje gång innan jag committar, och använta .ts filen för utveckling samt .js filen till att deploya med.

### Webtoken:
- npm install jsonwebtoken
- npm install @types/jsonwebtoken --save-dev 

### Encryption:
- npm install bcrypt

### Cookies:
- npm install cookie-parser
- npm install --save-dev @types/cookie-parser




