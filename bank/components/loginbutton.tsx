import { ReactNode } from "react";

interface ButtonProps {
    state ?: ReactNode;
  children: ReactNode;
  // ******** V.V.V.Imp ********
  onClickFunc: () => void;
}

export function LoginButton({state, children, onClickFunc} : ButtonProps)
{
    return <div>
        <button type="submit" onClick={onClickFunc} className="focus:outline-none text-white bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 mb-2 dark:bg-purple-600 dark:hover:bg-purple-700 dark:focus:ring-purple-900">
            {children}
        </button>
    </div>
}