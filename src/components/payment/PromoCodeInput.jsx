import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tag, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/api/client';

const PromoCodeInput = ({ onApply, onRemove, disabled, planName }) => {
    const [code, setCode] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [appliedCode, setAppliedCode] = useState(null);

    const handleApply = async () => {
        if (!code) return;

        setIsValidating(true);
        try {
            const normalizedCode = code.toUpperCase();

            const { data } = await apiClient.post('/promo/validate', {
                code: normalizedCode,
                planName
            });

            if (!data.success) throw new Error(data.message);

            const promo = data.promo;

            // Map to expected discount format
            const discount = {
                type: promo.discount_type,
                value: Number(promo.discount_value),
                code: promo.code // Store code for later usage increment
            };

            setAppliedCode(normalizedCode);
            onApply(discount, normalizedCode);
            toast.success(`Promo code ${normalizedCode} applied!`);
        } catch (error) {
            console.error(error);
            toast.error(error.message || 'Failed to validate promo code');
            setCode('');
        } finally {
            setIsValidating(false);
        }
    };

    const handleRemove = () => {
        setAppliedCode(null);
        setCode('');
        onRemove();
        toast.info('Promo code removed');
    };

    if (appliedCode) {
        return (
            <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-green-500" />
                    <span className="text-sm font-medium text-green-500">
                        Code <span className="font-bold">{appliedCode}</span> applied
                    </span>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRemove}
                    className="h-6 w-6 p-0 hover:bg-green-500/20 text-green-600"
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
        );
    }

    return (
        <div className="flex gap-2">
            <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    placeholder="Promo Code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="pl-9 bg-background/50 border-white/10"
                    disabled={disabled || isValidating}
                    onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
            </div>
            <Button
                onClick={handleApply}
                disabled={!code || disabled || isValidating}
                variant="secondary"
                className="shrink-0"
            >
                {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
            </Button>
        </div>
    );
};

export default PromoCodeInput;
