"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card } from "./card";
import { ButtonMpin } from "./button copy";
import { InputOTPGroup } from "./inputotpgroup";

interface MpinCardInput {
  title: string;
  type: "set" | "update";
}

export function MpinCard({ title, type }: MpinCardInput) {
  const { data: session } = useSession();
  const router = useRouter();

  const [mpin, setMpin] = useState("");
  const [confirmedMpin, setConfirmedMpin] = useState("");
  const [receivedOtpCode, setReceivedOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpResponse, setOtpResponse] = useState("");
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [resendClicked, setResendClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const startTimer = () => {
    setTimeLeft(60);
    setTimerRunning(true);
  };

  useEffect(() => {
    if (!timerRunning) return;
    const timer = setTimeout(() => {
      if (timeLeft > 0) {
        setTimeLeft(prev => prev - 1);
      } else {
        setTimerRunning(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [timeLeft, timerRunning]);

  const handleSendOtp = async () => {
    if (!session?.user?.email) {
      setError("User not logged in!");
      return;
    }
    startTimer();
    setResendClicked(true);
    const res = await fetch("/api/mpin/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        username: session.user.name
      })
    });
    if (res.ok) setOtpSent(true);
  };

  const handleVerifyOtp = async () => {
    if (!session?.user?.email) {
      setError("User not logged in!");
      return;
    }
    const res = await fetch("/api/mpin/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        otp: receivedOtpCode
      })
    });

    if (res.status === 200) {
      setOtpResponse("OTP Verified!!");
      await setMpinInDb();
    } else if (res.status === 400) {
      setOtpResponse("Incorrect OTP. Please try again.");
    } else {
      setOtpResponse("Something went wrong. Please try again.");
    }
  };

  const setMpinInDb = async () => {
    if (!session?.user?.email) {
      setError("User not logged in!");
      return;
    }
    const res = await fetch("/api/mpin/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: session.user.email,
        mpin
      })
    });
    if (res.ok) {
      router.push(type === "set" ? "/dashboard" : "/profile");
    }
  };

  return (
    <div className="min-h-fit mx-5">
      <div className="pt-2"></div>
      <Card title={title}>
        <div className="font-2xl font-semibold px-4 py-3">
          {type === "set"
            ? "Let your digits defend your dollars—set your MPIN now!"
            : "New digits, new strength—update your MPIN and stay ahead!"}
        </div>

        {error && <div className="text-red-500 text-center font-semibold">{error}</div>}

        {mpin && confirmedMpin && mpin !== confirmedMpin && (
          <div className="text-red-500 text-center font-semibold pt-2">
            Incorrect MPIN
          </div>
        )}

        <div className="font-xl font-bold my-3 py-1 px-5 border-b">Enter MPIN</div>
        <div className="flex justify-center py-5">
          <InputOTPGroup type="password" onChangeFunc={setMpin} />
        </div>

        <div className="font-xl font-bold my-3 px-5 py-1 border-b">Confirm MPIN</div>
        <div className="flex justify-center py-5">
          <InputOTPGroup type="password" onChangeFunc={setConfirmedMpin} />
        </div>

        <div className="flex justify-center py-3">
          {type === "set" ? (
            <ButtonMpin state={isLoading} onClickFunc={async () => {
              if (!mpin || !confirmedMpin || mpin !== confirmedMpin) {
                setError("Invalid MPIN");
                return;
              }
              setIsLoading(true);
              await setMpinInDb();
              setIsLoading(false);
            }}>
              {isLoading ? "Processing..." : "Submit"}
            </ButtonMpin>
          ) : !otpSent && (
            <ButtonMpin state={isLoading} onClickFunc={async () => {
              if (!mpin || !confirmedMpin || mpin !== confirmedMpin) {
                setError("Invalid MPIN");
                return;
              }
              setIsLoading(true);
              await handleSendOtp();
              setIsLoading(false);
            }}>
              {isLoading ? "Processing..." : "Next"}
            </ButtonMpin>
          )}
        </div>

        {type === "update" && mpin && confirmedMpin && mpin === confirmedMpin && otpSent && (
          <>
            <div className="text-green-500 text-center font-semibold">
              OTP sent successfully. Please enter OTP below.
            </div>
            <div className="flex justify-center py-5">
              <InputOTPGroup type="text" onChangeFunc={setReceivedOtpCode} />
            </div>
            <div className="text-center">
              {resendClicked && timeLeft > 0 ? (
                <p>Resend OTP available in <span className="text-blue-500">{timeLeft}</span></p>
              ) : (
                <button onClick={handleSendOtp} className="text-blue-500 underline">Resend OTP</button>
              )}
            </div>
            <div className="flex justify-center mt-4">
              <button
                onClick={handleVerifyOtp}
                className="bg-green-500 hover:bg-green-400 text-white px-5 py-2 rounded-lg"
              >
                Update MPIN
              </button>
            </div>
          </>
        )}

        {otpResponse && (
          <p className={`text-center mt-3 font-semibold ${otpResponse.includes("Verified") ? "text-green-500" : "text-red-500"}`}>
            {otpResponse}
          </p>
        )}
      </Card>
    </div>
  );
}
