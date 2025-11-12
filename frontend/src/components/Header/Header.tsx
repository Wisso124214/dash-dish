import { MenuAvatar } from "../MenuAvatar/MenuAvatar";
import { Link } from "react-router";
import Cart from "../Cart/Cart";
import { useAtomValue } from "jotai";
import { userAtom } from "../../lib/atoms";

export default function Header() {
  const user = useAtomValue(userAtom);

  return (
    <header className="w-full py-4 px-6 bg-(--foreground-absolute) fixed z-10 top-0 left-0 flex items-center justify-between ">
      <Link className="flex items-center cursor-pointer" to="/">
        <img
          src="/src/assets/logo-mini.png"
          alt="Dash Dish Logo"
          className="h-8 w-8 mr-6 scale-150"
        />
        <h1 className="text-2xl font-bold text-foreground">Dash Dish</h1>
      </Link>
      {user && (
      <div className="flex items-center gap-3">
        
        <Cart />
        <MenuAvatar />
      </div>
      )}
    </header>
  );
}
