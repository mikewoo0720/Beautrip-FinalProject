"use client";

import { useState } from "react";
import SignupModal from "@/components/SignupModal";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    router.push("/");
  };

  const handleSignupSuccess = () => {
    // 회원가입 성공 시 로그인 페이지로 이동
    router.push("/mypage");
  };

  return (
    <SignupModal
      isOpen={isOpen}
      onClose={handleClose}
      onSignupSuccess={handleSignupSuccess}
    />
  );
}
