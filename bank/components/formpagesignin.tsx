"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import LabelledInputAuth from "./labelledinputauth";

export default function FormPageSignin() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await signIn("signin", {
        phone: phoneNumber,
        password: password,
        redirect: false,
      });

      if (!res?.error) {
        alert("Signed in Successfully!!");
        router.push("/dashboard");
      } else {
        console.log(res.error)
        alert("Invalid phone number or password");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full max-w-lg py-8 mx-5 px-10 h-max bg-white rounded-3xl shadow-md"
    >
      <div className="pb-2 text-4xl font-bold text-center text-blue-800">ZenBank</div>
      <div className="text-2xl font-semibold text-center mb-8">Sign in to your account</div>

      <div className="space-y-8">
        <LabelledInputAuth
          label="Phone Number"
          placeholder="1231231230"
          type="tel"
          onChangeFunc={setPhoneNumber}
        />

        <LabelledInputAuth
          label="Password (min 6 characters)"
          placeholder="1@3/4*6"
          type="password"
          onChangeFunc={setPassword}
        />

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className={`flex items-center justify-center px-6 py-2 rounded-lg font-semibold text-white transition ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? (
              <>
                <SpinnerIcon /> <span className="ml-2">Signing in...</span>
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </div>

        <div className="flex flex-col items-center text-sm mt-8 space-y-2">
          <div>
            <span className="text-gray-700">Don't remember your password? </span>
            <Link
              className="text-blue-800 hover:underline font-medium"
              href="/update/password"
            >
              Forgot password
            </Link>
          </div>
          <div>
            <span className="text-gray-700">Don't have an account? </span>
            <Link
              className="text-blue-800 hover:underline font-medium"
              href="/auth/signup"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );
}
