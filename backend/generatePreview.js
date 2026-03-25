import fs from 'fs';
import path from 'path';
import { render } from '@react-email/render';
import React from 'react';
import WelcomeEmail from './emails/templates/WelcomeEmail.jsx';

// Force environment for preview
process.env.FRONTEND_URL = 'http://localhost:3000';

(async () => {
    try {
        console.log('Reading logo for base64 encoding...');
        const logoPath = path.resolve('..', 'src', 'assets', 'favicon.png');
        let logoBase64 = '';
        if (fs.existsSync(logoPath)) {
            const logoBuffer = fs.readFileSync(logoPath);
            logoBase64 = `data:image/png;base64,${logoBuffer.toString('base64')}`;
            console.log('Logo encoded successfully.');
            process.env.FRONTEND_URL = logoBase64;
        }

        console.log('Rendering Stable Pure-HTML version...');
        const html = await render(
            React.createElement(WelcomeEmail, { 
                name: 'Mahesh',
                provider: 'Google',
                resetUrl: 'http://localhost:5173/reset'
            }),
            { pretty: true }
        );
        
        fs.writeFileSync('./emails/preview.html', html);
        console.log('Stable preview generated to backend/emails/preview.html');
    } catch (e) {
        console.error('PREVIEW ERROR:', e);
    }
})();
