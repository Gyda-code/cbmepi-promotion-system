
import React from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/Layout/AppLayout';
import MilitaryList from '@/components/military/MilitaryList';

const MilitaryListPage = () => {
  const { divisionCode } = useParams<{ divisionCode: string }>();
  
  return (
    <AppLayout>
      <MilitaryList divisionCode={divisionCode || ''} />
    </AppLayout>
  );
};

export default MilitaryListPage;
