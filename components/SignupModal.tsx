"use client";

import { useState } from "react";
import { FiArrowLeft, FiEye, FiEyeOff } from "react-icons/fi";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSignupSuccess?: () => void;
}

export default function SignupModal({
  isOpen,
  onClose,
  onSignupSuccess,
}: SignupModalProps) {
  const router = useRouter();
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const validateForm = () => {
    if (!loginId.trim()) {
      setError("아이디를 입력해주세요.");
      return false;
    }
    if (loginId.length < 4) {
      setError("아이디는 4자 이상이어야 합니다.");
      return false;
    }
    if (!password) {
      setError("비밀번호를 입력해주세요.");
      return false;
    }
    if (password.length < 6) {
      setError("비밀번호는 6자 이상이어야 합니다.");
      return false;
    }
    if (password !== confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    setError("");

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Auth로 회원가입 (email 대신 login_id를 email 필드에 임시 저장)
      // 실제로는 Supabase의 custom auth를 사용하거나, email 필드를 login_id로 사용
      // 여기서는 email 필드를 login_id@beautrip.local 형식으로 저장
      const email = `${loginId}@beautrip.local`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            login_id: loginId,
          },
        },
      });

      if (authError) {
        throw authError;
      }

      if (!authData.user) {
        throw new Error("회원가입에 실패했습니다.");
      }

      // 2. user_profiles 테이블에 프로필 정보 저장
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          user_id: authData.user.id, // Supabase Auth의 UUID
          provider: "local",
          login_id: loginId,
          preferred_language: "KR", // 기본값
        });

      if (profileError) {
        // 프로필 저장 실패 시 Auth 사용자도 삭제해야 할 수 있지만,
        // 일단 에러만 표시 (실제로는 트랜잭션 처리 필요)
        console.error("프로필 저장 실패:", profileError);
        throw new Error("프로필 저장에 실패했습니다.");
      }

      // 3. 성공 처리
      alert("회원가입이 완료되었습니다!");
      if (onSignupSuccess) {
        onSignupSuccess();
      } else {
        // 로그인 페이지로 이동
        router.push("/mypage");
      }
      onClose();
    } catch (err: any) {
      console.error("회원가입 오류:", err);
      setError(
        err.message || "회원가입 중 오류가 발생했습니다. 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-white max-w-md mx-auto left-1/2 transform -translate-x-1/2 w-full flex flex-col">
      {/* Header with back button */}
      <div className="flex-shrink-0 bg-white border-b border-gray-100 px-4 py-3 z-10 flex items-center">
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-50 rounded-full transition-colors"
          disabled={isLoading}
        >
          <FiArrowLeft className="text-gray-700 text-xl" />
        </button>
        <h2 className="flex-1 text-center text-lg font-semibold text-gray-900">
          회원가입
        </h2>
        <div className="w-10" /> {/* Spacer for centering */}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <div className="w-full px-6 py-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Image
                src="/beautrip-logo.png"
                alt="BeauTrip"
                width={180}
                height={60}
                className="object-contain"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

          {/* Signup Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                아이디
              </label>
              <input
                type="text"
                value={loginId}
                onChange={(e) => {
                  setLoginId(e.target.value);
                  setError("");
                }}
                placeholder="아이디를 입력하세요 (4자 이상)"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="비밀번호를 입력하세요 (6자 이상)"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <FiEyeOff className="text-xl" />
                  ) : (
                    <FiEye className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                비밀번호 확인
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError("");
                  }}
                  placeholder="비밀번호를 다시 입력하세요"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-main focus:border-transparent pr-12"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="text-xl" />
                  ) : (
                    <FiEye className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full bg-primary-main hover:bg-primary-light text-white py-4 rounded-xl font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "처리 중..." : "회원가입"}
            </button>

            <div className="text-center pt-4">
              <button
                onClick={() => {
                  onClose();
                  router.push("/mypage");
                }}
                className="text-gray-600 text-sm hover:text-primary-main transition-colors"
                disabled={isLoading}
              >
                이미 계정이 있으신가요? 로그인
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
