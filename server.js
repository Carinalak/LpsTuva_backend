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
const multer_1 = __importDefault(require("multer"));
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
// Ladda miljövariabler från .env-filen
dotenv_1.default.config();
const app = (0, express_1.default)();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
// Konfigurera multer för filuppladdningar
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage: storage });
// Definiera din POST-rutt för att hantera uppladdning av bilder
app.post("/upload", upload.single("image"), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Om ingen fil laddades upp, returnera ett fel
        if (!req.file) {
            res.status(400).send("Ingen fil laddades upp");
            return;
        }
        // Ladda upp filen till Supabase
        const { data, error } = yield supabase.storage
            .from("images")
            .upload(`images/${Date.now()}-${req.file.originalname}`, req.file.buffer, {
            contentType: req.file.mimetype,
        });
        // Om det uppstår ett fel vid uppladdningen, returnera ett fel
        if (error) {
            res.status(500).send(error.message);
            return;
        }
        // Returnera en framgångsrik status med URL till den uppladdade filen
        res.status(200).send({
            message: "Fil uppladdad!",
            fileUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${data === null || data === void 0 ? void 0 : data.path}`,
        });
    }
    catch (err) {
        // Hantera eventuella fel som kan inträffa under uppladdning
        res.status(500).send("Serverfel");
    }
}));
// Sätt upp servern att lyssna på en port
const port = 5000;
app.listen(port, () => {
    console.log(`Servern kör på http://localhost:${port}`);
});
