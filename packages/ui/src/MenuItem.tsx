import React from 'react';
import './MenuItem.css';

interface MenuItemProps {
  onClick: () => void;
  children: React.ReactNode;
}

export function MenuItem(props: MenuItemProps): JSX.Element {
  return (
    <div className="medplum-menu-item" onClick={() => props.onClick()}>
      {props.children}
    </div>
  );
}
