"use client"
import { useEffect, useRef, useState } from "react"

interface InputOTPGroupProps {
  onChangeFunc: (otp: string) => void;
  type: string;
}

export function InputOTPGroup({ onChangeFunc, type }: InputOTPGroupProps) {
  const [values, setValues] = useState(["", "", "", ""]);
  const inputs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  useEffect(() => {
    if (values.every(v => v !== "")) {
      onChangeFunc(values.join(""));
    } else {
      onChangeFunc("");
    }
  }, [values]);

  const handleChange = (value: string, idx: number) => {
    if (!/^\d?$/.test(value)) return;
    const newValues = [...values];
    newValues[idx] = value;
    setValues(newValues);
    if (value && idx < inputs.length - 1) {
      inputs[idx + 1].current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace" && values[idx] === "" && idx > 0) {
      const prevIdx = idx - 1;
      inputs[prevIdx].current?.focus();
    }
  };

  return (
    <div className="flex justify-center gap-2">
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={inputs[idx]}
          type={type}
          value={val}
          onChange={(e) => handleChange(e.target.value, idx)}
          onKeyDown={(e) => handleKeyDown(e, idx)}
          maxLength={1}
          className="w-12 h-12 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      ))}
    </div>
  );
}
