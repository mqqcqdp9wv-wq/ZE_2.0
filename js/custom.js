// Custom JavaScript for ZE-Studio

// Progress bars animation on scroll (repeatable)
document.addEventListener('DOMContentLoaded', function() {
  
  // Animate progress bars when they come into view
  const progressBars = document.querySelectorAll('.progress-bar[data-aos="width"]');
  
  // Use Intersection Observer to detect when progress bars are visible
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const progressBar = entry.target;
      const targetWidth = progressBar.getAttribute('aria-valuenow') + '%';
      
      if (entry.isIntersecting) {
        // Animate to full width when visible
        setTimeout(() => {
          progressBar.style.width = targetWidth;
          progressBar.classList.add('animated');
        }, 200);
      } else {
        // Reset to 0 when out of view (for re-animation)
        progressBar.style.width = '0%';
        progressBar.classList.remove('animated');
      }
    });
  }, {
    threshold: 0.3 // Trigger when 30% of element is visible
  });
  
  // Observe all progress bars
  progressBars.forEach(bar => {
    // Set initial width to 0
    bar.style.width = '0%';
    observer.observe(bar);
  });
  
});
