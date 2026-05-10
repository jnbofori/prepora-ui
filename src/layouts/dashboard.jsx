import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;

  const location = useLocation()
  let navigate = useNavigate();
  const { state, getUser } = useAuth()

  useEffect(() => {
    async function fetchUser() {
      try {
        await getUser();
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (state.token === null) {
          navigate("/auth/sign-in", { state: { from: location }, replace: true });
        }
      }
    }
    fetchUser();
  }, []);

  // if (!state.isLoggedIn) {
  //   return <Navigate to='/auth/sign-in' state={{from: location}} />
  // }

  return (
    <div className="min-h-screen bg-blue-gray-50/50">
      <Sidenav
        routes={routes}
        brandName="Recipe Studio"
        brandImg={
          sidenavType === "dark" ? "/img/prepora-logo.png" : "/img/prepora-logo.png"
        }
      />
      <div className="p-4 xl:ml-80">
        <DashboardNavbar />
        <Configurator />
        <IconButton
          size="lg"
          color="white"
          className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
          ripple={false}
          onClick={() => setOpenConfigurator(dispatch, true)}
        >
          <Cog6ToothIcon className="h-5 w-5" />
        </IconButton>
        <Routes>
          {routes.map(
            ({ layout, pages }) =>
              layout === "dashboard" &&
              pages.map(({ path, element }) => (
                <Route exact path={path} element={element} />
              ))
          )}
        </Routes>
        <div className="text-blue-gray-600">
          <Footer />
        </div>
      </div>
    </div>
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
