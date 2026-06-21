const Button = ({ children, variant = "primary", size = "md", ...props }) => {
  const baseStyles = "font-bold rounded focus:outline-none focus:shadow-outline"
  const variantStyles = {
    primary: "bg-teal-500 hover:bg-teal-700 text-white",
    secondary: "bg-gray-300 hover:bg-gray-400 text-gray-800",
  }
  const sizeStyles = {
    sm: "py-2 px-3 text-xs", // Increased padding for better touch targets
    md: "py-3 px-4 text-sm", // Increased padding for better touch targets
    lg: "py-4 px-6 text-lg", // Increased padding for better touch targets
  }

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} min-h-[40px] min-w-[80px]`} // Added minimum height and width
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
