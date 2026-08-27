"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { Input } from "@/components/ui/input";
import PulseLogo from "@/components/PulseLogo";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Mail, Lock, Loader2 } from "lucide-react";
import Link from "next/link";

const PatientLoginPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

 const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      try {
        await account.deleteSession("current");
      } catch {
        // no existing session, ignore
      }
      await account.createEmailPasswordSession(email, password);
      toast.success("Welcome back!");
      router.push("/my-appointments");
    } catch {
      toast.error("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-200 flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex items-center justify-center gap-2">
          <PulseLogo size={32} />
          <p className="text-16-semibold text-white">PatientPulse</p>
        </div>

        <div className="rounded-xl border border-dark-500 bg-dark-400 p-6 space-y-4">
          <div>
            <h1 className="text-18-bold text-white">My Appointments</h1>
            <p className="text-14-regular text-dark-700 mt-1">
              Sign in to view or manage your appointments.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-300 px-3">
              <Mail className="size-4 text-dark-600 shrink-0" />
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-0 bg-transparent shadow-none outline-none ring-0 h-11 px-2"
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-300 px-3">
              <Lock className="size-4 text-dark-600 shrink-0" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-0 bg-transparent shadow-none outline-none ring-0 h-11 px-2"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="shad-primary-btn w-full h-11 rounded-lg text-14-semibold flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
            </button>
          </form>

          <p className="text-12-regular text-dark-700 text-center">
            Forgot your password? Contact the clinic directly and our staff will help you reset it.
          </p>
        </div>

        <p className="text-13-regular text-dark-700 text-center">
          Don't have an appointment yet?{" "}
          <Link href="/" className="text-green-500 hover:text-green-400">
            Book one here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PatientLoginPage;
