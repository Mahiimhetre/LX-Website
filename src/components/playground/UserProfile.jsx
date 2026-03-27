import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { User, Lock, Save, Edit2, PenTool, Eraser, UserCircle, X } from 'lucide-react';
import { cn } from "@/lib/utils";

const UserProfile = () => {
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('personal');
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [profile, setProfile] = useState({
        firstName: 'John',
        lastName: 'Doe',
        designation: 'Software Developer',
        email: 'john@example.com',
        phone: '+1 234 567 8900',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#000000');
    const [penSize, setPenSize] = useState([2]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }, [isEditing]);

    const startDrawing = (e) => {
        setIsDrawing(true);
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const rect = canvas.getBoundingClientRect();
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize[0];
        ctx.lineCap = 'round';
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
        // Signature saved logic goes here
    };

    const toggleEdit = () => {
        setIsEditing(!isEditing);
        if (isEditing) {
            setAgreeTerms(false);
        }
    };

    const saveProfile = () => {
        console.log('Profile saved:', profile);
        setIsEditing(false);
        setAgreeTerms(false);
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-primary/20">
                        <AvatarImage src="" />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-purple-500 text-white text-xl">
                            {profile.firstName[0]}{profile.lastName[0]}
                        </AvatarFallback>
                    </Avatar>
                    <div className="text-center sm:text-left flex-1">
                        <CardTitle className="text-xl">{profile.firstName} {profile.lastName}</CardTitle>
                        <CardDescription>{profile.designation}</CardDescription>
                    </div>
                    <Button
                        variant={isEditing ? "destructive" : "outline"}
                        onClick={toggleEdit}
                        className={cn(
                            "hover-expand border-white/10 transition-all shadow-lg",
                            isEditing && "is-expanded"
                        )}
                    >
                        {isEditing ? <X className="h-4 w-4 shrink-0" /> : <Edit2 className="h-4 w-4 shrink-0" />}
                        <span className="hover-expand-text">
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </span>
                    </Button>
                </div>
            </CardHeader>

            {isEditing && (
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="personal" className="gap-2"><User className="h-4 w-4" /> Personal</TabsTrigger>
                            <TabsTrigger value="security" className="gap-2"><Lock className="h-4 w-4" /> Security</TabsTrigger>
                        </TabsList>

                        <TabsContent value="personal" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>First Name</Label>
                                    <Input
                                        value={profile.firstName}
                                        onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Last Name</Label>
                                    <Input
                                        value={profile.lastName}
                                        onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Input
                                        value={profile.designation}
                                        onChange={(e) => setProfile({ ...profile, designation: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={profile.email}
                                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <Label>Phone</Label>
                                    <Input
                                        type="tel"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="security" className="space-y-4">
                            <div className="space-y-2">
                                <Label>Current Password</Label>
                                <Input
                                    type="password"
                                    value={profile.currentPassword}
                                    onChange={(e) => setProfile({ ...profile, currentPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>New Password</Label>
                                <Input
                                    type="password"
                                    value={profile.newPassword}
                                    onChange={(e) => setProfile({ ...profile, newPassword: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Confirm Password</Label>
                                <Input
                                    type="password"
                                    value={profile.confirmPassword}
                                    onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })}
                                />
                            </div>

                            <div className="mt-4 pt-4 border-t border-white/10">
                                <Label className="mb-2 block text-xs text-muted-foreground">Terms of Service (Read-Only)</Label>
                                <iframe
                                    srcDoc={`
                                        <html>
                                            <body style="background: #0f172a; color: #94a3b8; padding: 12px; font-family: sans-serif; font-size: 12px;">
                                                <h3 style="color: #cbd5e1; margin-top: 0;">Terms & Conditions</h3>
                                                <p>By using this service, you agree to:</p>
                                                <ul style="padding-left: 20px;">
                                                    <li>Data processing policies.</li>
                                                    <li>Cookie usage for session management.</li>
                                                </ul>
                                                <p style="margin-top: 20px; color: #64748b; font-style: italic;">Script execution is disabled in this frame.</p>
                                                <script>document.body.innerHTML = "SCRIPTS SHOULD NOT RUN";</script>
                                            </body>
                                        </html>
                                    `}
                                    sandbox=""
                                    className="w-full h-[150px] rounded-md border border-white/10 bg-black/20"
                                    title="Terms of Service"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Separator className="my-6" />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label className="flex items-center gap-2"><PenTool className="h-4 w-4" /> Digital Signature</Label>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSignature}
                                className="hover-expand h-8 border-transparent hover:bg-white/5"
                            >
                                <Eraser className="h-3 w-3 shrink-0" />
                                <span className="hover-expand-text">Clear</span>
                            </Button>
                        </div>

                        <div className="border border-white/10 rounded-md p-1 bg-white">
                            <canvas
                                ref={canvasRef}
                                width={300}
                                height={100}
                                className="w-full h-[100px] cursor-crosshair touch-none"
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>

                        <div className="flex flex-wrap items-center gap-4 p-3 bg-white/5 rounded-lg border border-white/10">
                            <div className="flex items-center gap-2">
                                <Label className="text-xs">Color:</Label>
                                <input
                                    type="color"
                                    value={penColor}
                                    onChange={(e) => setPenColor(e.target.value)}
                                    className="h-6 w-8 p-0 bg-transparent border-none cursor-pointer"
                                />
                            </div>
                            <div className="flex items-center gap-2 flex-1 min-w-[120px]">
                                <Label className="text-xs whitespace-nowrap">Size: {penSize[0]}px</Label>
                                <Slider
                                    value={penSize}
                                    min={1}
                                    max={5}
                                    step={1}
                                    onValueChange={setPenSize}
                                    className="w-full"
                                />
                            </div>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={saveSignature}
                                className="hover-expand h-7 border-transparent"
                            >
                                <Save className="h-3 w-3 shrink-0" />
                                <span className="hover-expand-text">Save Sign</span>
                            </Button>
                        </div>
                    </div>
                </CardContent>
            )}

            {isEditing && (
                <CardFooter className="flex-col gap-4 items-stretch sm:flex-row sm:justify-between">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="terms"
                            checked={agreeTerms}
                            onCheckedChange={setAgreeTerms}
                        />
                        <Label htmlFor="terms" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            I agree to save changes
                        </Label>
                    </div>
                    <Button
                        onClick={saveProfile}
                        disabled={!agreeTerms}
                        className={cn(
                            "hover-expand w-full sm:w-auto transition-all shadow-lg",
                            agreeTerms && "bg-primary text-white shadow-primary/20"
                        )}
                    >
                        <Save className="h-4 w-4 shrink-0" />
                        <span className="hover-expand-text">Save Changes</span>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

const XIcon = ({ className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 18 18" />
    </svg>
)

export default UserProfile;
