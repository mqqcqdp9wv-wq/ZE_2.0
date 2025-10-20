// Custom JavaScript for ZE-Studio

// Progress bars animation on scroll
document.addEventListener('DOMContentLoaded', function() {
  
  // Animate progress bars when they come into view
  const progressBars = document.querySelectorAll('.progress-bar[data-aos="width"]');
  
  // Use Intersection Observer to detect when progress bars are visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const progressBar = entry.target;
        const targetWidth = progressBar.getAttribute('aria-valuenow') + '%';
        
        // Delay animation slightly for better effect
        setTimeout(() => {
          progressBar.style.width = targetWidth;
          progressBar.classList.add('animated');
        }, 200);
        
        // Unobserve after animation
        observer.unobserve(progressBar);
      }
    });
  }, {
    threshold: 0.5 // Trigger when 50% of element is visible
  });
  
  // Observe all progress bars
  progressBars.forEach(bar => {
    // Set initial width to 0
    bar.style.width = '0%';
    observer.observe(bar);
  });
  
});
