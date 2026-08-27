"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EditProfile() {

    const router = useRouter();

    const [user, setUser] = useState({

        firstName: "Prince",

        lastName: "Bavisiya",

        email: "prince@gmail.com",

        phone: "+91 9876543210",

        gender: "Male",

        dob: "2005-09-07",

        bio: "",

        image: "",

    });

    const [previewImage, setPreviewImage] = useState(null);

    const [errors, setErrors] = useState({});

    const handleChange = (e) => {

        setUser({

            ...user,

            [e.target.name]: e.target.value,

        });

    };

    const handleImageChange = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        if (!file.type.startsWith("image/")) {

            alert("Please select a valid image.");

            return;

        }

        setPreviewImage(URL.createObjectURL(file));

    };

    const validate = () => {

        let temp = {};

        if (!user.firstName.trim())
            temp.firstName = "First name is required";

        if (!user.lastName.trim())
            temp.lastName = "Last name is required";

        if (!user.email.trim())
            temp.email = "Email is required";

        if (!user.phone.trim())
            temp.phone = "Phone number is required";

        setErrors(temp);

        return Object.keys(temp).length === 0;

    };

    const handleSubmit = (e) => {

        e.preventDefault();

        if (!validate()) return;

        console.log(user);

        alert("Profile Updated Successfully");

        // Backend API Here

    };

    return (

        <div className="min-h-screen bg-gray-100 py-12">

            <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden">

                {/* Header */}

                <div className="border-b px-10 py-8 flex justify-between items-center">

                    <div>

                        <h1 className="text-4xl font-bold">

                            Edit Profile

                        </h1>

                        <p className="text-gray-500 mt-2">

                            Update your personal information

                        </p>

                    </div>

                    <button

                        onClick={() => router.back()}

                        className="border px-6 py-3 rounded-xl hover:bg-gray-100 transition"

                    >

                        ← Back

                    </button>

                </div>

                <form
                    onSubmit={handleSubmit}
                    className="p-10"
                >

                    {/* Profile Image */}

                    <div className="flex flex-col items-center mb-12">

                        {

                            previewImage ? (

                                <img

                                    src={previewImage}

                                    alt="Profile"

                                    className="w-36 h-36 rounded-full object-cover border-4 border-gray-200"

                                />

                            ) : (

                                <div className="w-36 h-36 rounded-full bg-black text-white flex items-center justify-center text-5xl font-bold">

                                    {user.firstName.charAt(0)}

                                </div>

                            )

                        }

                        <label

                            htmlFor="profileImage"

                            className="mt-6 cursor-pointer bg-black text-white px-6 py-3 rounded-xl hover:bg-neutral-800 transition"

                        >

                            Change Photo

                        </label>

                        <input

                            id="profileImage"

                            type="file"

                            accept="image/*"

                            className="hidden"

                            onChange={handleImageChange}

                        />

                    </div>

                    {/* Form */}

                    <div className="grid md:grid-cols-2 gap-8">

                        {/* First Name */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                First Name <span className="text-red-500">*</span>

                            </label>

                            <input

                                type="text"

                                name="firstName"

                                value={user.firstName}

                                onChange={handleChange}

                                className={`w-full border rounded-xl p-4 ${errors.firstName ? "border-red-500" : "border-gray-300"
                                    }`}

                            />

                            {errors.firstName && (

                                <p className="text-red-500 text-sm mt-2">

                                    {errors.firstName}

                                </p>

                            )}

                        </div>

                        {/* Last Name */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Last Name <span className="text-red-500">*</span>

                            </label>

                            <input

                                type="text"

                                name="lastName"

                                value={user.lastName}

                                onChange={handleChange}

                                className={`w-full border rounded-xl p-4 ${errors.lastName ? "border-red-500" : "border-gray-300"
                                    }`}

                            />

                            {errors.lastName && (

                                <p className="text-red-500 text-sm mt-2">

                                    {errors.lastName}

                                </p>

                            )}

                        </div>

                        {/* Email */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Email Address

                            </label>

                            <input

                                type="email"

                                name="email"

                                value={user.email}

                                onChange={handleChange}

                                className={`w-full border rounded-xl p-4 ${errors.email ? "border-red-500" : "border-gray-300"
                                    }`}

                            />

                            {errors.email && (

                                <p className="text-red-500 text-sm mt-2">

                                    {errors.email}

                                </p>

                            )}

                        </div>

                        {/* Phone */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Phone Number

                            </label>

                            <input

                                type="text"

                                name="phone"

                                value={user.phone}

                                onChange={handleChange}

                                className={`w-full border rounded-xl p-4 ${errors.phone ? "border-red-500" : "border-gray-300"
                                    }`}

                            />

                            {errors.phone && (

                                <p className="text-red-500 text-sm mt-2">

                                    {errors.phone}

                                </p>

                            )}

                        </div>

                        {/* Gender */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Gender

                            </label>

                            <select

                                name="gender"

                                value={user.gender}

                                onChange={handleChange}

                                className="w-full border border-gray-300 rounded-xl p-4"

                            >

                                <option value="Male">Male</option>

                                <option value="Female">Female</option>

                                <option value="Other">Other</option>

                            </select>

                        </div>

                        {/* Date of Birth */}

                        <div>

                            <label className="block text-sm font-medium mb-2">

                                Date of Birth

                            </label>

                            <input

                                type="date"

                                name="dob"

                                value={user.dob}

                                onChange={handleChange}

                                className="w-full border border-gray-300 rounded-xl p-4"

                            />

                        </div>

                    </div>

                    {/* Bio */}

                    <div className="mt-8">

                        <label className="block text-sm font-medium mb-2">

                            Bio

                        </label>

                        <textarea

                            rows={5}

                            name="bio"

                            value={user.bio}

                            onChange={handleChange}

                            placeholder="Tell us something about yourself..."

                            className="w-full border border-gray-300 rounded-xl p-4 resize-none"

                        />

                    </div>

                    {/* Quick Settings */}

                    <div className="grid md:grid-cols-2 gap-6 mt-10">

                        <button

                            type="button"

                            onClick={() => router.push("/profile/addresses")}

                            className="border rounded-2xl p-6 text-left hover:bg-gray-50 transition"

                        >

                            <h3 className="font-bold text-lg">

                                📍 Manage Addresses

                            </h3>

                            <p className="text-gray-500 mt-2">

                                Add, edit and remove delivery addresses.

                            </p>

                        </button>

                        <button

                            type="button"

                            onClick={() => router.push("/profile/password")}

                            className="border rounded-2xl p-6 text-left hover:bg-gray-50 transition"

                        >

                            <h3 className="font-bold text-lg">

                                🔒 Change Password

                            </h3>

                            <p className="text-gray-500 mt-2">

                                Update your account password.

                            </p>

                        </button>

                    </div>

                    {/* Action Buttons */}

                    <div className="flex justify-end gap-5 mt-12">

                        <button

                            type="button"

                            onClick={() => router.back()}

                            className="border px-8 py-4 rounded-xl hover:bg-gray-100 transition"

                        >

                            Cancel

                        </button>

                        <button

                            type="submit"

                            className="bg-black text-white px-8 py-4 rounded-xl hover:bg-neutral-800 transition"

                        >

                            Save Changes

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}