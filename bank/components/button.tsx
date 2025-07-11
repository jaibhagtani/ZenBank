"use client";

import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  // ******** V.V.V.Imp ********
  onClickFunc: () => void;
  className?: string
  state?: boolean
}

export const Button = ({onClickFunc, children, className, state }: ButtonProps) => {
  return (
    <button onClick={onClickFunc} disabled={state} className={className ? className : "text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 transition delay-100 duration-200 ease-in-out hover:-translate-y-1 hover:scale-110 hover:bg-slate-700"}>
      {children} 
    </button>
  );
};
