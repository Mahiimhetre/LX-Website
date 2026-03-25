import logoSrc from '@/assets/favicon.png';
import { cn } from '@/lib/utils';

export const logoUrl = logoSrc;

const Logo = ({ className }) => {
    return (
        <img
            src={logoUrl}
            alt="LocatorX"
            className={cn("w-full h-full object-cover rounded-full", className)}
        />
    );
};

export default Logo;
