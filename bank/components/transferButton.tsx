"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

interface TransferButtonProps {
  placeholder: string;
  path: string;
}

export function TransferButton({ placeholder, path }: TransferButtonProps) {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
      <Link href={path}>
        <div className="w-40 py-3 px-5 bg-slate-600 hover:bg-slate-700 text-white font-semibold rounded-2xl shadow-md transition-all duration-200 text-center cursor-pointer">
          {placeholder}
        </div>
      </Link>
    </motion.div>
  );
}
