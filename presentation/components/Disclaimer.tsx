import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const Disclaimer: React.FC = () => {
  const { language } = useLanguage();

  const content = {
    title: language === 'tr' ? 'Yasal ve Tıbbi Uyarı' : 'Legal and Medical Disclaimer',
    text: language === 'tr'
      ? 'DentaVision AI, yalnızca eğitim ve destek amaçlı tasarlanmış bir Klinik Karar Destek Sistemidir (CDSS). Teşhisler, tedavi planları ve risk değerlendirmeleri dahil olmak üzere tüm çıktılar, lisanslı bir diş hekimi tarafından doğrulanmalıdır. Bu sistem, klinik yargının veya doğrudan hasta muayenesinin yerini almaz.'
      : 'DentaVision AI is a Clinical Decision Support System (CDSS) designed for educational and support purposes only. All outputs, including diagnoses, treatment plans, and risk assessments, must be verified by a licensed dentist. This system does not replace clinical judgment or direct patient examination.'
  };

  return (
    <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-3">
      <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
      <div className="text-sm text-amber-800">
        <p className="font-semibold">{content.title}</p>
        <p>{content.text}</p>
      </div>
    </div>
  );
};

export default Disclaimer;