"use client";
import Image from "next/image";
import { useEffect } from "react"; // Fixed: Added curly braces
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/dashboard");
  }, [router]);

  return null;
}