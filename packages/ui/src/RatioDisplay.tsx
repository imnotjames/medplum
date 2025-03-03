import { Ratio } from '@medplum/fhirtypes';
import React from 'react';
import { QuantityDisplay } from './QuantityDisplay';

export interface RatioDisplayProps {
  value?: Ratio;
}

export function RatioDisplay(props: RatioDisplayProps): JSX.Element | null {
  const value = props.value;
  if (!value) {
    return null;
  }

  return (
    <span>
      <QuantityDisplay value={value.numerator} />
      &nbsp;/&nbsp;
      <QuantityDisplay value={value.denominator} />
    </span>
  );
}
