"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login?tab=signup");
  }, [router]);

  return (
    <div className="py-20 text-center text-xs text-gray-400">
      Qeydiyyat portalına yönləndirilir...
    </div>
  );
}
