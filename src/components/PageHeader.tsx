import React from 'react';
import { useTranslation } from 'react-i18next';

interface PageHeaderProps {
  title: string;
  description: string;
  backgroundImage: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, backgroundImage }) => {
  const { t } = useTranslation();
  
  return (
    <section className="relative h-[50vh] bg-black">
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 z-10"></div>
      <img 
        src={backgroundImage} 
        alt={t(title)} 
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="relative z-20 container mx-auto px-4 h-full flex flex-col justify-center">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{t(title)}</h1>
          <p className="text-xl text-gray-200">{t(description)}</p>
        </div>
      </div>
    </section>
  );
};

export default PageHeader;