(function() {
  'use strict';

  // Debounce function to limit how often relayout can run
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), delay);
    };
  };

  const relayout = () => {
    const grids = document.querySelectorAll('.masonry-grid');
    
    grids.forEach(grid => {
      const items = grid.querySelectorAll('.masonry-item, .masonry-item2');

      items.forEach(item => {
        item.style.gridRowEnd = 'auto';
        
        const img = item.querySelector('img');
        if (!img) return;

        const contentHeight = img.getBoundingClientRect().height;
        const verticalGap = parseInt(window.getComputedStyle(item).marginBottom);
        const rowSpan = Math.ceil(contentHeight + verticalGap);
        
        item.style.gridRowEnd = `span ${rowSpan}`;
      });
    });
  };

  // Wrapped relayout to prevent CPU spikes
  const debouncedRelayout = debounce(relayout, 100);

  const handleImages = () => {
    const images = document.querySelectorAll('.masonry-grid img');
    images.forEach(img => {
      if (img.complete) {
        relayout();
      } else {
        img.addEventListener('load', relayout);
        img.addEventListener('error', relayout);
      }
    });
  };

  // Use the debounced version for the resize event
  window.addEventListener('resize', debouncedRelayout);
  
  if (window.ResizeObserver) {
    // ResizeObserver also triggers frequently, so we use debounce here as well
    const ro = new ResizeObserver(debouncedRelayout);
    document.querySelectorAll('.masonry-grid').forEach(grid => ro.observe(grid));
  }

  handleImages();
  relayout();
})();