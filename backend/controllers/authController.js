import { supabase } from '../config/supabaseClient.js';

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please add all fields' });
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        }
      }
    });

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    if (data.user) {
      res.status(201).json({
        _id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email,
        token: data.session?.access_token,
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return res.status(401).json({ message: error.message || 'Invalid credentials' });
    }

    if (data.user) {
      res.json({
        _id: data.user.id,
        name: data.user.user_metadata.name,
        email: data.user.email,
        token: data.session?.access_token,
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    // req.user logic is handled by middleware
    res.json({
      _id: req.user.id,
      name: req.user.user_metadata?.name,
      email: req.user.email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
