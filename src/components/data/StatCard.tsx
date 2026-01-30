import React from 'react';
import { Card } from '@/components/ui/card';

export type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'gray';
};

const variantToClass: Record<NonNullable<StatCardProps['variant']>, string> = {
  primary: 'border-primary/30',
  secondary: 'border-secondary/30',
  gray: 'border-muted',
};

export function StatCard(props: StatCardProps) {
  const { label, value, hint, icon, variant = 'gray' } = props;
  return (
    <Card className={`p-4 flex items-center gap-3 ${variantToClass[variant]}`}>
      {icon ? <div className="text-xl">{icon}</div> : null}
      <div className="flex flex-col">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-xl font-semibold leading-none">{value}</div>
        {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
      </div>
    </Card>
  );
}

export default StatCard;


