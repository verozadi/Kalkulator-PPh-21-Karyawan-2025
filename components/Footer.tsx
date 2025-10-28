
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="mt-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} VerozTax PPh 21 Calculator.</p>
    </footer>
  );
};

export default Footer;
