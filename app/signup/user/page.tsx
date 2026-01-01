"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function UserSignupRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.push('/sign-up');
  }, [router]);
  return null;
}
