const Button = ({
  onClick,
  button_icon,
  button_name,
  bgColor,
  textColor,
  paddingX,
  paddingY,
  type = "button", 
  disabled = false,
}) => {
  const bgClass = bgColor ? `${bgColor}` : "bg-darkest-blue";
  const textClass = textColor ? `${textColor}` : "text-white";
  const paddingXClass = paddingX ? `${paddingX}` : "px-4";
  const paddingYClass = paddingY ? `${paddingY}` : "py-2";
  
  return (
    <button
      type={type}               
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer w-fit text-sm flex items-center rounded-lg gap-2 ${bgClass} ${textClass} ${paddingXClass} ${paddingYClass} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {button_icon}
      {button_name}
    </button>
  );
};

export default Button;
