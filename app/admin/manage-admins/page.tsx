"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite.client";
import { createAdmin, getAdminList, deleteAdmin } from "@/lib/actions/admin.actions";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { User, Mail, Lock, Shield, ShieldCheck, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";

type AdminUser = {
  $id: string;
  name: string;
  email: string;
  labels: string[];
};

const ManageAdminsPage = () => {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "mvp">("admin");
  const [isLoading, setIsLoading] = useState(false);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUser | null>(null);

  const loadAdmins = async () => {
    setIsFetching(true);
    const result = await getAdminList();
    if (result.success) {
      setAdmins(result.admins as AdminUser[]);
    }
    setIsFetching(false);
  };

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const user = await account.get();
        const labels = (user as any).labels || [];
        if (!labels.includes("mvp")) {
          router.push("/admin");
          return;
        }
        setCurrentUserId(user.$id);
        setAuthorized(true);
        loadAdmins();
      } catch {
        router.push("/");
      }
    };
    checkAccess();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = await createAdmin(email, password, name, role);
      if (result.success) {
        toast.success(`${role === "mvp" ? "Main admin" : "Admin"} created successfully!`);
        setName("");
        setEmail("");
        setPassword("");
        setRole("admin");
        loadAdmins();
      } else {
        toast.error(result.error || "Failed to create admin.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (admin: AdminUser) => {
    if (admin.$id === currentUserId) {
      toast.error("You can't remove your own account.");
      return;
    }
    setPendingDelete(admin);
  };

  const executeDelete = async () => {
    if (!pendingDelete) return;
    const userId = pendingDelete.$id;
    setPendingDelete(null);
    setDeletingId(userId);
    try {
      const result = await deleteAdmin(userId);
      if (result.success) {
        toast.success("Admin removed.");
        setAdmins((prev) => prev.filter((a) => a.$id !== userId));
      } else {
        toast.error(result.error || "Failed to remove admin.");
      }
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!authorized) return null;

  return (
    <div className="md:flex">
      <Sidebar />
      <div className="root-layout">
        <Image
          src="/assets/icons/logo-icon.svg"
          height={100}
          width={100}
          alt="patient"
          className="size-[45px] xl:h-10 xl:w-fit"
        />
        <MobileNav />
      </div>
      <div className="mx-auto flex-1 flex max-w-4xl min-w-20 flex-col space-y-14">
        <main className="admin-main">
          <section className="w-full space-y-4">
            <h1 className="header">Manage Admins</h1>
            <p className="text-dark-700">
              Create new admin accounts and set their access level.
            </p>
          </section>

          <form onSubmit={handleSubmit} className="max-w-lg">
            <div className="rounded-xl border border-dark-500 bg-dark-400 p-6 space-y-5">
              <div className="space-y-4">
                <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-300 px-3 focus-within:border-green-500 transition-colors">
                  <User className="size-4 text-dark-600 shrink-0" />
                  <Input
                    placeholder="Full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="border-0 bg-transparent shadow-none outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none h-11 px-2"
                  />
                </div>

                <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-300 px-3 focus-within:border-green-500 transition-colors">
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

                <div className="flex items-center gap-2 rounded-lg border border-dark-500 bg-dark-300 px-3 focus-within:border-green-500 transition-colors">
                  <Lock className="size-4 text-dark-600 shrink-0" />
                  <Input
                    type="password"
                    placeholder="Password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="border-0 bg-transparent shadow-none outline-none ring-0 ring-offset-0 focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:outline-none h-11 px-2"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-14-medium text-dark-700">Access level</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole("admin")}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                      role === "admin"
                        ? "border-green-500 bg-green-500/10"
                        : "border-dark-500 bg-dark-300 hover:border-dark-600"
                    )}
                  >
                    <Shield
                      className={cn(
                        "size-5",
                        role === "admin" ? "text-green-500" : "text-dark-600"
                      )}
                    />
                    <div>
                      <p className="text-14-semibold text-white">Admin</p>
                      <p className="text-12-regular text-dark-700">
                        Appointments & Patients only
                      </p>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setRole("mvp")}
                    className={cn(
                      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                      role === "mvp"
                        ? "border-green-500 bg-green-500/10"
                        : "border-dark-500 bg-dark-300 hover:border-dark-600"
                    )}
                  >
                    <ShieldCheck
                      className={cn(
                        "size-5",
                        role === "mvp" ? "text-green-500" : "text-dark-600"
                      )}
                    />
                    <div>
                      <p className="text-14-semibold text-white">Main Admin</p>
                      <p className="text-12-regular text-dark-700">
                        Full access, including Doctors
                      </p>
                    </div>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="shad-primary-btn w-full h-12 rounded-lg text-16-semibold flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Admin"
                )}
              </button>
            </div>
          </form>

          <section className="w-full space-y-4">
            <h2 className="text-18-bold text-white">Current Admins</h2>

            {isFetching ? (
              <p className="text-14-regular text-dark-700">Loading admins...</p>
            ) : admins.length === 0 ? (
              <p className="text-14-regular text-dark-700">No admins found.</p>
            ) : (
              <div className="space-y-3">
                {admins.map((admin) => {
                  const isMvp = admin.labels?.includes("mvp");
                  const isSelf = admin.$id === currentUserId;
                  return (
                    <div
                      key={admin.$id}
                      className="flex items-center justify-between rounded-lg border border-dark-500 bg-dark-400 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex items-center justify-center size-10 rounded-full",
                            isMvp ? "bg-green-500/10" : "bg-dark-300"
                          )}
                        >
                          {isMvp ? (
                            <ShieldCheck className="size-5 text-green-500" />
                          ) : (
                            <Shield className="size-5 text-dark-600" />
                          )}
                        </div>
                        <div>
                          <p className="text-14-semibold text-white">
                            {admin.name || "Unnamed"}{" "}
                            {isSelf && (
                              <span className="text-12-regular text-dark-700">(you)</span>
                            )}
                          </p>
                          <p className="text-12-regular text-dark-700">
                            {admin.email} · {isMvp ? "Main Admin" : "Admin"}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => confirmDelete(admin)}
                        disabled={isSelf || deletingId === admin.$id}
                        className={cn(
                          "flex items-center gap-1 text-14-regular px-3 py-2 rounded-lg transition-colors",
                          isSelf
                            ? "text-dark-600 cursor-not-allowed"
                            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        )}
                      >
                        {deletingId === admin.$id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                        Remove
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
      </div>

      <AlertDialog open={!!pendingDelete} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <AlertDialogContent className="shad-alert-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove admin?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.name || pendingDelete?.email} will lose access immediately. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
<AlertDialogFooter className="gap-2">
  <AlertDialogCancel className="shad-gray-btn h-11 px-6 rounded-lg text-14-semibold hover:bg-dark-500 hover:border-dark-600 transition-colors">
    Cancel
  </AlertDialogCancel>
  <button
    onClick={executeDelete}
    className="shad-danger-btn h-11 px-6 rounded-lg text-14-semibold hover:bg-red-800 transition-colors"
  >
    Remove
  </button>
</AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageAdminsPage;