import express, { NextFunction, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';

dotenv.config();

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY || !process.env.JWT_SECRET) {
  console.error('Nödvändiga miljövariabler saknas i .env-filen');
  process.exit(1);
}

const app = express();
const port = 3000;

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_KEY!
);

app.use(express.json());
app.use(cookieParser());

app.use(
  cors({
    origin: ['https://lpstuva.onrender.com', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

app.options('*', cors());

// Middleware för att verifiera JWT-token för User
const authenticateUserToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Ingen token tillhandahållen' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Ogiltig token' });
      return;
    }
    req.body.user = decoded;
    next();
  });
};


// Middleware för att verifiera JWT-token
const authenticateAdminToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    res.status(401).json({ error: 'Ingen token tillhandahållen' });
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET_ADMIN!, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Ogiltig token' });
      return;
    }
    req.body.admin = decoded;
    next();
  });
};



/** ADMIN ROUTES */


// Hämta den inloggade admin baserat på token
app.get('/admin', authenticateAdminToken, async (req: Request, res: Response) => {
  const adminId = req.body.admin.id;

  try {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('id', adminId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Användaren hittades inte.' });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid hämtning av användaren.' });
  }
});

app.post('/admin/register', async (req: Request, res: Response): Promise<any> => {
  const { name, password } = req.body;

  try {
    // Kontrollera om användarnamnet redan finns
    const { data: existingUser, error: userError } = await supabase
      .from('admin')
      .select('*')
      .eq('name', name)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Namnet är redan upptaget. Välj ett annat namn.' });
    }

    // Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('admin').insert([
      { name, password: hashedPassword },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Användare registrerad!', data });
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte registrera användaren.' });
  }
});

// Logga in admin
const SECRET_KEY_ADMIN = process.env.JWT_SECRET_ADMIN || 'fallback_secret_key';

app.post('/auth/login_admin', async (req: Request, res: Response): Promise<void> => {
  const { name, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('admin')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) {
      res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
      return;
    }

    const token = jwt.sign(
      { id: data.id, name: data.name },
      SECRET_KEY_ADMIN,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Inloggning lyckades',
      token,
      admin: {
        id: data.id,
        name: data.name,
        role: 'admin',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid inloggning.' });
  }
});


/** USERS ROUTES */

// Hämta den inloggade användaren baserat på token
app.get('/users', authenticateUserToken, async (req: Request, res: Response) => {
  const userId = req.body.user.id;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !data) {
      res.status(404).json({ error: 'Användaren hittades inte.' });
      return;
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid hämtning av användaren.' });
  }
});

// Skapa användare
app.post('/users/register', async (req: Request, res: Response): Promise<any> => {
  const { name, password } = req.body;

  try {
    // Kontrollera om användarnamnet redan finns
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (existingUser) {
      return res.status(400).json({ error: 'Namnet är redan upptaget. Välj ett annat namn.' });
    }

    // Hasha lösenordet
    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('users').insert([
      { name, password: hashedPassword },
    ]);

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.status(201).json({ message: 'Användare registrerad!', data });
  } catch (err) {
    res.status(500).json({ error: 'Kunde inte registrera användaren.' });
  }
});

// Logga in användare
const SECRET_KEY = process.env.JWT_SECRET || 'fallback_secret_key';

app.post('/auth/login_user', async (req: Request, res: Response): Promise<void> => {
  const { name, password } = req.body;

  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('name', name)
      .single();

    if (error || !data) {
      res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, data.password);

    if (!isPasswordValid) {
      res.status(401).json({ error: 'Fel användarnamn eller lösenord.' });
      return;
    }

    const token = jwt.sign(
      { id: data.id, name: data.name },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      message: 'Inloggning lyckades',
      token,
      user: {
        id: data.id,
        name: data.name,
        role: 'user',
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Serverfel vid inloggning.' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
