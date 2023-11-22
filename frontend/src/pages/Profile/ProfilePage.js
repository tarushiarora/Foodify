import React from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/useAuth';
import classes from './profilePage.module.css';
import Title from '../../components/Title/Title';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import ChangePassword from '../../components/ChangePassword/ChangePassword';
import axios from 'axios';

export default function ProfilePage() {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm();

  const { user, updateProfile } = useAuth();

  const submit = (user) => {
    updateProfile(user);
  };

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

  return (
    <div className={classes.container}>
      <div className={classes.details}>
        <Title title="Update Profile" />
        <form onSubmit={handleSubmit(submit)}>
          <Input
            defaultValue={user.name}
            type="text"
            label="Name"
            {...register('name', {
              required: true,
              minLength: 5,
            })}
            error={errors.name}
          />
          <Input
            defaultValue={user.address}
            type="text"
            label="Address"
            {...register('address', {
              required: true,
              minLength: 10,
            })}
            error={errors.address}
          />

          <Button type="submit" text="Update" backgroundColor="#009e84" />
        </form>

        <ChangePassword />

        {/* Add the "Delete Account" button */}
        <Button onClick={handleDeleteAccount} text="Delete Account" backgroundColor="#ff0000" />
      </div>
    </div>
  );
}
