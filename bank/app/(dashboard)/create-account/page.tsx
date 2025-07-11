import { CreateAccountForm } from "@/components/createAccountForm";
import { Suspense } from "react";

export default async function CreateBankAccountPage() {
   return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen rounded-lg">
      <h1 className="mt-14 text-3xl font-bold mb-8 text-blue-800">
        Open a New ZenBank Account
      </h1>

      <div className="max-w-2xl w-full mx-auto">
        <CreateAccountForm />
      </div>
    </div>
  );
}
