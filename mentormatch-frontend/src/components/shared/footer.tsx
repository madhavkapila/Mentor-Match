import Link from "next/link";
import { GraduationCap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/15">
              <GraduationCap className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="text-base font-semibold text-foreground">MentorMatch</span>
              <span className="text-sm text-muted-foreground/50 ml-2">
                Built for TIET
              </span>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground/60">
            <Link href="/about" className="hover:text-primary transition-colors">
              About
            </Link>
            <Link href="/contact" className="hover:text-primary transition-colors">
              Feedback
            </Link>
            <span className="text-muted-foreground/40">&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
