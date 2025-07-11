import { type ReactNode } from "react";

export function Card({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="min-w-fit w-full">
      <h1 className="font-bold text-xl px-4 border-b pb-2 pt-3">
        {title}
      </h1>
      <div>
        {children}
      </div>
    </div>
  );
}
