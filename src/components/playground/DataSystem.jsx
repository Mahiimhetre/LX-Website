import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
    Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Database, Package, Download, Eye, Trash2, Upload,
    File, X, Check, ShoppingCart, ArrowUpDown, Search
} from 'lucide-react';
import { cn } from "@/lib/utils";
import productsData from '@/data/products.json';

// --- Product Inventory (DataTable) ---
// ⚡ Bolt Optimization: Wrap component in React.memo to prevent unnecessary re-renders when parent's `view` state changes.
export const DataTable = React.memo(({ onAddToCart, cartCount, onViewCart, onViewOrders }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [entriesPerPage, setEntriesPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState(null);

    const products = productsData.items;
    const columns = productsData.columns;

    const filteredProducts = useMemo(() => {
        let result = [...products];
        if (searchTerm) {
            result = result.filter(p => Object.values(p).some(v => String(v).toLowerCase().includes(searchTerm.toLowerCase())));
        }
        if (sortConfig) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key];
                const bVal = b[sortConfig.key];
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [products, searchTerm, sortConfig]);

    const totalPages = Math.ceil(filteredProducts.length / entriesPerPage);
    const paginatedProducts = filteredProducts.slice((currentPage - 1) * entriesPerPage, currentPage * entriesPerPage);

    const handleSort = (key) => {
        setSortConfig(prev => (prev?.key === key ? { key, direction: prev.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' }));
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4">
                <CardTitle>Product Inventory</CardTitle>
                <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                    <div className={cn(
                        "flex hover-expand bg-white/5 backdrop-blur-md border border-white/10 transition-all shadow-lg cursor-pointer",
                        "hover:bg-white/10 focus-within:ring-2 focus-within:ring-primary/20 focus-within:bg-white/10 focus-within:border-primary/40",
                        searchTerm && "is-expanded"
                    )}>
                        <Search size={16} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                            className="hover-expand-text min-w-0 bg-transparent border-none outline-none text-xs text-foreground placeholder:text-muted-foreground/50 p-0"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="p-1 hover:bg-white/10 rounded-full text-muted-foreground hover:text-foreground transition-all shrink-0 ml-1 animate-in zoom-in duration-200"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Cart button expandable */}
                    <Button variant="outline" onClick={onViewCart} className="group hover-expand relative border-white/10">
                        <ShoppingCart className="h-4 w-4" />
                        <span className="hover-expand-text">Cart</span>
                        {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-destructive text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-background">{cartCount}</span>}
                    </Button>

                    <Button onClick={onViewOrders} className="group hover-expand">
                        <Package />
                        <span className="hover-expand-text">My Orders</span>
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex justify-end mb-4 items-center gap-2 text-sm text-muted-foreground">
                    <span>Show</span>
                    <Select
                        value={entriesPerPage.toString()}
                        onValueChange={(val) => {
                            setEntriesPerPage(Number(val));
                            setCurrentPage(1);
                        }}
                    >
                        <SelectTrigger className="w-[70px] h-8 rounded-full bg-white/5">
                            <SelectValue placeholder={entriesPerPage} />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="5">5</SelectItem>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="15">15</SelectItem>
                            <SelectItem value="20">20</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>entries/page</span>
                </div>
                <div className="rounded-md border border-white/10">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow>
                                {columns.map(col => (
                                    <TableHead key={col.key} onClick={() => col.sortable && handleSort(col.key)} className={col.sortable ? 'cursor-pointer select-none' : ''}>
                                        <div className="flex items-center gap-1">{col.label}{col.sortable && <ArrowUpDown className="h-3 w-3" />}</div>
                                    </TableHead>
                                ))}
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedProducts.map(product => (
                                <TableRow key={product.id} className="hover:bg-white/5">
                                    <TableCell>{product.id}</TableCell><TableCell>{product.name}</TableCell><TableCell>{product.category}</TableCell><TableCell>{product.price}</TableCell>
                                    <TableCell><Badge variant={product.stock >= 20 ? 'default' : product.stock >= 10 ? 'secondary' : 'destructive'}>{product.stock}</Badge></TableCell>
                                    <TableCell><div className="flex gap-2"><Button variant="outline" size="xs" onClick={() => onAddToCart(product)} disabled={product.stock === 0}>Add</Button><Button size="xs" onClick={() => onAddToCart(product)} disabled={product.stock === 0}>Buy</Button></div></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Showing {(currentPage - 1) * entriesPerPage + 1}-{Math.min(currentPage * entriesPerPage, filteredProducts.length)} of {filteredProducts.length} records
                    </div>
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <PaginationItem key={page}>
                                    <PaginationLink
                                        onClick={() => setCurrentPage(page)}
                                        isActive={currentPage === page}
                                        className="cursor-pointer"
                                    >
                                        {page}
                                    </PaginationLink>
                                </PaginationItem>
                            ))}
                            <PaginationItem>
                                <PaginationNext
                                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </CardContent>
        </Card>
    );
});

// --- Data Management Component ---
// ⚡ Bolt Optimization: Wrap component in React.memo to prevent unnecessary re-renders on unrelated parent state updates.
export const DataManagement = React.memo(() => {
    const [retentionPeriod, setRetentionPeriod] = useState('7');
    const [showData, setShowData] = useState(false);
    const [files, setFiles] = useState([]);
    const [isDragging, setIsDragging] = useState(false);

    const getExpiryDate = () => {
        if (retentionPeriod === '-1') return 'Never';
        const date = new Date();
        date.setDate(date.getDate() + parseInt(retentionPeriod));
        return date.toLocaleDateString();
    };

    const exportData = () => {
        const data = { profile: { name: 'John Doe' }, exportedAt: new Date().toISOString() };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'user-data.json'; a.click();
    };

    return (
        <Card className="w-full bg-white/5 border-white/10 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Data Management</CardTitle>
                <CardDescription>Manage local persistence and exports.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-lg bg-black/20 border border-white/5">
                    <div className="space-y-1">
                        <span className="text-sm font-medium text-muted-foreground">Retention Period</span>
                        <div className="text-sm">
                            Expires on: <strong className="text-primary">{getExpiryDate()}</strong>
                        </div>
                    </div>
                    <div className="w-full md:w-[200px]">
                        <Select value={retentionPeriod} onValueChange={setRetentionPeriod}>
                            <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="7">7 Days</SelectItem>
                                <SelectItem value="30">30 Days</SelectItem>
                                <SelectItem value="-1">Never</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={exportData}
                        className="hover-expand border-white/10"
                    >
                        <Download className="h-4 w-4 shrink-0" />
                        <span className="hover-expand-text">Export</span>
                    </Button>
                    <Button
                        variant="secondary"
                        onClick={() => setShowData(!showData)}
                        className="hover-expand border-transparent"
                    >
                        <Eye className="h-4 w-4 shrink-0" />
                        <span className="hover-expand-text">View Data</span>
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => confirm('Clear all data?') && localStorage.clear()}
                        className="hover-expand border-transparent"
                    >
                        <Trash2 className="h-4 w-4 shrink-0" />
                        <span className="hover-expand-text">Clear</span>
                    </Button>
                </div>
                <div className="border-t border-white/10 pt-6">
                    <h3 className="text-lg font-medium mb-4 flex items-center gap-2"><Upload className="h-5 w-5" /> Import Data</h3>
                    <div
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${isDragging
                            ? 'border-primary bg-primary/10'
                            : 'border-white/10 hover:border-primary/50 hover:bg-white/5'
                            }`}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                            e.preventDefault();
                            setIsDragging(false);
                            if (e.dataTransfer.files) setFiles(Array.from(e.dataTransfer.files));
                        }}
                    >
                        <Upload className={`h-8 w-8 mx-auto mb-2 ${isDragging ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className="text-sm">Drag backup or <label htmlFor="file-import" className="text-primary cursor-pointer underline">browse</label></p>
                        <input id="file-import" type="file" className="hidden" accept=".json" onChange={(e) => e.target.files && setFiles(Array.from(e.target.files))} />
                    </div>
                    {files.length > 0 && (
                        <Button className="w-full mt-4" size="sm" onClick={() => { alert('Success!'); setFiles([]); }}><Check className="mr-2 h-3 w-3" /> Process {files[0].name}</Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
});
