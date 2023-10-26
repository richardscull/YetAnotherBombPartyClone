export default function getUserColorAndBadge(
  userType: "default" | "host" | "developer" 
) {
  let userColor;
  let userBadge;
  switch (userType) {
    case "default":
      userColor = "text-gray-600";
      break;
    case "host":
      userColor = "text-yellow-600";
      userBadge = "👑";
      break;
    case "developer":
      userColor = "text-amber-900";
      userBadge = "🛠️";
      break;
    default:
      userColor = "text-black";
      break;
  }

  return { userColor, userBadge };
}
