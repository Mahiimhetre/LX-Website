import { User, Team, Payment } from './models/index.js';

console.log('User loaded:', !!User);
console.log('Team loaded:', !!Team);
console.log('Payment loaded:', !!Payment);

console.log('Successful loading of all models!');
process.exit(0);
