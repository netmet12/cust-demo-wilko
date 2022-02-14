import { motion } from 'framer-motion';
import React from 'react';

// Import config framer Motion
import { listItem } from '../../config/config';

// SALES CARD
const NikeCard = ({ hit }) => {
  return (
    <motion.li
      variants={listItem}
      initial="hidden"
      animate="show"
      className="image-wrapper-sales"
      style={{
        backgroundImage: `url(${hit.image.desktop_url})`,
        backgroundSize: 'cover',
      }}
    >
      <div className="image-wrapper-sales__infos">
        <p>{hit.coupon}</p>
        <h3>{hit.title}</h3>
      </div>
    </motion.li>
  );
};

export default NikeCard;
