import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background p-4">
      <div className="w-20 h-20 bg-yellow-500/10 rounded-full flex items-center justify-center mb-6 border border-yellow-500/20">
        <AlertTriangle className="h-10 w-10 text-yellow-500" />
      </div>
      
      <h1 className="text-4xl font-display font-bold mb-2">Page Not Found</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <Link href="/">
        <Button size="lg" className="rounded-full">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
