import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateReceipt } from './receiptService';

describe('receiptService', () => {
    let mockCreateObjectURL;
    let mockRevokeObjectURL;

    beforeEach(() => {
        // Mock Blob
        global.Blob = vi.fn().mockImplementation(function(content, options) {
            this.content = content;
            this.options = options;
        });

        // Mock URL
        mockCreateObjectURL = vi.fn().mockReturnValue('blob:http://localhost/mocked-url');
        mockRevokeObjectURL = vi.fn();
        global.URL.createObjectURL = mockCreateObjectURL;
        global.URL.revokeObjectURL = mockRevokeObjectURL;

        // Mock Document elements
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {});
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {});
    });

    afterEach(() => {
        vi.clearAllMocks();
        vi.restoreAllMocks();
    });

    it('should generate receipt and download HTML successfully', () => {
        const mockClick = vi.fn();
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'a') {
                return {
                    href: '',
                    download: '',
                    click: mockClick,
                };
            }
            return document.createElement(tagName);
        });

        const paymentData = {
            paymentId: 'pay_123',
            orderId: 'order_123',
            amount: 5000,
            currency: 'INR',
            planName: 'Pro',
            userName: 'John Doe',
            userEmail: 'john@example.com',
            date: '10/10/2023'
        };

        generateReceipt(paymentData);

        expect(global.Blob).toHaveBeenCalledTimes(1);
        const blobArgs = global.Blob.mock.calls[0];
        expect(blobArgs[1]).toEqual({ type: 'text/html' });

        const htmlContent = blobArgs[0][0];
        expect(htmlContent).toContain('Receipt - pay_123');
        expect(htmlContent).toContain('John Doe');
        expect(htmlContent).toContain('john@example.com');
        expect(htmlContent).toContain('ID: pay_123');
        expect(htmlContent).toContain('Date: 10/10/2023');
        expect(htmlContent).toContain('Pro Subscription');
        expect(htmlContent).toContain(`₹${(5000).toLocaleString()}`);

        expect(mockCreateObjectURL).toHaveBeenCalledTimes(1);

        expect(createElementSpy).toHaveBeenCalledWith('a');
        expect(document.body.appendChild).toHaveBeenCalledTimes(1);
        expect(mockClick).toHaveBeenCalledTimes(1);
        expect(document.body.removeChild).toHaveBeenCalledTimes(1);
        expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:http://localhost/mocked-url');

        // Check if download link was properly constructed
        const linkElement = document.body.appendChild.mock.calls[0][0];
        expect(linkElement.href).toBe('blob:http://localhost/mocked-url');
        expect(linkElement.download).toBe('LocatorX-Receipt-pay_123.html');

        createElementSpy.mockRestore();
    });

    it('should handle missing userName and use default value', () => {
        const mockClick = vi.fn();
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'a') {
                return { href: '', download: '', click: mockClick };
            }
            return document.createElement(tagName);
        });

        const paymentData = {
            paymentId: 'pay_456',
            orderId: 'order_456',
            amount: 100,
            currency: 'USD',
            planName: 'Basic',
            userEmail: 'jane@example.com',
            date: '11/11/2023'
        };

        generateReceipt(paymentData);

        const blobArgs = global.Blob.mock.calls[0];
        const htmlContent = blobArgs[0][0];

        expect(htmlContent).toContain('Valued Customer');
        expect(htmlContent).toContain(`$${(100).toLocaleString()}`); // Check USD symbol

        createElementSpy.mockRestore();
    });

    it('should use current date if no date provided', () => {
        const mockClick = vi.fn();
        const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
            if (tagName === 'a') {
                return { href: '', download: '', click: mockClick };
            }
            return document.createElement(tagName);
        });

        const paymentData = {
            paymentId: 'pay_789',
            orderId: 'order_789',
            amount: 250,
            currency: 'EUR', // Testing fallback symbol which is '$'
            planName: 'Enterprise',
            userName: 'Alice',
            userEmail: ''
        };

        generateReceipt(paymentData);

        const blobArgs = global.Blob.mock.calls[0];
        const htmlContent = blobArgs[0][0];

        const currentDateStr = new Date().toLocaleDateString();
        expect(htmlContent).toContain(`Date: ${currentDateStr}`);
        expect(htmlContent).toContain(`$${(250).toLocaleString()}`);

        createElementSpy.mockRestore();
    });
});