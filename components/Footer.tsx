import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full text-center py-8 px-4 text-xs text-slate-500 mt-auto no-print md:hidden">
      <p>© 2025 Malcolm Kingley. All Rights Reserved.</p>
      <p className="mt-1">KINGLEY FOUNDATION 508(c)(1)(a) Private Church Organization.</p>
      <p className="mt-2">Unauthorized reproduction, distribution, or derivative use of this content is strictly prohibited.</p>
      <p className="mt-1">Educational and spiritual content provided for private members only; not medical, legal, or financial advice.</p>
    </footer>
  );
};

export default Footer;