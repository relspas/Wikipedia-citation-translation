import testCases from './test-data.json';
import {translate} from '../script.js';

document.addEventListener('DOMContentLoaded', () => {
  testCases.forEach(({ i, input, expected }) => {
    const result = translate(input); // Your function
    const passed = result === expected;
    const msg = passed ? '✅ Passed' : `❌ Failed: Got "${result}", expected "${expected}"`;
    document.body.innerHTML += `<p>Test ${i}: ${msg}</p>`;
  });
});
