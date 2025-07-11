"use client";
import React, { useState } from "react";
import { InputOTPGroup } from "../inputotpgroup";
// import dotenv from "dotenv";
// dotenv.config();
export function LinkBankAccountForm({
  initialData
}: {
  initialData: {
    name: string;
    phone: string;
    email: string;
    userIdAccordingToWallet: string;
    link_auth_token: string;
    provider: string;
  };
}) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData.name,
    phone: initialData.phone,
    email: initialData.email,
    accountNumber: "",
    ifsc: "",
    mpin: "",
    otp: "",
    userIdAccordingToWallet: initialData.userIdAccordingToWallet,
    link_auth_token: initialData.link_auth_token
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (step === 1) {
        // Validate user + account number + ifsc
        const res = await fetch(`/api/link/link-account/check-user-account`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name,
            phone: formData.phone,
            email: formData.email,
            accountNumber: formData.accountNumber,
            ifsc: formData.ifsc,
          }),
        });
        if (!res.ok) throw new Error("Account details invalid.");
      }

      if (step === 2) {
        // Validate mpin + send otp
        const res = await fetch(`/api/link/link-account/verify-mpin-send-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone: formData.phone,
            mpin: formData.mpin,
            email: formData.email
          }),
        });
        if (!res.ok) throw new Error("Invalid MPIN or failed to send OTP.");
      }

      setStep((prev) => prev + 1);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const doneRes = await fetch(`/api/link/link-account/get-done-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: formData.phone,
          email: formData.email,
          accountNumber: formData.accountNumber,
          ifsc: formData.ifsc,
          userIdAccordingToWallet: formData.userIdAccordingToWallet,
          link_auth_token: formData.link_auth_token,
          provider: initialData.provider
        }),
      });

      if (!doneRes.ok) throw new Error("Failed to link account.");
      const data = await doneRes.json();

      window.location.href = `${process.env.NEXT_PUBLIC_ZENPAY_URL}/account-linked/${initialData.link_auth_token}/${data.done_token}`;
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong.");
      window.location.href = (`${process.env.NEXT_PUBLIC_ZENPAY_URL}/link-account`)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <h1 className="p-6 max-w-6xl mx-auto rounded-lg mt-14 text-3xl font-bold mb-8 text-blue-800">
        Welcome to ZenBank (LINK ACCOUNT)
      </h1>

      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-8 border border-gray-200">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-800">
          {step === 1 && "Enter Bank Details"}
          {step === 2 && "Enter Your MPIN"}
          {step === 3 && "Verify OTP"}
        </h2>

        {step === 1 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Phone Number</label>
              <input
                type="tel"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                required
                value={formData.accountNumber}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-gray-700 mb-1">IFSC Code</label>
              <input
                type="text"
                name="ifsc"
                required
                value={formData.ifsc}
                onChange={handleChange}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
              disabled={loading}
            >
              {loading ? "Processing..." : "Next"}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNext} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-3 text-center">
                Enter Your 4 Digit MPIN
              </label>
              <InputOTPGroup
                onChangeFunc={(mpin) =>
                  setFormData((prev) => ({ ...prev, mpin }))
                }
                type="password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition"
              disabled={!formData.mpin || formData.mpin.length < 4 || loading}
            >
              {loading ? "Verifying..." : "Next"}
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-gray-700 mb-3 text-center">
                Enter OTP sent to your phone/email
              </label>
              <InputOTPGroup
                onChangeFunc={(otp) =>
                  setFormData((prev) => ({ ...prev, otp }))
                }
                type="text"
              />
            </div>
            <button
              type="submit"
              disabled={!formData.otp || formData.otp.length < 4 || loading}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition flex items-center justify-center"
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
              )}
              {loading ? "Linking..." : "Link Account"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
