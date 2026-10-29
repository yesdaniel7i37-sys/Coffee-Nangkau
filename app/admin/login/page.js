"use client";
import { useActionState } from "react";
import { login } from "../actions";

const inputCls =
  "w-full px-4 py-3 bg-neutral-900 border border-neutral-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-600 transition";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(login, null);

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-sm bg-neutral-800 border border-neutral-700 rounded-2xl p-8 shadow-2xl">
        <h1 className="text-2xl font-bold mb-1">
          Coffee <span className="text-amber-600">Nangkau</span>
        </h1>
        <p className="text-gray-400 text-sm mb-6">Masuk ke panel admin</p>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input id="username" name="username" required autoComplete="username" defaultValue={state?.username ?? ""} className={inputCls} />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input id="password" name="password" type="password" required autoComplete="current-password" className={inputCls} />
          </div>
          {state?.error && (
            <p role="alert" className="text-sm text-red-400">{state.error}</p>
          )}
          <button
            type="submit"
            disabled={pending}
            className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-medium py-3 rounded-lg transition"
          >
            {pending ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
