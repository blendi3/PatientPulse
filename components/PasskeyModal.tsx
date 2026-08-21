"use client";

import {
  AlertDialog,
  AlertDialogContent,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { account } from "@/lib/appwrite.client";
import { Mail, Lock, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasskeyModal = () => {
  const router = useRouter();
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        await account.get();
        if (path) router.push("/admin");
      } catch {
        setOpen(path === "/" ? true : false);
      }
    };
    checkSession();
  }, [path, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const labels = (user as any).labels || [];
        if (!labels.includes("mvp") && !labels.includes("admin")) {
        toast.error("This account does not have admin access.");
        await account.deleteSession("current");
        setIsLoading(false);
        return;
}
      toast.success("Welcome back!");
      setOpen(false);
      router.push("/admin");
    } catch (err) {
      toast.error("Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const closeModal = () => {
    setOpen(false);
    router.push("/");
  };

  return (
    <AlertDialog open={open} onOpenChange={closeModal}>
      <AlertDialogContent className="shad-alert-dialog max-w-[420px] p-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center size-10 rounded-full bg-dark-400 border border-dark-500">
              <Image
                src="/assets/icons/logo-icon.svg"
                height={22}
                width={22}
                alt="logo"
              />
            </div>
            <h2 className="text-18-bold text-white">Admin Login</h2>
          </div>
          <Image
            src="/assets/icons/close.svg"
            alt="close"
            width={18}
            height={18}
            onClick={closeModal}
            className="cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
          />
        </div>

        <p className="text-14-regular text-dark-700 mb-6">
          Sign in with your admin credentials to continue.
        </p>

        <form onSubmit={handleLogin} className="space-y-3">
          <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-400 px-3 focus-within:border-green-500 transition-colors">
            <Mail className="size-4 text-dark-600 shrink-0" />
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border-0 bg-transparent shadow-none outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none h-11 px-2"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-400 px-3 focus-within:border-green-500 transition-colors">
            <Lock className="size-4 text-dark-600 shrink-0" />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border-0 bg-transparent shadow-none outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none h-11 px-2"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="shad-primary-btn w-full h-12 rounded-lg text-16-semibold flex items-center justify-center gap-2 mt-4 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default PasskeyModal;