// UrbanNest Global Scripts

// Format Currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

// ROI Calculator Logic
function calculateROI() {
    // Check if elements exist (only on detail page)
    const rentInput = document.getElementById('rentRange');
    if (!rentInput) return;

    // Use dynamic price if available, otherwise default to 45000000
    const propertyPrice = window.currentPropertyPrice || 45000000;

    const monthlyRent = parseFloat(document.getElementById('rentRange').value);
    const appreciationRate = parseFloat(document.getElementById('appreciationRange').value);
    const years = parseFloat(document.getElementById('yearsRange').value);

    // Update Labels
    document.getElementById('rentValue').innerText = formatCurrency(monthlyRent);
    document.getElementById('appreciationValue').innerText = appreciationRate + '%';
    document.getElementById('yearsValue').innerText = years + ' Yrs';

    // Calculations
    // 1. Total Rental Income (Simple calculation: rent * 12 * years)
    // In reality, rent increases yearly, but we'll keep it simple or add a 5% yearly hike
    let totalRent = 0;
    let currentRent = monthlyRent;
    for (let i = 0; i < years; i++) {
        totalRent += (currentRent * 12);
        currentRent = currentRent * 1.05; // 5% yearly rent increase
    }

    // 2. Appreciation Gain
    // FV = PV * (1 + r)^n
    const futureValue = propertyPrice * Math.pow((1 + appreciationRate / 100), years);
    const appreciationGain = futureValue - propertyPrice;

    // 3. Total Return
    const totalReturn = totalRent + appreciationGain;

    // 4. Yield (First year rental yield)
    const yield = ((monthlyRent * 12) / propertyPrice) * 100;

    // Update DOM
    document.getElementById('totalReturn').innerText = formatCurrency(totalReturn);
    document.getElementById('yieldValue').innerText = yield.toFixed(2) + '%';

    // Color code yield
    const yieldEl = document.getElementById('yieldValue');
    if (yield > 4) yieldEl.style.color = '#10B981'; // Good
    else if (yield > 2) yieldEl.style.color = '#F59E0B'; // Average
    else yieldEl.style.color = '#EF4444'; // Low
}

// Navbar Scroll Effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 4px 6px -1px rgb(0 0 0 / 0.1)';
    } else {
        header.style.boxShadow = 'none';
        header.style.borderBottom = '1px solid var(--border)';
    }
});

// Search Tabs functionality
const tabs = document.querySelectorAll('.search-tab');
tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
    });
});

// Authentication Logic
async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    if (!emailInput || !passwordInput) return;

    const email = emailInput.value;
    const password = passwordInput.value;

    if (email && password) {
        try {
            const response = await fetch('http://localhost:5000/api/users/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('urbanNestUser', JSON.stringify(data));
                alert('Login Successful!');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error logging in:', error);
            alert('An error occurred during login. Please try again.');
        }
    } else {
        alert('Please fill in all fields');
    }
}

async function handleSignup(e) {
    e.preventDefault();
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirm-password');

    if (!nameInput || !emailInput || !passwordInput || !confirmInput) return;

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmInput.value;

    if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
    }

    if (name && email && password) {
        try {
            const response = await fetch('http://localhost:5000/api/users/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: name, email, password })
            });

            const data = await response.json();

            if (response.ok) {
                localStorage.setItem('urbanNestUser', JSON.stringify(data));
                alert('Account Created Successfully!');
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Signup failed');
            }
        } catch (error) {
            console.error('Error signing up:', error);
            alert('An error occurred during signup. Please try again.');
        }
    } else {
        alert('Please fill in all fields');
    }
}

function logout() {
    localStorage.removeItem('urbanNestUser');
    window.location.href = 'index.html';
}

function updateAuthUI() {
    const user = JSON.parse(localStorage.getItem('urbanNestUser'));
    const currentPage = window.location.pathname.split('/').pop();

    // Redirect if already logged in and on auth pages
    if (user && (currentPage === 'login.html' || currentPage === 'signup.html')) {
        window.location.href = 'index.html';
        return;
    }

    // Try to find the Login button in header. 
    // In index.html it is .btn-ghost containing "Login"
    // In other pages it might be similar.
    // We look for a link with text "Login" inside the header
    const headerParams = document.querySelector('header');
    if (!headerParams) return;

    const loginBtn = Array.from(headerParams.querySelectorAll('a')).find(a => a.textContent.trim() === 'Login');

    if (loginBtn && user) {
        loginBtn.innerHTML = `<i class="fa-solid fa-user-circle"></i> ${user.name}`;
        loginBtn.href = "#";
        // Remove class that might look like a button if we want it to look more like a profile link, 
        // or keep it but change behavior
        loginBtn.onclick = (e) => {
            e.preventDefault();
            const confirmLogout = confirm(`Logged in as ${user.name}. Do you want to logout?`);
            if (confirmLogout) logout();
        };
    }
}

// Run UI update on load
document.addEventListener('DOMContentLoaded', updateAuthUI);

// Property Form Logic
async function handlePostProperty(e) {
    e.preventDefault();

    const user = JSON.parse(localStorage.getItem('urbanNestUser'));
    if (!user || !user.token) {
        alert('Please login first to post a property.');
        window.location.href = 'login.html';
        return;
    }

    const title = document.getElementById('propTitle')?.value;
    const type = document.getElementById('propType')?.value;
    const location = document.getElementById('propLocation')?.value;
    const description = document.getElementById('propDescription')?.value;
    const bhk = document.getElementById('propBhk')?.value;
    const price = document.getElementById('propPrice')?.value;

    if (!title || !type || !location || !description || !price) {
        alert('Please fill out all required fields');
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/properties', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                title, type, location, description,
                bhk: parseInt(bhk) || null,
                price: parseFloat(price)
            })
        });

        const data = await response.json();

        if (response.ok) {
            alert('Property Posted Successfully!');
            window.location.href = 'index.html';
        } else {
            alert(data.message || 'Error posting property');
        }
    } catch (error) {
        console.error('Error posting property:', error);
        alert('Server unreachable or error occurred.');
    }
}

