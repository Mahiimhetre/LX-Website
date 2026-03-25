import { useState, useRef } from 'react';
import { Camera, Loader2, X, Pencil } from 'lucide-react';
import apiClient from '@/api/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const HandleAvatar = ({ userId, currentAvatarUrl, onUploadComplete, size = 'md' }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(currentAvatarUrl || null);
    const fileInputRef = useRef(null);

    const sizeClasses = {
        sm: 'w-12 h-12',
        md: 'w-20 h-20',
        lg: 'w-32 h-32',
    };

    const iconSizes = {
        sm: 'w-4 h-4',
        md: 'w-6 h-6',
        lg: 'w-8 h-8',
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image must be less than 5MB');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('avatar', file);
            
            const { data } = await apiClient.post('/profile/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (!data.success) throw new Error(data.message);

            setPreviewUrl(data.avatarUrl);
            onUploadComplete?.(data.avatarUrl);
            toast.success('Avatar updated successfully!');
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error.message || 'Failed to upload avatar');
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!previewUrl) return;

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('remove', 'true');
            const { data } = await apiClient.post('/profile/avatar', formData);
            if (!data.success) throw new Error(data.message);

            setPreviewUrl(null);
            onUploadComplete?.('');
            toast.success('Avatar removed');
        } catch (error) {
            toast.error(error.message || 'Failed to remove avatar');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative inline-block group/avatar-container">
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
            />

            <div
                className={cn(
                    'relative rounded-full overflow-hidden bg-muted flex items-center justify-center cursor-pointer transition-all duration-300 ring-2 ring-white/10 group-hover/avatar-container:ring-primary/50',
                    sizeClasses[size]
                )}
                onClick={() => !isUploading && fileInputRef.current?.click()}
            >
                {previewUrl ? (
                    <img
                        src={previewUrl}
                        alt="Avatar"
                        className="w-full h-full object-cover transition-transform duration-500 group-hover/avatar-container:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                        <Camera className={cn('text-primary/50', iconSizes[size])} />
                    </div>
                )}

                {/* Overlay */}
                <div className={cn(
                    'absolute inset-0 bg-black/40 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover/avatar-container:opacity-100 transition-all duration-300',
                    isUploading && 'opacity-100'
                )}>
                    {isUploading ? (
                        <Loader2 className={cn('text-white animate-spin', iconSizes[size])} />
                    ) : (
                        <div className="flex flex-col items-center gap-1">
                            <Camera className={cn('text-white/80', iconSizes[size])} />
                            <span className="text-[10px] text-white/80 font-medium uppercase tracking-wider">Change</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Pencil Edit Button (Always visible or on hover, user asked for bottom right) */}
            {!isUploading && (
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                        "absolute bottom-0 right-0 p-1.5 rounded-full bg-primary text-white shadow-lg border-2 border-background hover:scale-110 transition-all duration-200 z-10",
                        size === 'sm' ? 'p-1' : 'p-1.5'
                    )}
                >
                    <Pencil className={cn(size === 'sm' ? 'w-3 h-3' : 'w-4 h-4')} />
                </button>
            )}

            {/* Remove button (Elegantly positioned) */}
            {previewUrl && !isUploading && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveAvatar();
                    }}
                    className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-black/50 backdrop-blur-md text-white/70 flex items-center justify-center hover:bg-destructive hover:text-white transition-all duration-200 border border-white/10 opacity-0 group-hover/avatar-container:opacity-100 scale-75 group-hover/avatar-container:scale-100"
                    title="Remove avatar"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            )}
        </div>
    );
};

export default HandleAvatar;
