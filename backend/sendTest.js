import { sendVerificationEmail } from './utils/emailService.jsx';
import dotenv from 'dotenv';
dotenv.config();

(async () => {
    try {
        console.log('Starting live email test (using .jsx service)...');
        const result = await sendVerificationEmail('mahiimhetre@gmail.com', 'Mahesh', 'test-token-123');
        if (result) {
            console.log('SUCCESS: Email sent to mahiimhetre@gmail.com');
        } else {
            console.error('FAILURE: SMTP send failed.');
        }
    } catch (err) {
        console.error('CRITICAL TEST ERROR:', err);
    }
})();
