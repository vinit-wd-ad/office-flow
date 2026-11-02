import { useState } from "react";

export default function Input({
  type = "text",
  name,
  id,
  className = "",
  onChange,
  placeholder,
  required = false,
  isSubmitting = false,
  value = "", 
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isError = required && isSubmitting && !value;

  const commonClass = `p-2 border w-full rounded my-1 outline-blue-300 ${isError ? "border-red-500" : "border-gray-300"
    } ${className}`;

  if (type === "password") {
    return (
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`${commonClass} pr-16`}
        />

        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-sm"
        >
          {showPassword ? "Hide" : "Show"}
        </button>
      </div>
    );
  }

  return (
    <input
      type={type}
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={commonClass}
    />
  );
}