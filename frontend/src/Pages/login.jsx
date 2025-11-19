import { useState } from 'react';
import axiosInstance from "../api/axiosConfig";
import { ClipLoader } from 'react-spinners';
import { useForm } from "react-hook-form";
import environment from "../../utils/environment";
import './auth.css';
import { useNavigate } from 'react-router-dom';

export function Login() {
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
    const [loginError, setLoginError] = useState(null);
    const [loginSuccess, setLoginSuccess] = useState(false);
    const navigate = useNavigate();
    const onSubmit = async (data) => {
        setLoginError(null);


        try {
            const params = new URLSearchParams();
            params.append('username', data.email);
            params.append('password', data.password);

            const response = await axiosInstance.post(`${environment.API_URL}/login`, params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            }
            );
            const { access_token } = response.data; // Bu istek kesinlikle string donmek zorunda
            localStorage.setItem('token', access_token); // Localstorage string kabul eder. JSON.stringify() ile stringe cevirilmeli
            setLoginSuccess(true);
            window.dispatchEvent(new Event("auth-change"));
            navigate('/user/profile');
        } catch (error) {
            if (error.response && error.response.data && error.response.data.detail) {
                setLoginError(error.response.data.detail);
                setLoginSuccess(false)
            }
            else {
                setLoginError('Login Failed.');
                setLoginSuccess(false)
            }
        }
    };

    return (
        <div className="authShell">
            <div className="authCard">
                <h1>Login</h1>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="authField">
                        <input type="email" placeholder="Email" {...register("email", { required: "Email is required" })} />
                        {errors.email && <p className="error-message"> {errors.email.message}</p>}
                    </div>
                    <div className="authField">
                        <input type="password" placeholder="Password" {...register("password", { required: "Password is required", minLength: { value: 4, message: "Password must be at least 4 characters long" } })} />
                        {errors.password && <p className="error-message"> {errors.password.message}</p>}
                    </div>
                    <button className="authBtn" type="submit" disabled={isSubmitting}>
                        {isSubmitting ? <ClipLoader size={18} color="#fff" /> : 'Login'}
                    </button>
                    {loginError && <p className="error-message">{loginError}</p>}
                    {loginSuccess && <span className="success-message">Login successful!</span>}
                </form>
                <p className="authAlt">No account? <a href="#/register">Create one</a></p>
            </div>
        </div>
    );
}
