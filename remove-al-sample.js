const fs = require('fs');
const path = require('path');

const filePath = path.join(process.cwd(), 'src/app/page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetBlock = `const SAMPLE_NUMBERS = [
  { label: 'US Line', iso: 'US', dialCode: '+1', localNumber: '212 555 0199' },
  { label: 'UK Mobile', iso: 'GB', dialCode: '+44', localNumber: '7911 123456' },
  { label: 'AL Mobile', iso: 'AL', dialCode: '+355', localNumber: '69 200 1234' },
];`;

const replacementBlock = `const SAMPLE_NUMBERS = [
  { label: 'US Line', iso: 'US', dialCode: '+1', localNumber: '212 555 0199' },
  { label: 'UK Mobile', iso: 'GB', dialCode: '+44', localNumber: '7911 123456' },
];`;

if (!content.includes(targetBlock)) {
  console.error('Could not find SAMPLE_NUMBERS block in src/app/page.tsx.');
  process.exit(1);
}

content = content.replace(targetBlock, replacementBlock);
fs.writeFileSync(filePath, content, 'utf8');
console.log('Removed AL Mobile from SAMPLE_NUMBERS in src/app/page.tsx!');