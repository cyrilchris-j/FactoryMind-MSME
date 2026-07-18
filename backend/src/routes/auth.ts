import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { demoUsers } from '../data/seed';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

router.post('/login', (req: Request, res: Response) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid credentials format' });
    return;
  }

  const user = demoUsers.find(
    (u) => u.email === parsed.data.email && u.password === parsed.data.password
  );

  if (!user) {
    res.status(401).json({ error: 'Invalid email or password' });
    return;
  }

  const token = Buffer.from(JSON.stringify({ id: user.id, email: user.email, role: user.role })).toString('base64');

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  });
});

router.get('/me', (req: Request, res: Response) => {
  const auth = req.headers.authorization?.replace('Bearer ', '');
  if (!auth) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  try {
    const decoded = JSON.parse(Buffer.from(auth, 'base64').toString());
    const user = demoUsers.find((u) => u.id === decoded.id);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

export default router;
