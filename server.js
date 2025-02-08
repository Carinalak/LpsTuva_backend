"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.JWT_SECRET) {
    console.error('Nödvändiga miljövariabler saknas i .env-filen');
    process.exit(1);
}
const app = (0, express_1.default)();
const port = 3000;
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: ['https://lpstuva.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
app.options('*', (0, cors_1.default)());
// Middleware för att verifiera JWT-token
const authenticateToken = (req, res, next) => {
    var _a;
    const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
    if (!token) {
        res.status(401).json({ error: 'Ingen token tillhandahållen' });
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).json({ error: 'Ogiltig token' });
            return;
        }
        req.body.user = decoded; // Detta inkluderar `user_id` från token-payload
        next();
    });
};
/** USERS ROUTES */
// Hämta den inloggade användaren baserat på token
app.get('/users', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.body.user.id;
    try {
        const { data, error } = yield supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();
        if (error || !data) {
            res.status(404).json({ error: 'Användaren hittades inte.' });
            return;
        }
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: 'Serverfel vid hämtning av användaren.' });
    }
}));
// Skapa användare
app.post('/users/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        // Kontrollera om användarnamnet redan finns
        const { data: existingUser, error: userError } = yield supabase
            .from('users')
            .select('*')
            .eq('name', name)
            .single();
        if (existingUser) {
            return res.status(400).json({ error: 'Namnet är redan upptaget. Välj ett annat namn.' });
        }
        // Hasha lösenordet
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const { data, error } = yield supabase.from('users').insert([
            { name, password: hashedPassword },
        ]);
        if (error) {
            return res.status(500).json({ error: error.message });
        }
        res.status(201).json({ message: 'Användare registrerad!', data });
    }
    catch (err) {
        res.status(500).json({ error: 'Kunde inte registrera användaren.' });
    }
}));
// Logga in användare
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';
app.post('/auth/login', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, password } = req.body;
    try {
        const { data, error } = yield supabase
            .from('users')
            .select('*')
            .eq('name', name)
            .single();
        if (error || !data) {
            res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
            return;
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, data.password);
        if (!isPasswordValid) {
            res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
            return;
        }
        const token = jsonwebtoken_1.default.sign({ id: data.id, name: data.name }, SECRET_KEY, { expiresIn: '7d' });
        res.status(200).json({
            message: 'Inloggning lyckades',
            token,
            user: {
                id: data.id,
                name: data.name,
            },
        });
    }
    catch (err) {
        res.status(500).json({ error: 'Serverfel vid inloggning.' });
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
