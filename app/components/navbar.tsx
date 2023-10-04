import { NavLink, useLocation } from "@remix-run/react";

const Navbar = () => {
  const location = useLocation();
  return (
    <div className="navbar bg-base-100">
      <div className="navbar-start">
        <a className="btn btn-ghost normal-case text-xl">
          Balaji Customer Details
        </a>
      </div>
      <div className="navbar-end">
        {location.pathname === "/" ? (
          <NavLink className="btn btn-accent" to="/customerDetails">
            Customer Details
          </NavLink>
        ) : (
          <NavLink className="btn btn-accent" to="/">
            Customer Form
          </NavLink>
        )}
      </div>
    </div>
  );
};

export default Navbar;
