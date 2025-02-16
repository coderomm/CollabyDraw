"use client";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  label?: string;
  loading?: boolean;
  loadingLabel?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = (
  {
    label,
    loading = false,
    loadingLabel,
    icon,
    className = "",
    children,
    variant = "primary",
    size = "default",
    ...props
  }: ButtonProps) => {

  const variants = {
    primary: "bg-primary hover:bg-primary-hover text-primary-btn-text focus:primary",
    secondary: "bg-secondary hover:bg-secondary-hover text-secondary-btn-text focus:secondary",
    outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
    ghost: "hover:bg-accent hover:text-accent-foreground",
    link: "text-primary underline-offset-4 hover:underline",
  };

  const buttonsSizes = {
    default: "h-9 px-4 py-2",
    sm: "h-8 rounded-md px-3 text-xs",
    lg: "h-10 rounded-md px-8",
    icon: "h-9 w-9",
  };

  const loadingStyles = {
    base: "cursor-not-allowed",
    primary: "bg-gray-400 text-gray-700",
    secondary: "bg-gray-300 text-gray-500 border-gray-300",
    outline: "cursor-not-allowed",
    ghost: "cursor-not-allowed",
    link: "cursor-not-allowed",
  };
  return (
    <button
      disabled={loading || props.disabled}
      className={`flex items-center justify-center text-base font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition duration-200 ${buttonsSizes[size]} ${loading || props.disabled ? loadingStyles[variant] : variants[variant]} ${loading ? loadingStyles.base : ""} ${className}`} {...props}>
      {loading ? (
        <span>{loadingLabel ? loadingLabel : 'Loading...'}</span>
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {label || children}
        </>
      )}
    </button>
  );
};
