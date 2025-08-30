"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { checkUserDetails } from "@/lib/actions/checkUserDetails";
import { verifyOtpAndCreateAccount } from "@/lib/actions/verifyOtpAndCreateAccount";
import { verifyMpin } from "@/lib/actions/verifyMpin";
import { InputOTPGroup } from "@/components/inputotpgroup";

export function CreateAccountForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    mpin: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleVerifyDetails = async () => {
    setLoading(true);
    const res = await checkUserDetails({ name: formData.name, email: formData.email, phone: formData.phone });
    setLoading(false);

    if (!res?.success) {
      return alert(res?.message || "Could not verify details.");
    }
    setStep(2);
  };

  const handleVerifyMpinAndSendOtp = async () => {
    setLoading(true);
    const mpinRes = await verifyMpin({
      phone: formData.phone,
      email: formData.email,
      mpin: formData.mpin
    });

    if (!mpinRes.success) {
      setLoading(false);
      return alert(mpinRes.message || "Invalid MPIN.");
    }
    alert(mpinRes.message)
    try {
      const res = await fetch(`/api/create-account/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          username: formData.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        return alert(data.error || "Failed to send OTP");
      } else {
        alert(data.message || "OTP sent!");
        setStep(3);
      }
    } catch (err) {
      console.error(err);
      alert("Network error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtpAndCreate = async () => {
    setLoading(true);
    const res = await verifyOtpAndCreateAccount(formData);
    setLoading(false);

    if (res?.error) {
        console.log("HERE")
      return alert(res.error);
    } else {
      router.push("/dashboard");
      alert(res?.message || "Account created!");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-lg p-8 max-w-md mx-auto"
    >
      {/* <h1 className="text-2xl font-bold mb-6 text-center">Open a New ZenBank Account</h1> */}

      {step === 1 && (
        <div className="space-y-4">
          <Input label="Name" value={formData.name} onChange={val => handleChange("name", val)} />
          <Input label="Phone" value={formData.phone} onChange={val => handleChange("phone", val)} />
          <Input label="Email" value={formData.email} onChange={val => handleChange("email", val)} />
          <Button onClick={handleVerifyDetails} loading={loading}>Next</Button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-1">MPIN (4 digits)</label>
          <InputOTPGroup
            type="password"
            onChangeFunc={(pin) => handleChange("mpin", pin)}
          />
          <div className="flex justify-between items-center mt-2">
            <Button onClick={handleVerifyMpinAndSendOtp} loading={loading}>
              Verify MPIN & Send OTP
            </Button>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => router.push("/mpin/update")}
            >
              Update MPIN
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-1">Enter OTP</label>
          <InputOTPGroup
            type="text"
            onChangeFunc={(otp) => handleChange("otp", otp)}
          />
          <Button onClick={handleVerifyOtpAndCreate} loading={loading}>Create Account</Button>
        </div>
      )}
    </motion.div>
  );
}

function Input({ label, value, onChange, type = "text" }: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

function Button({ children, onClick, loading }:{
  children: React.ReactNode;
  onClick: () => void;
  loading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg w-full ${loading ? "opacity-50" : ""}`}
    >
      {loading ? "Processing..." : children}
    </button>
  );
}
