import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | MentorMatch Admin",
  description: "Secure admin access to MentorMatch",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background bg-grid relative overflow-hidden">
      {/* Floating background orbs */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="orb orb-cyan w-[500px] h-[500px] -top-40 -left-40 animate-float-slow opacity-30" />
        <div className="orb orb-blue w-[400px] h-[400px] -bottom-40 -right-40 animate-float-reverse opacity-25" />
        <div className="orb orb-teal w-[300px] h-[300px] top-1/2 right-1/4 animate-float-delay-1 opacity-15" />
      </div>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
