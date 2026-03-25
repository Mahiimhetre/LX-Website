import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, XCircle, AlertCircle, RotateCcw } from 'lucide-react';

const FormValidation = () => {
    const [formData, setFormData] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [errors, setErrors] = useState({
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });

    const [status, setStatus] = useState('Fill form to validate');

    const validateEmail = (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    };

    const validatePhone = (phone) => {
        const regex = /^[+][0-9\s\-()]+$/;
        return regex.test(phone) && phone.length >= 10;
    };

    const validateForm = (e) => {
        e.preventDefault();

        const newErrors = {
            email: '',
            phone: '',
            password: '',
            confirmPassword: ''
        };

        let isValid = true;

        if (!formData.email) {
            newErrors.email = 'Email is required';
            isValid = false;
        } else if (!validateEmail(formData.email)) {
            newErrors.email = 'Invalid email format';
            isValid = false;
        }

        if (!formData.phone) {
            newErrors.phone = 'Phone is required';
            isValid = false;
        } else if (!validatePhone(formData.phone)) {
            newErrors.phone = 'Invalid phone format (use +1 234 567 8900)';
            isValid = false;
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
            isValid = false;
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
            isValid = false;
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
            isValid = false;
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
            isValid = false;
        }

        setErrors(newErrors);
        setStatus(isValid ? 'Form is valid!' : 'Please fix errors');

        if (isValid) {
            alert('Form submitted successfully!');
        }
    };

    const resetForm = () => {
        setFormData({ email: '', phone: '', password: '', confirmPassword: '' });
        setErrors({ email: '', phone: '', password: '', confirmPassword: '' });
        setStatus('Fill form to validate');
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle>Form Validation</CardTitle>
                <Button variant="ghost" size="sm" onClick={resetForm} className="gap-2">
                    <RotateCcw className="h-4 w-4" />
                    Reset
                </Button>
            </CardHeader>
            <CardContent>
                <form onSubmit={validateForm} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email *</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.email}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone *</Label>
                            <Input
                                id="phone"
                                type="tel"
                                placeholder="+91 1234567890"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className={errors.phone ? "border-red-500" : ""}
                            />
                            {errors.phone && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.phone}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="password">Password *</Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Min 8 characters"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className={errors.password ? "border-red-500" : ""}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.password}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirm Password *</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Repeat password"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className={errors.confirmPassword ? "border-red-500" : ""}
                            />
                            {errors.confirmPassword && (
                                <p className="text-xs text-red-500 flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> {errors.confirmPassword}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                        <div className={`flex items-center gap-2 text-sm font-medium ${status.includes('valid!') ? 'text-green-500' :
                            status.includes('errors') ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                            {status.includes('valid!') ? <CheckCircle className="h-4 w-4" /> :
                                status.includes('errors') ? <XCircle className="h-4 w-4" /> : null}
                            {status}
                        </div>
                        <Button type="submit">Validate & Submit</Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

export default FormValidation;
