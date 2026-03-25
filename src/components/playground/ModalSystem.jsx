import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import { X } from 'lucide-react';

const ModalSystem = () => {
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isBottomOpen, setIsBottomOpen] = useState(false);

    const confirmAction = () => {
        alert('Action confirmed!');
        setIsConfirmOpen(false);
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Modal System</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    {/* Info Modal */}
                    <Dialog open={isInfoOpen} onOpenChange={setIsInfoOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline">Info Modal</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Information</DialogTitle>
                                <DialogDescription>
                                    This is an informational modal using Shadcn UI Dialog component.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                                <p className="text-sm text-muted-foreground">
                                    Dialogs are great for displaying important information that requires user attention without navigating away from the current context.
                                </p>
                            </div>
                            <DialogFooter>
                                <Button onClick={() => setIsInfoOpen(false)}>Close</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Confirm Modal */}
                    <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                        <DialogTrigger asChild>
                            <Button variant="default">Confirm Modal</Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Confirm Action</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to proceed? This action cannot be undone.
                                </DialogDescription>
                            </DialogHeader>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                                <Button onClick={confirmAction}>Confirm</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    {/* Bottom Modal (Drawer) */}
                    <Drawer open={isBottomOpen} onOpenChange={setIsBottomOpen}>
                        <DrawerTrigger asChild>
                            <Button variant="secondary">Open Bottom Sheet</Button>
                        </DrawerTrigger>
                        <DrawerContent className="bg-[#0f172a] border-white/10">
                            <div className="p-6 pt-2 relative">
                                <DrawerClose asChild>
                                    <button className="absolute right-2 top-0 p-0.5 hover:bg-white/10 rounded-full transition-colors z-10">
                                        <X size={16} className="text-muted-foreground hover:text-foreground" />
                                    </button>
                                </DrawerClose>

                                <div className="space-y-4 pr-8">
                                    <h3 className="text-lg font-bold text-foreground">
                                        Scale Your Test Automation
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Locator-X seamlessly synchronizes with your Chrome extension to capture and manage robust selectors for Playwright, Selenium, and Cypress—ensuring 100% automation coverage in real-time.
                                    </p>
                                </div>
                            </div>
                        </DrawerContent>
                    </Drawer>
                </div>
            </CardContent>
        </Card>
    );
};

export default ModalSystem;
