import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosConfig';
import { useForm } from "react-hook-form";
import environment from '../../utils/environment';
import { AxiosWithAuth } from '../../utils/AxiosWithAuth';;
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';



export function Profile() {
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors, isSubmitting },
    } = useForm();

    const [error, setError] = useState(null);
    const [profileData, setProfileData] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (error) {
            window.alert(error);
        }
    }, [error]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await AxiosWithAuth().get(`${environment.API_URL}/user/profile`)
                setProfileData(response.data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    if (err.code === "ERR_CANCELED") return;
                    if (err.response?.status === 401 || err.response?.status === 403) {
                        localStorage.removeItem('token');
                        setError("Session expired. Please log in again.");
                        if (navigate) navigate('/login');
                        return;
                    }
                }
            }
        };
        fetchProfile();
    }, []);

    const normalizeUser = u => ({
        id: u.id,
        name: u.name ?? "",
        email: u.email,
        createdAt: u.created_at,
        updatedAt: u.updated_at,
        isActive: u.is_active,
        country: u.country ?? "",
        city: u.city ?? "",
        district: u.district ?? "",
        street: u.street ?? "",
        full_address: u.full_address ?? ""
    });

    const onProfileUpdate = async (data) => {
        setError(null);
        try {
            const payload = {};
            if (data.name !== profileData.name) payload.name = data.name;
            if (data.password) payload.password = data.password;
            if (data.country !== profileData.country) payload.country = data.country;
            if (data.city !== profileData.city) payload.city = data.city;
            if (data.district !== profileData.district) payload.district = data.district;
            if (data.street !== profileData.street) payload.street = data.street;
            if (data.full_address !== profileData.full_address) payload.full_address = data.full_address;
            if (Object.keys(payload).length === 0) {
                setIsEditing(false);
                return;
            }
            const response = await AxiosWithAuth().patch(`${environment.API_URL}/user/profile`, payload);
            setProfileData((prev) => ({ ...prev, ...normalizeUser(response.data) }));
            setIsEditing(false);
        } catch (error) {
            setError("Failed to update profile");
        }
    }

    const handleEdit = () => {
        if (!isEditing && profileData) {
            reset({ name: profileData.name, password: "" });
        }
        setIsEditing(e => !e);
    };

    const FieldRow = ({ label, children }) => (
        <div className="field-row">
            <strong>{label}: </strong>{children}
        </div>
    );

    const handleLogout = async () => {
        const response = await AxiosWithAuth().post("/logout");
        console.log(response);
        localStorage.removeItem('token');
        window.dispatchEvent(new Event("auth-change"));
        navigate('/login');
    }

    if (!profileData) return <div>Loading...</div>;
    return (
        <div className="Profile">
            <header className="Profile-header">
                <h2>Profile Information</h2>
                <div className="profileInfo">
                    <FieldRow label="Email">
                        {profileData.email}
                    </FieldRow>

                    <FieldRow label="Name">
                        {isEditing
                            ? <input type="text" {...register("name")} defaultValue={profileData.name} />
                            : (profileData.name || "-")}
                    </FieldRow>

                    <FieldRow label="Password">
                        {isEditing
                            ? <input type="password" placeholder="New password" {...register("password")} />
                            : "•".repeat(6)}
                    </FieldRow>

                    <FieldRow label="Created At">
                        {new Date(profileData.created_at || profileData.createdAt).toLocaleString()}
                    </FieldRow>

                    <FieldRow label="Updated At">
                        {profileData.updated_at
                            ? new Date(profileData.updated_at).toLocaleString()
                            : "—"}
                    </FieldRow>

                    <FieldRow label="Active">
                        {profileData.is_active ? "Yes" : "No"}
                    </FieldRow>
                </div>
                <div className="splitter">Address Information:</div>
                <div className="addressInfo">
                    <FieldRow label="Country">
                        {isEditing
                            ? <input type="text" placeholder="Country" {...register("country")} defaultValue={profileData.country} />
                            : (profileData.country ? profileData.country : "—")}
                    </FieldRow>
                    <FieldRow label="City">
                        {isEditing
                            ? <input type="text" placeholder="City" {...register("city")} defaultValue={profileData.city} />
                            : (profileData.city ? profileData.city : "—")}
                    </FieldRow>
                    <FieldRow label="District">
                        {isEditing
                            ? <input type="text" placeholder="District" {...register("district")} defaultValue={profileData.district} />
                            : (profileData.district ? profileData.district : "—")}
                    </FieldRow>
                    <FieldRow label="Street">
                        {isEditing
                            ? <input type="text" placeholder="Street" {...register("street")} defaultValue={profileData.street} />
                            : (profileData.street ? profileData.street : "—")}
                    </FieldRow>
                    <FieldRow label="Full Address">
                        {isEditing
                            ? <input type="text" placeholder="Full Address" {...register("full_address")} defaultValue={profileData.full_address} />
                            : (profileData.full_address ? profileData.full_address : "—")}
                    </FieldRow>
                </div>

                <div className="actions">
                    {!isEditing && (
                        <button type="button" onClick={handleEdit}>Edit</button>
                    )}
                    {isEditing && (
                        <>
                            <button type="button" onClick={() => { handleSubmit(onProfileUpdate)(); }}>Save</button>
                            <button type="button" onClick={handleEdit}>Cancel</button>
                        </>
                    )}
                    <button type="button" onClick={() => { handleLogout() }}>Logout</button>
                </div>
                {error && <p role="alert" className="error">{error}</p>}
            </header>
        </div>
    )
} 