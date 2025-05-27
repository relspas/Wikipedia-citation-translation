document.addEventListener('DOMContentLoaded', () => {
  testCases.forEach(({ input, expected }, i) => {
    const result = translate(input); // Your function
    const passed = result === expected;
    const msg = passed ? '✅ Passed' : `❌ Failed: Got "${result}", expected "${expected}"`;
    document.body.innerHTML += `<p>Test ${i + 1}: ${msg}</p>`;
  });
});
