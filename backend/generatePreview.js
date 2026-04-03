import fs from 'fs';
import path from 'path';
import { render } from '@react-email/render';
import React from 'react';
import WelcomeEmail from './emails/templates/WelcomeEmail.jsx';

// Force environment for preview
process.env.FRONTEND_URL = 'http://localhost:3000';

(async () => {
    try {
        const logoPath = path.resolve('..', 'src', 'assets', 'favicon.png');
        let logoBase64 = '';
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            process.env.FRONTEND_URL = logoBase64;
        }

        const html = await render(
            React.createElement(WelcomeEmail, { 
                name: 'Mahesh',
                provider: 'Google',
                resetUrl: 'http://localhost:5173/reset'
            }),
            { pretty: true }
        );
        
        fs.writeFileSync('./emails/preview.html', html);
    } catch (e) {
        console.error('PREVIEW ERROR:', e);
    }
})();
