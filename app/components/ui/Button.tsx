import React from "react";

type ButtonProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClick: () => void;
  className?: string;
};

function Button({ children, icon, onClick, className }: ButtonProps) {
  return (
    <>
      <button onClick={onClick} className={className}>
        {icon}
        {children}
      </button>
    </>
  );
}

export default Button;
