import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "destructive";
  children: ReactNode;
}

export const Alert = ({
  variant = "default",
  className,
  children,
  ...props
}: AlertProps) => {
  const variantClasses = {
    default: "bg-blue-100 text-blue-800 border-blue-200",
    destructive: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div
      className={cn(`border-l-4 p-4 ${variantClasses[variant]}`, className)}
      role="alert"
      {...props}
    >
      {children}
    </div>
  );
};

interface AlertComponentProps extends React.HTMLAttributes<HTMLElement> {
  children?: ReactNode;
}

export const AlertDescription = ({
  className,
  children,
  ...props
}: AlertComponentProps) => {
  return (
    <p className={cn("mt-2", className)} {...props}>
      {children}
    </p>
  );
};

export const AlertTitle = ({
  className,
  children,
  ...props
}: AlertComponentProps) => {
  return (
    <h4 className={cn("font-bold", className)} {...props}>
      {children}
    </h4>
  );
};

export const AlertCircle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("inline-block h-4 w-4 rounded-full bg-current", className)}
      {...props}
    />
  );
};
