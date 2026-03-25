import { useLocation, Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, MapPinOff } from "lucide-react";

const NotFound = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }, [location.pathname]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 text-center">
            {/* Ambient Background Effect */}
            <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />

            <div className="mx-auto flex w-full max-w-lg flex-col items-center space-y-6">
                {/* Icon Container with Glow */}
                <div className="relative mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 ring-8 ring-primary/5">
                    <MapPinOff className="h-12 w-12 text-primary" />
                    <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                </div>

                {/* Text Content */}
                <div className="space-y-2">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Page Not Found
                    </h1>
                    <p className="text-muted-foreground text-lg">
                        Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.
                    </p>
                </div>

                {/* Path display */}
                {/* <div className="rounded-md bg-muted/50 px-4 py-2 font-mono text-sm text-muted-foreground">
                    {location.pathname}
                </div> */}

                {/* Actions */}
                <div className="flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
                    <Button variant="outline" size="lg" onClick={() => navigate(-1)} className="gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Go Back
                    </Button>
                    <Button size="lg" asChild className="gap-2 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
                        <Link to="/">
                            <Home className="h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
