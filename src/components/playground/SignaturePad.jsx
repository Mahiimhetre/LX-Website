import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { PenToolIcon, SaveIcon, RotateCcwIcon } from '@/components/icons';
import { cn } from "@/lib/utils";

const SignaturePad = ({ className }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState([2]);
    const canvasRef = useRef(null);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        ctx.beginPath();
        ctx.moveTo(clientX - rect.left, clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        
        ctx.lineTo(clientX - rect.left, clientY - rect.top);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize[0];
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
    };

    const stopDrawing = () => setIsDrawing(false);

    const clearSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    };

    const saveSignature = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const dataUrl = canvas.toDataURL('image/png');
        
        const link = document.createElement('a');
        link.download = 'signature.png';
        link.href = dataUrl;
        link.click();
        
        alert('Signature saved and downloaded successfully!');
    };

    // Auto initialize the canvas to white color on load based on parent size
    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas && canvas.parentElement) {
            const container = canvas.parentElement;
            canvas.width = container.clientWidth || 500;
            canvas.height = container.clientHeight || 180;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = 'white';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, []);

    return (
        <Card className={cn("w-full glass-panel flex flex-col", className)}>
            <CardHeader className="flex-none">
                <CardTitle className="flex items-center gap-2">
                    <PenToolIcon className="h-5 w-5 text-primary" />
                    <span>Digital Signature Pad</span>
                </CardTitle>
                <CardDescription>Draw, customize, and export your digital signature on a local canvas.</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col gap-4">
                <div className="flex-grow border border-white/10 rounded-xl p-1 bg-white overflow-hidden shadow-inner min-h-[140px]">
                    <canvas
                        ref={canvasRef}
                        className="w-full h-full cursor-crosshair touch-none bg-white block"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                        onTouchStart={startDrawing}
                        onTouchMove={draw}
                        onTouchEnd={stopDrawing}
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 p-3 bg-white/2 rounded-xl border border-white/8 text-sm flex-none backdrop-blur-md">
                    <div className="flex items-center justify-between gap-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Color:</span>
                        <input
                            type="color"
                            value={penColor}
                            onChange={(e) => setPenColor(e.target.value)}
                            className="h-7 w-10 p-0 bg-transparent border-none cursor-pointer rounded-[6px] overflow-hidden"
                        />
                    </div>
                    <div className="flex items-center gap-3 flex-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap hidden xs:inline">Size: {penSize[0]}px</span>
                        <Slider
                            value={penSize}
                            min={1}
                            max={8}
                            step={1}
                            onValueChange={setPenSize}
                            className="w-full"
                        />
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearSignature}
                            className="h-8 hover:bg-white/10 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                        >
                            <RotateCcwIcon className="h-3.5 w-3.5" />
                            <span>Clear</span>
                        </Button>
                        <Button onClick={saveSignature} size="sm" className="h-8 flex items-center gap-2">
                            <SaveIcon className="h-3.5 w-3.5" />
                            <span>Save Sign</span>
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default SignaturePad;
