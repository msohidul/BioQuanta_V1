/* ====================================================================
   BioQuanta Client-Side Controller (app.js)
   ==================================================================== */

// --------------------------------------------------------------------
// 1. Supabase Database Configuration
// Paste your Supabase project credentials below to enable live writes!
// --------------------------------------------------------------------
const SUPABASE_URL = ""; // e.g., "https://xyzabc123.supabase.co"
const SUPABASE_ANON_KEY = ""; // e.g., "eyJhbGciOi..."

// --------------------------------------------------------------------
// 2. Interactive Navigation Scroll Behavior
// --------------------------------------------------------------------
const navbar = document.getElementById('navbar');
const navLinks = document.querySelectorAll('.nav-links a');
const sections = document.querySelectorAll('section, header');

window.addEventListener('scroll', () => {
    // Add scrolled class for glassmorphic visual transition
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }

    // Scroll spy: Update active navigation links
    let currentId = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentId = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
            link.classList.add('active');
        }
    });
});

// --------------------------------------------------------------------
// 3. Technical Specs Tab Switcher
// --------------------------------------------------------------------
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');

        // Remove active state from all buttons and panels
        tabButtons.forEach(btn => btn.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));

        // Activate matching button and panel
        button.classList.add('active');
        const targetPanel = document.getElementById(targetTab);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
    });
});

// --------------------------------------------------------------------
// 4. Contact Form Handler & DB Sync
// --------------------------------------------------------------------
const inquiryForm = document.getElementById('inquiryForm');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');

inquiryForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Collect form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        organization: document.getElementById('organization').value.trim() || null,
        lab_interest: document.getElementById('labInterest').value,
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
        status: 'new'
    };

    // UI Feedback: Entering submission state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Transmitting...';
    statusMessage.textContent = '';
    statusMessage.className = 'status-message';

    try {
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            // Live Mode: Direct post to Supabase PostgreSQL table
            const response = await fetch(`${SUPABASE_URL}/rest/v1/inquiries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SUPABASE_ANON_KEY,
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Database transaction failed.');
            }

            // Success feedback
            showFeedback(true, 'Inquiry successfully saved to database. Corresponding team members notified!');
            inquiryForm.reset();
        } else {
            // Demo Mode: Mock database response with artificial latency
            console.log('BioQuanta in Demonstration Mode. Submitted payload:', formData);
            
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
            
            showFeedback(true, 'Demo Mode: Form validated successfully! (Configure Supabase keys in app.js for live writes)');
            inquiryForm.reset();
        }
    } catch (error) {
        console.error('Submission error:', error);
        showFeedback(false, `Error: ${error.message || 'Failed to connect to database services.'}`);
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Inquiry';
    }
});

function showFeedback(isSuccess, message) {
    statusMessage.textContent = message;
    if (isSuccess) {
        statusMessage.classList.add('success');
    } else {
        statusMessage.classList.add('error');
    }
}
