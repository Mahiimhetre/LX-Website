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
import { UserIcon, LockIcon, SaveIcon, Edit2Icon, PenToolIcon, EraserIcon, UserCircleIcon, XIcon } from '@/components/icons';;
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
                        className="border-white/10 transition-all shadow-lg rounded-full flex items-center gap-2"
                    >
                        {isEditing ? <XIcon className="h-4 w-4 shrink-0" /> : <Edit2Icon className="h-4 w-4 shrink-0" />}
                        <span>
                            {isEditing ? 'Cancel Edit' : 'Edit Profile'}
                        </span>
                    </Button>
                </div>
            </CardHeader>

            {isEditing && (
                <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="personal" className="gap-2"><UserIcon className="h-4 w-4" /> Personal</TabsTrigger>
                            <TabsTrigger value="security" className="gap-2"><LockIcon className="h-4 w-4" /> Security</TabsTrigger>
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
                                        pattern="^\+?[0-9]{10,15}$"
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
                            "w-full sm:w-auto transition-all shadow-lg rounded-full flex items-center justify-center gap-2",
                            agreeTerms && "bg-primary text-white shadow-primary/20"
                        )}
                    >
                        <SaveIcon className="h-4 w-4 shrink-0" />
                        <span>Save Changes</span>
                    </Button>
                </CardFooter>
            )}
        </Card>
    );
};

export default UserProfile;
