import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { SignUpClient } from "./sign-up-client";

export default async function SignUpPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/?notice=already_signed_in");
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 text-slate-100" />}>
      <SignUpClient />
    </Suspense>
  );
}
