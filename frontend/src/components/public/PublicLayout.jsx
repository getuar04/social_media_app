import { Outlet } from "react-router-dom";
import Navbar from "../Navbar"; 

export default function PublicLayout() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Outlet />
      </main>
    </>
  );
}
