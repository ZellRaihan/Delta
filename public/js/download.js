document.addEventListener('DOMContentLoaded', function() {
    // Get platform from URL parameter or default to 'windows'
    const urlParams = new URLSearchParams(window.location.search);
    const platform = urlParams.get('platform') || 'windows';
    
    // Load executor data
    loadExecutorData(platform);
    
    // Setup FAQ functionality
    setupFAQ();
    
    // Setup sidebar navigation
    setupSidebarNav();
    
    // Setup platform selector
    setupPlatformSelector(platform);
    
    // Setup event delegation for changelog buttons and refresh button
    document.addEventListener('click', function(e) {
        // Handle changelog button clicks
        if (e.target.classList.contains('version-changelog-btn') || 
            e.target.closest('.version-changelog-btn')) {
            
            const button = e.target.classList.contains('version-changelog-btn') ? 
                e.target : e.target.closest('.version-changelog-btn');
            
            const version = button.getAttribute('data-version');
            const changelogId = `changelog-${version.replace(/\./g, '-')}`;
            const changelog = document.getElementById(changelogId);
            
            if (changelog) {
                changelog.classList.toggle('active');
            }
        }
        
        // Handle refresh button click
        if (e.target.id === 'reload-data' || e.target.closest('#reload-data')) {
            // Clear the cache
            localStorage.removeItem('deltaExecutorData');
            localStorage.removeItem('deltaExecutorDataTimestamp');
            
            // Reload the data
            loadExecutorData(platform);
        }
    });
});

function setupSidebarNav() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
        });
    });
    
    // Handle scroll spy
    window.addEventListener('scroll', function() {
        const scrollPosition = window.scrollY;
        
        // Get all sections
        const sections = [
            document.getElementById('download-section'),
            document.getElementById('requirements-section'),
            document.getElementById('installation-section'),
            document.getElementById('versions-section'),
            document.getElementById('faq-section')
        ].filter(section => section !== null);
        
        // Find the current section
        let currentSection = sections[0];
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (scrollPosition >= sectionTop) {
                currentSection = section;
            }
        });
        
        if (currentSection) {
            const currentId = currentSection.getAttribute('id');
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to current nav item
            const currentNav = document.querySelector(`.nav-item[href="#${currentId}"]`);
            if (currentNav) {
                currentNav.classList.add('active');
            }
        }
    });
}

function setupPlatformSelector(currentPlatform) {
    const platformOptions = document.querySelectorAll('.platform-option');
    
    platformOptions.forEach(option => {
        const platform = option.classList.contains('windows') ? 'windows' : 
                         option.classList.contains('ios') ? 'ios' : 
                         option.classList.contains('android') ? 'android' : '';
        
        if (platform === currentPlatform) {
            option.classList.add('active');
        }
    });
}

