import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { SignInClient } from "./sign-in-client";

export default async function SignInPage() {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    redirect("/?notice=already_signed_in");
  }

  return <SignInClient />;
}
