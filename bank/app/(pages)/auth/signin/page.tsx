import FormPageSignin from "@/components/formpagesignin";
import { NEXT_AUTH } from "@/lib/auth";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";



export default async function RegisterPage() {
  const session = await getServerSession(NEXT_AUTH);

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen h-full">
      <div className="grid grid-cols-2 gap-4">
        <div>

        </div>
        <div className="w-full pt-8 flex justify-center h-max">
          <FormPageSignin />
        </div>
      </div>
      
    </div>
  );
}
