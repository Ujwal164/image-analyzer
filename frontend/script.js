// Handle choose button
document.getElementById('chooseBtn').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// Handle file input change
document.getElementById('fileInput').addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        alert(`📁 File "${file.name}" selected. Ready to analyze!`);
    }
});

// Handle analyze button
document.getElementById('analyzeBtn').addEventListener('click', async () => {
    const fileInput = document.getElementById('fileInput');
    const file = fileInput.files[0];

    if (!file) {
        alert('⚠️ Please choose an image first!');
        return;
    }

    alert('⏳ Analyzing image...');

    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await fetch('http://localhost:5000/analyze', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error(`Server responded with status ${response.status}`);
        }

        const data = await response.json();

        const labels = data.labels?.map(l => l.Name).join(', ') || 'None';
        const facesCount = data.faces?.length ?? 0;
        const text = data.text?.map(t => t.DetectedText).join(', ') || 'None';

        const resultMsg = `
✅ Analysis Complete!

📦 Labels: ${labels}
🙂 Faces Detected: ${facesCount}
📝 Text Found: ${text}
        `.trim();

        alert(resultMsg);
        console.log('🧠 Full Analysis Data:', data);

    } catch (err) {
        console.error('❌ Error:', err);
        alert('❌ Error analyzing image. Please try again or check console.');
    }
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Scroll reveal animations
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in, .slide-up, .scale-up').forEach(el => {
    observer.observe(el);
});
