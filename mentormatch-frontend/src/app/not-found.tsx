import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-7xl font-bold text-primary mb-4">404</div>
        <h2 className="text-2xl font-bold">Page Not Found</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">
            <Search className="w-4 h-4 mr-2" />
            Back to MentorMatch
          </Link>
        </Button>
      </div>
    </div>
  );
}
