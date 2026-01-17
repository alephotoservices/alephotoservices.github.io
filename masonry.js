// masonry.js — optimized to prevent layout thrashing
(function(){
  'use strict';

  function raf(cb){ return (window.requestAnimationFrame || function(fn){ return setTimeout(fn,16); })(cb); }

  function debounce(func, wait){
    let t = null;
    return function(){
      const ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function(){ func.apply(ctx, args); }, wait);
    };
  }

  function init(){
    const grids = Array.from(document.querySelectorAll('.masonry-grid'));
    if(!grids.length) return;

    // cache computed values per grid
    const gridMeta = grids.map(grid => ({
      grid,
      // Cache the items list to avoid querySelectorAll on every relayout
      items: Array.from(grid.querySelectorAll('.masonry-item, .masonry-item2')), 
      rowHeight: parseFloat(getComputedStyle(grid).getPropertyValue('grid-auto-rows')) || 8,
      rowGap: parseFloat(getComputedStyle(grid).getPropertyValue('gap')) || 8
    }));

    // Moving measurement inside relayout to catch CSS media query changes
    function relayout(){
      gridMeta.forEach(({grid, items}) => {
        const styles = getComputedStyle(grid);
        const rowHeight = parseFloat(styles.getPropertyValue('grid-auto-rows')) || 8;
        const rowGap = parseFloat(styles.getPropertyValue('gap')) || 8;

        const updates = items.map(item => {
          const h = item.firstElementChild.getBoundingClientRect().height;
          const span = Math.ceil((h + rowGap) / (rowHeight + rowGap));
          return { item, span };
        });

        updates.forEach(data => {
          if(data) data.item.style.gridRowEnd = 'span ' + data.span;
        });
      });
    }

    const debouncedRelayout = debounce(()=>raf(relayout), 100);

    if(window.ResizeObserver){
      const obs = new ResizeObserver(debouncedRelayout);
      gridMeta.forEach(m => obs.observe(m.grid));
    } else {
      window.addEventListener('resize', debouncedRelayout);
    }

    const imgs = document.querySelectorAll('.masonry-grid img');
    imgs.forEach(img => {
      // Use 'once' to automatically remove the listener after firing
      if(img.complete){ debouncedRelayout(); }
      else img.addEventListener('load', debouncedRelayout, {passive:true, once:true});
    });

    debouncedRelayout();
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();