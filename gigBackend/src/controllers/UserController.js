import { getAllUsers, updateUserRole } from '../models/UserModel.js';

// Admin: Get all users
export const getAllUsersController = async (req, res) => {
  try {
    const users = await getAllUsers();
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: Update user role
export const updateUserRoleController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const user = await updateUserRole(userId, role);
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
