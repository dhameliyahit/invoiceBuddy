import React from "react";
import "@fontsource/playfair-display";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import axios from "axios";
import { useState,useEffect } from "react";
import { alertError, alertSuccess } from './../../utils/alert';
import Loader from "./Loader";
import { LayoutDashboard } from "lucide-react";

const base_url = import.meta.env.VITE_BACKEND_URL;

export default function ConfigPage() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
        watch
    } = useForm();

    const logo = watch("logo");

    useEffect(() => {
        const fetchCurrentConfig = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await axios.get(`${base_url}/api/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const user = res.data.user;
                if (user) {
                    setValue("businessName", user.businessName);
                    setValue("contact", user.businessPhone);
                    setValue("email", user.businessEmail);
                    setValue("watermark", user.waterMark);
                    setValue("address", user.businessAddress);
                    setValue("endMessage", user.endMessage);
                    // logo is handled separately for preview
                }
            } catch (err) {
                console.error("Fetch Config Error:", err);
            }
        };
        fetchCurrentConfig();
    }, [setValue]);


    const onSubmit = async (data) => {
        try {
            const formData = new FormData();
            formData.append("businessName", data.businessName);
            formData.append("businessAddress", data.address);
            formData.append("businessPhone", data.contact);
            formData.append("businessEmail", data.email);
            formData.append("waterMark", data.watermark);
            formData.append("endMessage", data.endMessage);

            if (data.logo && data.logo[0]) {
                formData.append("logo", data.logo[0]);
            }
            setLoading(true);
            const res = await axios.post(`${base_url}/api/config`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                withCredentials: true,
            });

            if (res.data.success) {
                alertSuccess("Business configured successfully!");
                navigate(res.data.redirect);
            } else {
                alertError(res.data.message || "Failed to configure business");
            }

        } catch (error) {
            console.error("Config Error:", error.response?.data || error.message);
            alertError(error.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false)
        }
    };



    return (
        <div className="min-h-full w-full flex flex-col md:flex-row shadow-inner overflow-hidden">
            {/* Left Panel - Logo Upload */}
            {loading && <Loader text="Configuring your business details..." />}
            <div className="w-1/4 bg-[#280A3E] flex flex-col items-center justify-center text-white p-6 relative">
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className="absolute top-4 left-4 cursor-pointer text-white hover:text-gray-300 text-sm flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 transition-all"
                >
                    <LayoutDashboard size={14} />
                    Exit Settings
                </button>

                <h2
                    className="text-2xl font-bold mb-6 tracking-wide mt-6"
                    style={{ fontFamily: "Playfair Display, cursive" }}
                >
                    Upload Logo
                </h2>

                <div className="relative">
                    {logo?.length > 0 ? (
                        <img
                            src={URL.createObjectURL(logo[0])}
                            alt="Business Logo"
                            className="h-44 w-44 rounded-full object-cover border-4 border-[#F2EDD1] shadow-2xl "
                        />
                    ) : (
                        <div className="h-44 w-44 text-xl flex items-center justify-center rounded-full bg-black/30 text-white border-2 border-dashed border-white shadow-inner">
                            Logo
                        </div>
                    )}
                    <label className="absolute bottom-2 right-2 bg-white text-indigo-700 px-3 py-1 rounded-full cursor-pointer shadow-lg text-xs hover:bg-gray-200">
                        Upload
                        <input
                            type="file"
                            accept="image/*"
                            {...register("logo")}
                            className="hidden"
                        />
                    </label>
                </div>
            </div>

            {/* Right Panel - Business Info */}
            <div className="w-3/4 flex flex-col justify-center bg-[#F1F0E4] p-10">
                <h1
                    className="text-4xl font-bold mb-6 text-gray-800"
                    style={{ fontFamily: "Playfair Display, cursive" }}
                >
                    Business Information
                </h1>

                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <div>
                        <label className="block text-md font-bold text-gray-700">
                            Business Name :
                        </label>
                        <input
                            type="text"
                            {...register("businessName", { required: "Business name is required" })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Enter business name"
                        />
                        {errors.businessName && <p className="text-red-500 text-sm mt-1">{errors.businessName.message}</p>}
                    </div>

                    <div>
                        <label className="block text-md font-bold text-gray-700">
                            Contact No :
                        </label>
                        <input
                            type="text"
                            {...register("contact", {
                                required: "Contact is required",
                                pattern: {
                                    value: /^[0-9]{10,15}$/,
                                    message: "Enter a valid phone number"
                                }
                            })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Enter contact number"
                        />
                        {errors.contact && <p className="text-red-500 text-sm mt-1">{errors.contact.message}</p>}
                    </div>

                    <div>
                        <label className="block text-md font-bold text-gray-700">
                            Email :
                        </label>
                        <input
                            type="email"
                            {...register("email", {
                                required: "Email is required",
                                pattern: {
                                    value: /^\S+@\S+\.\S+$/,
                                    message: "Invalid email format"
                                }
                            })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Enter email"
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                    </div>

                    <div>
                        <label className="block text-md font-bold text-gray-700">
                            Watermark :
                        </label>
                        <input
                            type="text"
                            {...register("watermark")}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Enter watermark text"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-md font-bold text-gray-700">
                            Address :
                        </label>
                        <textarea
                            rows="2"
                            {...register("address", { required: "Address is required" })}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Business address"
                        />
                        {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-md font-bold text-gray-700">
                            End Message :
                        </label>
                        <input
                            type="text"
                            {...register("endMessage")}
                            className="mt-1 block w-full rounded-lg border border-gray-300 p-2"
                            placeholder="Message at invoice end"
                        />
                    </div>

                    {/* Save Button */}
                    <div className="md:col-span-2 mt-8 flex justify-end" style={{ fontFamily: "Playfair Display, cursive" }}>
                        <button
                            type="submit"
                            className="relative cursor-pointer inline-flex items-center justify-center px-10 py-3 
               font-semibold tracking-wide text-white rounded-xl shadow-lg overflow-hidden
               transition-all duration-300 ease-out group
               transform hover:scale-105 active:scale-95"
                        >
                            <span className="absolute inset-0 bg-[#19183B]
                     group-hover:from-[#4F709C] group-hover:via-[#415E72] group-hover:to-[#415E72] 
                     transition-all duration-500 ease-in-out"></span>

                            <span className="absolute inset-0 bg-[#19183B] opacity-0 group-active:opacity-100 transition duration-200"></span>

                            <span className="absolute -left-16 top-0 w-1/3 h-full bg-white/20 skew-x-12 
                     group-hover:left-[120%] transition-all duration-700 ease-in-out"></span>

                            <span className="relative z-10 flex items-center gap-2">
                                {loading ? "Loading..." : "Save Configuration"}
                            </span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