// AI Feature Stub -> Now Real
async function generateAIDescription() {
    const title = document.getElementById('propTitle')?.value || '';
    const type = document.getElementById('propType')?.value || '';
    const location = document.getElementById('propLocation')?.value || '';
    const bhk = document.getElementById('propBhk')?.value || '';
    const descBox = document.getElementById('propDescription');

    if (!descBox) return;

    // Visual Flair: Show loading state
    descBox.value = "AI is thinking...";
    descBox.style.transition = 'all 0.3s ease';
    descBox.style.boxShadow = '0 0 15px rgba(168, 85, 247, 0.6)';

    try {
        const response = await fetch('http://localhost:5000/api/ai/generate-description', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, type, location, bhk })
        });

        const data = await response.json();

        if (response.ok) {
            descBox.value = data.description;
        } else {
            descBox.value = "Fallback: " + `Discover this stunning ${type} spanning across ${location}. Featuring phenomenal architectural nuances with modern amenities, "${title}" offers unparalleled residential comfort. Ready to move in and perfect for those seeking premium living spaces!`;
        }
    } catch (err) {
        console.error("AI Error:", err);
        descBox.value = `Discover this stunning ${type} spanning across ${location}. Featuring phenomenal architectural nuances with modern amenities, "${title}" offers unparalleled residential comfort.`;
    }

    setTimeout(() => {
        descBox.style.boxShadow = 'none';
    }, 1500);
}

// Fetch and Display Properties
async function loadProperties() {
    const grid = document.getElementById('main-listing-grid');
    if (!grid) return;

    try {
        const response = await fetch('http://localhost:5000/api/properties');
        if (!response.ok) throw new Error('Failed to fetch properties');

        const properties = await response.json();

        if (properties.length === 0) {
            grid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">No properties found. Be the first to post!</p>';
            return;
        }

        grid.innerHTML = properties.map(property => `
            <div class="card">
                <div class="card-image" style="background-color: #cbd5e1; display: flex; align-items: center; justify-content: center;">
                    <i class="fa-solid fa-image fa-3x text-muted"></i>
                    ${property.images && property.images.length > 0 ? `<img src="${property.images[0]}" style="width:100%; height:100%; object-fit: cover; position: absolute; top:0; left:0;">` : ''}
                    <div class="card-badges">
                        <span class="badge badge-primary" style="background: rgba(0,0,0,0.6); color: white; backdrop-filter: blur(4px);">${property.type}</span>
                    </div>
                </div>
                <div class="card-content">
                    <div class="card-price">₹${property.price.toLocaleString('en-IN')}</div>
                    <h3 class="card-title">${property.title}</h3>
                    <div class="card-location">
                        <i class="fa-solid fa-location-dot" style="margin-right: 0.5rem;"></i> ${property.location}
                    </div>
                    <div class="card-features">
                        ${property.bhk ? `<div class="feature-item"><i class="fa-solid fa-bed"></i> ${property.bhk} BHK</div>` : ''}
                        <div class="feature-item"><i class="fa-solid fa-check"></i> ${property.isAvailable ? 'Available' : 'Sold'}</div>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px dashed var(--border); display: flex; gap: 0.5rem;">
                        <a href="property-detail.html?id=${property._id}" class="btn btn-primary" style="width: 100%;">View Details</a>
                    </div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        console.error('Error fetching properties:', error);
        // We will fallback to the existing HTML if the backend fails (so the site doesn't look instantly broken)
        // grid.innerHTML = '<p class="text-muted" style="grid-column: 1 / -1; text-align: center;">Error loading properties. Make sure backend is running.</p>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadProperties();
    if (window.location.pathname.includes('property-detail.html')) {
        loadPropertyDetails();
    }
});

// Load Single Property
async function loadPropertyDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const propertyId = urlParams.get('id');

    if (!propertyId) return; // For static placeholder viewing

    try {
        const response = await fetch(`http://localhost:5000/api/properties/${propertyId}`);
        if (!response.ok) throw new Error('Failed to fetch property details');

        const property = await response.json();

        const titleEl = document.getElementById('pd-title');
        if (titleEl) titleEl.innerText = property.title;

        const locationEl = document.getElementById('pd-location');
        if (locationEl) locationEl.innerHTML = `<i class="fa-solid fa-location-dot text-accent"></i> ${property.location}`;

        const bedsEl = document.getElementById('pd-beds');
        if (bedsEl && property.bhk) bedsEl.innerHTML = `<i class="fa-solid fa-bed text-accent"></i> ${property.bhk} BHK`;

        const priceEl = document.getElementById('pd-price');
        if (priceEl) priceEl.innerText = formatCurrency(property.price);

        const descEl = document.getElementById('pd-desc');
        if (descEl) descEl.innerText = property.description;

        // Optionally set a global variable for ROI calculation
        window.currentPropertyPrice = property.price;
        // Recalculate ROI with exact price
        calculateROI();

        // Update Map dynamically
        const iframeMatch = document.querySelector('iframe');
        if (iframeMatch && property.location) {
            // safely encode the property location for the google maps embed URL
            const mapQuery = encodeURIComponent(property.location + " (UrbanNest Listing)");
            iframeMatch.src = `https://maps.google.com/maps?width=100%25&height=600&hl=en&q=${mapQuery}&t=&z=14&ie=UTF8&iwloc=B&output=embed`;
        }

    } catch (error) {
        console.error('Error fetching property data:', error);
    }
}
