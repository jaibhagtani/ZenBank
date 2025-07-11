import { getServerSession } from "next-auth";
import { FaUserCircle } from "react-icons/fa";
import { FiRefreshCw } from "react-icons/fi";
import { NEXT_AUTH } from "../../../lib/auth";
import { prisma } from "@/db";
import { AccountButton } from "@/components/accountButton";

async function getDetails() {
  const session = await getServerSession(NEXT_AUTH);
  if (!session?.user?.email) {
    throw new Error("User not logged in!");
  }

  const userDetails = await prisma.user.findUnique({
    where: {
      email: session?.user.email,
    },
    select: {
      accounts: {
        select: {
            ifsc: true,
            accountNumber: true
        }
      },
      name: true,
      number: true,
      email: true
    },
  });
  return userDetails;
}

export default async function ProfilePage() {
  const session = await getServerSession(NEXT_AUTH);
  const user = session?.user;

  if (!user) {
    return (
      <div className="text-center mt-10 text-red-500 font-semibold">
        User not logged in!
      </div>
    );
  }
  const userDetails = await getDetails();

  return (
    <div className="flex-auto">
      <h1 className="mt-14 p-6 max-w-6xl mx-auto rounded-lg text-3xl font-bold mb-8 text-blue-800">
        Profile
      </h1>
      <div className="flex-auto flex justify-center items-center px-4">
        <div className="bg-white rounded-3xl shadow-xl w-full max-w-6xl flex flex-col md:flex-row overflow-hidden">
          
          <div className="bg-slate-300 flex flex-col items-center justify-center p-10 w-full md:w-1/3">
            <FaUserCircle size={100} className="text-slate-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Hey {session?.user?.name},
            </h2>
            <p className="text-lg font-semibold text-blue-600 mb-6">
              Accounts: {userDetails?.accounts.length}
            </p>
            <AccountButton
              className="bg-slate-600 text-white px-6 py-2 rounded-full shadow hover:bg-slate-700 transition"
              to="/create-account"
            >
              + Create Account
            </AccountButton>
          </div>

          <div className="flex-1 p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={userDetails?.name || ""}
                  disabled
                  className="w-full shadow-sm py-0.5 px-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  Contact
                </label>
                <input
                  type="text"
                  value={userDetails?.number || ""}
                  disabled
                  className="w-full shadow-sm py-0.5 px-2"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={userDetails?.email || ""}
                  disabled
                  className="w-full shadow-sm py-0.5 px-2"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-blue-600 mb-1">
                  Accounts
                </label>
                <div className="space-y-2">
                  {userDetails?.accounts && userDetails?.accounts.length > 0 ? (
                    userDetails?.accounts.map((account, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={`${account.accountNumber} (${account.ifsc})`}
                        disabled
                        className="w-full shadow-sm py-0.5 px-2"
                      />
                    ))
                  ) : (
                    <div className="text-gray-500">No accounts linked.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-6 py-4 shadow-inner">
                <div>
                  <div className="text-gray-700 font-medium">Password</div>
                  <div className="text-gray-500">********</div>
                </div>
                <AccountButton
                  to="update/password"
                  className="text-slate-600 hover:text-slate-800"
                >
                  <FiRefreshCw size={24} />
                </AccountButton>
              </div>
              <div className="flex justify-between items-center bg-gray-50 rounded-xl px-6 py-4 shadow-inner">
                <div>
                  <div className="text-gray-700 font-medium">MPIN</div>
                  <div className="text-gray-500">****</div>
                </div>
                <AccountButton
                  to="/mpin/update"
                  className="text-slate-600 hover:text-slate-800"
                >
                  <FiRefreshCw size={24} />
                </AccountButton>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
