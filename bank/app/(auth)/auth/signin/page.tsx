import FormPageSignin from "@/components/formpagesignin";
import { NEXT_AUTH } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { RiBankLine } from "react-icons/ri";

export default async function RegisterPage() {
  const session = await getServerSession(NEXT_AUTH);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center">
      <div className="w-screen h-screen flex flex-col md:flex-row overflow-hidden">
        
        <div className="hidden md:flex w-full md:w-1/2 relative text-white p-10 flex-col justify-center overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,#ffffff22,transparent_70%)] z-0 opacity-20" />

          <div className="z-10 mb-6">
            <RiBankLine size={110} />
          </div>

          <div className="z-10">
            <h1 className="text-5xl font-extrabold mb-4 tracking-tight leading-tight drop-shadow-md">
              Welcome to ZenBank
            </h1>
            <p className="text-lg font-medium opacity-95 max-w-sm leading-relaxed drop-shadow-sm">
              Step into ZenBank — where your money stored smarter.
            </p>
          </div>
        </div>

        <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-6 py-10 sm:px-12">
          {/* <div className="md:hidden mb-8 w-full text-left">
            <h1 className="text-3xl font-extrabold text-gray-900">Welcome to ZenPay</h1>
          </div> */}

          <FormPageSignin />
        </div>
      </div>
    </div>
  );
}
