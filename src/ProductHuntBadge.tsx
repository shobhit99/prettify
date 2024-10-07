import React from 'react';

const ProductHuntBadge: React.FC = () => {
  return (
    <a href="https://www.producthunt.com/posts/prettify?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-prettify" target="_blank">
      <img 
        src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=494711&theme=light" 
        alt="Prettify - Create&#0032;beautiful&#0032;screenshots&#0032;instantly&#0032;for&#0032;free | Product Hunt" 
        style={{width: '190px', height: '54px'}}
        width="190" 
        height="54" 
      />
    </a>
  );
};

export default ProductHuntBadge;