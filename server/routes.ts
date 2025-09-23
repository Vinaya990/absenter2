import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { insertUserSchema, insertEmployeeSchema, insertDepartmentSchema, insertLeaveRequestSchema } from '../shared/schema';
import './types'; // Import type extensions

const router = express.Router();

// JWT secret (in production, this should be an environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Authentication middleware
const authenticateToken = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const user = await storage.getUserByUsername(decoded.username);
    if (!user) {
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  } catch (error) {
    return res.sendStatus(403);
  }
};

// Auth routes
router.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = await storage.getUserByUsername(username);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a real app, use bcrypt.compare. For demo, we'll do simple comparison
    // const isValidPassword = await bcrypt.compare(password, user.password_hash);
    const isValidPassword = password === user.password_hash;
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { username: user.username, id: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Update last_login
    await storage.updateUser(user.id, { last_login: new Date() });

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        employee_id: user.employee_id,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at,
        updated_at: user.updated_at,
        last_login: new Date().toISOString()
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/register', async (req, res) => {
  try {
    const { username, password, email, employee_id } = req.body;
    
    if (!username || !password || !employee_id) {
      return res.status(400).json({ error: 'Username, password, and employee_id are required' });
    }

    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Hash password (for demo, we'll store as is)
    // const passwordHash = await bcrypt.hash(password, 10);
    const passwordHash = password;

    const newUser = await storage.createUser({
      username,
      email,
      password_hash: passwordHash,
      employee_id,
      role: 'employee',
      is_active: true
    });

    const token = jwt.sign(
      { username: newUser.username, id: newUser.id, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        employee_id: newUser.employee_id,
        role: newUser.role,
        is_active: newUser.is_active,
        created_at: newUser.created_at,
        updated_at: newUser.updated_at,
        last_login: newUser.last_login
      },
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      employee_id: user.employee_id,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
      last_login: user.last_login
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/auth/logout', authenticateToken, async (req, res) => {
  // In a real app, you might blacklist the JWT token or use refresh tokens
  res.json({ message: 'Logged out successfully' });
});

// User routes
router.get('/users', authenticateToken, async (req, res) => {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Employee routes
router.get('/employees', authenticateToken, async (req, res) => {
  try {
    const employees = await storage.getAllEmployees();
    res.json(employees);
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Department routes
router.get('/departments', authenticateToken, async (req, res) => {
  try {
    const departments = await storage.getAllDepartments();
    res.json(departments);
  } catch (error) {
    console.error('Get departments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave Request routes
router.get('/leave-requests', authenticateToken, async (req, res) => {
  try {
    const leaveRequests = await storage.getAllLeaveRequests();
    res.json(leaveRequests);
  } catch (error) {
    console.error('Get leave requests error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/leave-requests', authenticateToken, async (req, res) => {
  try {
    const validatedData = insertLeaveRequestSchema.parse(req.body);
    const leaveRequest = await storage.createLeaveRequest(validatedData);
    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Create leave request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Holiday routes
router.get('/holidays', authenticateToken, async (req, res) => {
  try {
    const holidays = await storage.getAllHolidays();
    res.json(holidays);
  } catch (error) {
    console.error('Get holidays error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Leave Policy routes
router.get('/leave-policies', authenticateToken, async (req, res) => {
  try {
    const leavePolicies = await storage.getAllLeavePolicies();
    res.json(leavePolicies);
  } catch (error) {
    console.error('Get leave policies error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;