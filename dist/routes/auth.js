"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const seed_1 = require("../data/seed");
const router = (0, express_1.Router)();
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(1),
});
router.post('/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        res.status(400).json({ error: 'Invalid credentials format' });
        return;
    }
    const user = seed_1.demoUsers.find((u) => u.email === parsed.data.email && u.password === parsed.data.password);
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
router.get('/me', (req, res) => {
    const auth = req.headers.authorization?.replace('Bearer ', '');
    if (!auth) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    try {
        const decoded = JSON.parse(Buffer.from(auth, 'base64').toString());
        const user = seed_1.demoUsers.find((u) => u.id === decoded.id);
        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
    }
    catch {
        res.status(401).json({ error: 'Invalid token' });
    }
});
exports.default = router;