async function loadExecutorData(platform) {
    try {
        // Show loading spinner
        document.getElementById('download-content').innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Loading ${platform.charAt(0).toUpperCase() + platform.slice(1)} download information...</p>
            </div>
        `;
        
        // Fetch the JSON data from GitHub
        let data;
        let usingCachedData = false;
        
        try {
            const response = await fetch('https://raw.githubusercontent.com/ZellRaihan/Delta-Executor-Files/refs/heads/main/executors.json');
            if (!response.ok) {
                throw new Error('Failed to load executor data from GitHub');
            }
            data = await response.json();
            
            // Cache the data in localStorage for offline fallback
            localStorage.setItem('deltaExecutorData', JSON.stringify(data));
            localStorage.setItem('deltaExecutorDataTimestamp', Date.now());
        } catch (fetchError) {
            console.warn('Failed to fetch from GitHub, trying cached data:', fetchError);
            
            // Try to use cached data if available
            const cachedData = localStorage.getItem('deltaExecutorData');
            const cachedTimestamp = localStorage.getItem('deltaExecutorDataTimestamp');
            
            if (cachedData && cachedTimestamp) {
                // Check if cache is less than 24 hours old
                const cacheAge = Date.now() - parseInt(cachedTimestamp);
                const maxCacheAge = 24 * 60 * 60 * 1000; // 24 hours
                
                if (cacheAge < maxCacheAge) {
                    data = JSON.parse(cachedData);
                    usingCachedData = true;
                    console.log('Using cached data from:', new Date(parseInt(cachedTimestamp)));
                } else {
                    console.warn('Cached data is too old:', new Date(parseInt(cachedTimestamp)));
                    throw new Error('Cached data is too old and GitHub fetch failed');
                }
            } else {
                throw new Error('No cached data available and GitHub fetch failed');
            }
        }
        
        // Get platform-specific data
        const platformData = data.delta.versions[platform];
        if (!platformData) {
            throw new Error(`No data available for ${platform}`);
        }
        
        // Render the download content
        renderDownloadContent(platform, platformData, usingCachedData);
    } catch (error) {
        console.error('Error loading data:', error);
        document.getElementById('download-content').innerHTML = `
            <div class="download-header-section">
                <div class="platform-icon"><i class="fas fa-exclamation-triangle"></i></div>
                <div class="download-title-wrapper">
                    <h1 class="download-title">Error Loading Data</h1>
                    <p class="download-subtitle">We couldn't load the download information. Please try again later or contact support.</p>
                </div>
            </div>
        `;
    }
}

function renderDownloadContent(platform, platformData, usingCachedData = false) {
    // Get platform icon
    let platformIcon = 'fa-windows';
    let platformName = 'Windows';
    
    if (platform === 'ios') {
        platformIcon = 'fa-apple';
        platformName = 'iOS';
    } else if (platform === 'android') {
        platformIcon = 'fa-android';
        platformName = 'Android';
    }
    
    // Create cached data notification if needed
    const cachedDataNotification = usingCachedData ? `
        <div class="cached-data-notice">
            <i class="fas fa-info-circle"></i>
            <span>You're viewing cached data from ${new Date(parseInt(localStorage.getItem('deltaExecutorDataTimestamp'))).toLocaleString()}.</span>
            <button id="reload-data" class="reload-button"><i class="fas fa-sync-alt"></i> Refresh</button>
        </div>
    ` : '';
    
    // Create download content HTML
    const downloadContent = `
        ${cachedDataNotification}
        <div id="download-section" class="download-section">
            <div class="download-header-section">
                <div class="platform-icon"><i class="fab ${platformIcon}"></i></div>
                <div class="download-title-wrapper">
                    <h1 class="download-title">Delta Executor for ${platformName}</h1>
                    <p class="download-subtitle">${platformData.description || 'The most powerful Roblox executor for ' + platformName}</p>
                </div>
            </div>
            
            <div class="download-info">
                <div class="download-details">
                    <ul class="details-list">
                        <li class="details-item">
                            <span class="details-label">Version</span>
                            <span class="details-value">${platformData.version}</span>
                        </li>
                        <li class="details-item">
                            <span class="details-label">Size</span>
                            <span class="details-value">${platformData.size}</span>
                        </li>
                        <li class="details-item">
                            <span class="details-label">Last Updated</span>
                            <span class="details-value">${platformData.lastUpdated}</span>
                        </li>
                        <li class="details-item">
                            <span class="details-label">Status</span>
                            <span class="details-value" style="color: #10b981;">Working</span>
                        </li>
                    </ul>
                </div>
                
                <div class="download-action">
                    <a href="${platformData.downloadUrl}" class="download-button">
                        <i class="fas fa-download"></i>
                        Download Now
                    </a>
                    <p class="download-note">By downloading, you agree to our Terms of Service and Privacy Policy.</p>
                </div>
            </div>
        </div>
        
        <div id="requirements-section" class="requirements-section">
            <h2 class="section-title"><i class="fas fa-laptop-code"></i> System Requirements</h2>
            <div class="requirements-list">
                ${renderRequirements(platformData.requirements)}
            </div>
        </div>
        
        <div id="installation-section" class="installation-section">
            <h2 class="section-title"><i class="fas fa-tools"></i> Installation Guide</h2>
            <div class="installation-steps">
                <ol class="step-list">
                    ${renderInstallationSteps(platformData.installSteps)}
                </ol>
            </div>
        </div>
        
        ${renderPreviousVersions(platformData.previousVersions)}
    `;
    
    // Update the content
    document.getElementById('download-content').innerHTML = downloadContent;
}

function renderRequirements(requirements) {
    // Convert the requirements object to an array of objects with name, value, and icon
    const reqArray = Object.entries(requirements).map(([name, value]) => {
        let icon = 'fa-check-circle';
        
        if (name === 'os') icon = 'fa-desktop';
        else if (name === 'ram') icon = 'fa-memory';
        else if (name === 'storage') icon = 'fa-hdd';
        else if (name === 'device') icon = 'fa-mobile-alt';
        
        return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            value: value,
            icon: icon
        };
    });
    
    return reqArray.map(req => `
        <div class="requirement-item">
            <div class="requirement-icon"><i class="fas ${req.icon}"></i></div>
            <div class="requirement-name">${req.name}</div>
            <div class="requirement-value">${req.value}</div>
        </div>
    `).join('');
}

function renderInstallationSteps(steps) {
    return steps.map(step => `
        <li class="step-item">${step}</li>
    `).join('');
}

function renderPreviousVersions(previousVersions) {
    if (!previousVersions || previousVersions.length === 0) {
        return ''; // Return empty string if no previous versions
    }
    
    const versionItems = previousVersions.map(version => `
        <div class="previous-version-item">
            <div class="version-info">
                <div class="version-name">${version.version}</div>
                <div class="version-date">${version.releaseDate}</div>
                <div class="version-size">${version.size}</div>
            </div>
            <div class="version-actions">
                <a href="${version.downloadUrl}" class="version-download-btn">
                    <i class="fas fa-download"></i> Download
                </a>
                ${version.changelog ? `
                <button class="version-changelog-btn" data-version="${version.version}">
                    <i class="fas fa-list"></i> Changelog
                </button>` : ''}
            </div>
            ${version.changelog ? `
            <div class="version-changelog" id="changelog-${version.version.replace(/\./g, '-')}">
                <h4>Changelog for ${version.version}</h4>
                <ul>
                    ${version.changelog.map(change => `<li>${change}</li>`).join('')}
                </ul>
            </div>` : ''}
        </div>
    `).join('');
    
    return `
        <div id="versions-section" class="previous-versions-section">
            <h2 class="section-title"><i class="fas fa-history"></i> Previous Versions</h2>
            <div class="previous-versions-list">
                ${versionItems}
            </div>
        </div>
    `;
}

function setupFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', () => {
            // Toggle active class
            item.classList.toggle('active');
            
            // Toggle answer visibility
            if (item.classList.contains('active')) {
                answer.style.maxHeight = answer.scrollHeight + 'px';
            } else {
                answer.style.maxHeight = 0;
            }
            
            // Close other FAQs
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                    otherItem.querySelector('.faq-answer').style.maxHeight = 0;
                }
            });
        });
    });
} 