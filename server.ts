import express, { Request, Response } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Ladda miljövariabler från .env-filen
dotenv.config();

const app = express();
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

// Konfigurera multer för filuppladdningar
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Definiera din POST-rutt för att hantera uppladdning av bilder
app.post("/upload", upload.single("image"), async (req: Request, res: Response): Promise<void> => {
  try {
    // Om ingen fil laddades upp, returnera ett fel
    if (!req.file) {
      res.status(400).send("Ingen fil laddades upp");
      return;
    }

    // Ladda upp filen till Supabase
    const { data, error } = await supabase.storage
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
      fileUrl: `${process.env.SUPABASE_URL}/storage/v1/object/public/images/${data?.path}`,
    });
  } catch (err) {
    // Hantera eventuella fel som kan inträffa under uppladdning
    res.status(500).send("Serverfel");
  }
});

// Sätt upp servern att lyssna på en port
const port = 5000;
app.listen(port, () => {
  console.log(`Servern kör på http://localhost:${port}`);
});