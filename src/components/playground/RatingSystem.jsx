import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Star, Upload, Trash2, Send } from 'lucide-react';

const RatingSystem = () => {
    const [ratings, setRatings] = useState({
        service: 0,
        product: 0,
        support: 0
    });
    const [review, setReview] = useState('');
    const [files, setFiles] = useState([]);

    const handleRating = (category, value) => {
        setRatings(prev => ({ ...prev, [category]: value }));
    };

    const handleFileUpload = (e) => {
        if (e.target.files) {
            const uploadedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...uploadedFiles]);
        }
    };

    const removeFile = (index) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    const StarRating = ({ value, onChange, ariaLabel }) => {
        return (
            <div className="flex gap-1" role="radiogroup" aria-label={ariaLabel}>
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        role="radio"
                        aria-checked={star <= value}
                        aria-label={`Rate ${star} stars`}
                        onClick={() => onChange(star)}
                        className={`rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-transform hover:scale-110 ${star <= value ? 'text-yellow-500' : 'text-muted-foreground/30'}`}
                    >
                        <Star className={`h-6 w-6 ${star <= value ? 'fill-yellow-500' : ''}`} />
                    </button>
                ))}
            </div>
        );
    };

    const handleSubmit = () => {
        const ratingCount = Object.values(ratings).filter(r => r > 0).length;
        if (ratingCount === 0) {
            alert('Please provide at least one rating');
            return;
        }
        alert('Review submitted successfully!');
        setRatings({ service: 0, product: 0, support: 0 });
        setReview('');
        setFiles([]);
    };

    return (
        <Card className="w-full max-w-2xl mx-auto bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle>Submit Your Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-background/20 p-4 rounded-lg flex flex-col items-center gap-2 border border-white/5">
                        <Label>Service Quality</Label>
                        <StarRating ariaLabel="Service Quality Rating" value={ratings.service} onChange={(val) => handleRating('service', val)} />
                        <span className="text-sm text-muted-foreground">{ratings.service}/5</span>
                    </div>

                    <div className="bg-background/20 p-4 rounded-lg flex flex-col items-center gap-2 border border-white/5">
                        <Label>Product Quality</Label>
                        <StarRating ariaLabel="Product Quality Rating" value={ratings.product} onChange={(val) => handleRating('product', val)} />
                        <span className="text-sm text-muted-foreground">{ratings.product}/5</span>
                    </div>

                    <div className="bg-background/20 p-4 rounded-lg flex flex-col items-center gap-2 border border-white/5">
                        <Label>Support</Label>
                        <StarRating ariaLabel="Support Rating" value={ratings.support} onChange={(val) => handleRating('support', val)} />
                        <span className="text-sm text-muted-foreground">{ratings.support}/5</span>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="review">Detailed Review</Label>
                    <Textarea
                        id="review"
                        placeholder="Share your experience..."
                        className="min-h-[120px]"
                        value={review}
                        onChange={(e) => setReview(e.target.value)}
                    />
                </div>

                <div className="space-y-4">
                    <Label>Attach Photos/Videos</Label>
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" className="relative overflow-hidden cursor-pointer" type="button">
                                <Upload className="mr-2 h-4 w-4" /> Upload Files
                                <input
                                    type="file"
                                    multiple
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                    onChange={handleFileUpload}
                                    accept="image/*,video/*"
                                />
                            </Button>
                            <span className="text-sm text-muted-foreground">{files.length} files selected</span>
                        </div>

                        {files.length > 0 && (
                            <div className="flex flex-wrap gap-2 p-4 bg-background/20 rounded-md border border-white/5">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center gap-2 bg-background/50 p-2 rounded text-sm group relative pr-8 max-w-[200px] border border-white/10">
                                        <span className="truncate">{file.name}</span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            aria-label="Remove file"
                                            className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-destructive transition-colors rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full gap-2" size="lg" onClick={handleSubmit}>
                    <Send className="h-4 w-4" /> Submit Review
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RatingSystem;
