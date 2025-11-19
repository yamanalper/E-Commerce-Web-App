import { useState } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useForm } from "react-hook-form";
import environment from '../../utils/environment';
import './auth.css';


export function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [error, setError] = useState(null);

  const onRegister = async (data) => {
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('username', data.email);
      params.append('password', data.password);
      const response = await axiosInstance.post(`${environment.API_URL}/register/`, params, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });
      console.log("User created successfully:", response.data);

    } catch (error) {
      setError(error.message);
      console.error('There was an error creating the user:', error);
    }
  };

  return (
    <div className="authShell">
      <div className="authCard">
        <h1>Create Account</h1>
        <form onSubmit={handleSubmit(onRegister)}>
          <div className="authField">
            <input type="email" placeholder="Email" {...register("email", { required: "Email is required" })} />
            {errors.email && <p className="error-message"> {errors.email.message}</p>}
          </div>
          <div className="authField">
            <input type="password" placeholder="Password" {...register("password", { required: "Password is required", minLength: { value: 4, message: "Password must be at least 4 characters long" } })} />
            {errors.password && <p className="error-message">{errors.password.message}</p>}
          </div>
          <button className="authBtn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
          {error && <p className="error-message">{error}</p>}
        </form>
        <p className="authAlt">Have an account? <a href="#/login">Login</a></p>
      </div>
    </div>
  );
}