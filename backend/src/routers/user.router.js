import { Router } from 'express';
import jwt from 'jsonwebtoken';
const router = Router();
import { BAD_REQUEST } from '../constants/httpStatus.js';
import handler from 'express-async-handler';
import { UserModel } from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import auth from '../middleware/auth.mid.js';
const PASSWORD_HASH_SALT_ROUNDS = 10;

router.post(
  '/login',
  handler(async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.send(generateTokenResponse(user));
      return;
    }

    res.status(BAD_REQUEST).send('Username or password is invalid');
  })
);


router.post(
  '/register',
  handler(async (req, res) => {
    const { name, email, password, address } = req.body;

    const user = await UserModel.findOne({ email });

    if (user) {
      res.status(BAD_REQUEST).send('User already exists, please login!');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      password,
      PASSWORD_HASH_SALT_ROUNDS
    );

    const newUser = {
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      address,
    };

    const result = await UserModel.create(newUser);
    res.send(generateTokenResponse(result));
  })
);

router.put(
  '/updateProfile',
  auth,
  handler(async (req, res) => {
    const { name, address } = req.body;
    const user = await UserModel.findByIdAndUpdate(
      req.user.id,
      { name, address },
      { new: true }
    );

    res.send(generateTokenResponse(user));
  })
);
const handleDeleteAccount = async () => {
  console.log('Deleting account...');

  try {
    const userId = user.id;

    if (!userId) {
      console.error('User ID is missing.');
      return;
    }

    console.log('User ID:', userId);

    // Make a DELETE request to the backend to delete the account
    await axios.delete(`/api/users/deleteAccount`, {
      headers: {
        Authorization: `Bearer ${user.token}`, // Include the user's token
      },
    });

    // Optionally, you can redirect the user or perform other actions after deletion
  } catch (error) {
    // Handle errors, e.g., display an error message
    console.error(error.response.data.message);
  }
};


router.put(
  '/changePassword',
  auth,
  handler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await UserModel.findById(req.user.id);

    if (!user) {
      res.status(BAD_REQUEST).send('Change Password Failed!');
      return;
    }

    const equal = await bcrypt.compare(currentPassword, user.password);

    if (!equal) {
      res.status(BAD_REQUEST).send('Current Password Is Not Correct!');
      return;
    }

    user.password = await bcrypt.hash(newPassword, PASSWORD_HASH_SALT_ROUNDS);
    await user.save();

    res.send();
  })
);

const generateTokenResponse = user => {
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    address: user.address,
    isAdmin: user.isAdmin,
    token,
  };
};

// user.router.js

// ... (existing code)

router.delete(
  '/deleteAccount',
  auth,
  handler(async (req, res) => {
    try {
      // Find and delete the user
      const user = await UserModel.findByIdAndDelete(req.user.id);

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Optionally, perform additional cleanup or actions

      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  })
);

router.delete(
  '/deleteAccount',
  auth,
  handler(async (req, res) => {
    const userId = req.user.id;

    // Add logic to delete the user account from the database
    await UserModel.findByIdAndDelete(userId);

    // Optionally, you can perform additional cleanup or handle other tasks

    res.send('Account deleted successfully');
  })
);

// ... (other route handlers)


export default router;

