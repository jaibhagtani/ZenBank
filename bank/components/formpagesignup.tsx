"use client"
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { InputOTPGroup } from "./inputotpgroup";
import LabelledInputAuth from "./labelledinputauth";

const nextReqSchema = z.object({
  contact: z.string().length(10),
  Name: z.string().min(1),
  email: z.string().email()
});

const loginReqSchema = z.object({
  contact: z.string().length(10),
  Name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6).max(14),
  receivedOtpCode: z.string().length(4)
});

export default function FormPageSignup() {
  const [Name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [otp, setOtp] = useState(false);
  const [receivedOtpCode, setReceivedOtpCode] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [resendClicked, setResendClicked] = useState(false);
  const [password, setPassword] = useState("");
  const [OTPresponse, setOTPresponse] = useState("");
  const [loadingNext, setLoadingNext] = useState(false);
  const [loadingSignup, setLoadingSignup] = useState(false);
  const [firstTime, setFirstTime] = useState(true);
  const router = useRouter();

  const startTimer = () => {
    setTimeLeft(60);
    setTimerRunning(true);
  };

  const handleVerify = async () => {
    const res = await fetch("/api/auth/otp/verify-otp", {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, otp: receivedOtpCode })
    });
    if (res.status === 200) {
      setOTPresponse("OTP Verified!!");
    } else {
      setOTPresponse("Incorrect OTP. Please try again.");
    }
    return res.status;
  };

  const handleSendOtp = async () => {
    setLoadingNext(true);
    startTimer();
    setResendClicked(true);
    try {
      const res = await fetch("/api/auth/otp/send-otp", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, username: Name })
      });
      if (res.status === 200) {
        setOtp(true);
      } else {
        setOtp(false);
      }
      return res.status;
    } finally {
      setLoadingNext(false);
    }
  };

  const handleLogin = async () => {
    setLoadingSignup(true);
    const verificationStatus = await handleVerify();
    if (verificationStatus === 200) {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, Name, password, contact })
      });
      if (res.status === 200) {
        const signUpRes = await signIn("signup", {
          name: Name,
          phone: contact,
          password,
          email,
          redirect: false,
        });

        // console.log(signUpRes)
        if (signUpRes?.error) {
          console.error(signUpRes.error);
          alert("Something went wrong during Sign Up");
        } else {
          alert("Signed up successfully!!");
          router.push("/mpin/set");
        }
      } else if (res.status === 400) {
        alert("User Already have an Account!!");
      } else {
        alert("Error Occurred during Sign up");
      }
    }
    setLoadingSignup(false);
  };

  const resendOTP = () => {
    setTimerRunning(false);
    startTimer();
    setResendClicked(true);
    handleSendOtp();
  };

  useEffect(() => {
    let timer: any;
    if (timerRunning) {
      timer = setTimeout(() => {
        if (timeLeft > 0) {
          setTimeLeft((prev) => prev - 1);
        } else {
          setTimerRunning(false);
        }
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [timeLeft, timerRunning]);

  useEffect(() => {
    if (!contact) {
      setOtp(false);
      setTimeLeft(60);
      setTimerRunning(false);
      setResendClicked(false);
    }
  }, [contact]);

  return (
    <div className="w-full py-5 mx-5 px-10 h-max bg-white rounded-3xl">
      <div className="font-bold text-4xl flex justify-center pb-1">ZenBank</div>
      <div className="font-bold text-3xl">Sign up</div>

      <div className="my-4">
        <div className="my-8">
          <LabelledInputAuth label="First Name" placeholder="John Doe" type="text" onChangeFunc={setName} />
        </div>
        <div className="my-8">
          <LabelledInputAuth label="Email" placeholder="johndoe2@gmail.com" type="email" onChangeFunc={setEmail} />
        </div>
        <div className="my-8">
          <LabelledInputAuth label="Phone Number (10 digits)" placeholder="1231231230" type="tel" onChangeFunc={setContact} />
        </div>
      </div>

      {contact && email && otp && (
        <>
          <div className="text-center text-green-500 text-base mt-1 font-semibold">
            OTP sent successfully on your email. Please enter OTP below.
          </div>
          <div className="space-y-2 w-full flex flex-col items-center justify-center my-2">
            <InputOTPGroup type="otp" onChangeFunc={setReceivedOtpCode} />
            <LabelledInputAuth label="Password (min 6 characters)" placeholder="1@2#3$" type="password" onChangeFunc={setPassword} />
            <div>
              {resendClicked && timeLeft > 0 ? (
                <p className="text-sm">
                  Resend OTP available in <span className="text-blue-500">{timeLeft}</span>
                </p>
              ) : (
                <button onClick={resendOTP} className="text-blue-500">Resend OTP</button>
              )}
            </div>
          </div>
        </>
      )}

      {receivedOtpCode ? (
        <button
          onClick={async () => {
            if (loginReqSchema.safeParse({ Name, contact, email, receivedOtpCode, password }).success) {
              await handleLogin();
            }
          }}
          disabled={loadingSignup || !password || !receivedOtpCode}
          className={`w-full mt-4 bg-green-500 hover:bg-green-400 rounded-lg h-10 ${loadingSignup ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loadingSignup ? "Signing up..." : "Login"}
        </button>
      ) : (
        <button
          onClick={async () => {
            const valid = nextReqSchema.safeParse({ Name, contact, email }).success;
            if (valid && (timeLeft === 0 || firstTime)) {
              const res = await handleSendOtp();
              if (res === 400) alert("User Already have an Account!!");
              else if (res === 500) alert("Something went wrong!");
              setFirstTime(false);
            } else if (!valid) {
              alert("Enter complete valid info.");
            }
          }}
          disabled={loadingNext || !Name || !email || !contact}
          className={`w-full mt-4 bg-green-500 hover:bg-green-400 rounded-lg h-10 ${loadingNext ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {loadingNext ? "Sending OTP..." : "Next"}
        </button>
      )}

      {OTPresponse && (
        <p className={`${OTPresponse === "OTP Verified!!" ? "text-green-500" : "text-red-500"} text-sm text-center mt-2`}>
          {OTPresponse}
        </p>
      )}

      <div className="pt-3 flex justify-center">already have an account?
        <button className="pl-1 text-blue-600 hover:underline" onClick={() => router.push("/auth/signin")}>
          Sign in
        </button>
      </div>
    </div>
  );
}
