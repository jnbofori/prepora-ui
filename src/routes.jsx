import {
  HomeIcon,
  ServerStackIcon,
  RectangleStackIcon,
  InformationCircleIcon,
  BookOpenIcon,
} from "@heroicons/react/24/solid";
import { Home, RecipeManagement } from "@/pages/dashboard";
import { SignIn, SignUp, EmailConfirmation } from "@/pages/auth";
const icon = {
  className: "w-5 h-5 text-inherit",
};

export const routes = [
  {
    layout: "dashboard",
    pages: [
      {
        icon: <HomeIcon {...icon} />,
        name: "dashboard",
        path: "/home",
        element: <Home />,
      },
      // {
      //   icon: <UserCircleIcon {...icon} />,
      //   name: "profile",
      //   path: "/profile",
      //   element: <Profile />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "tables",
      //   path: "/tables",
      //   element: <Tables />,
      // },
      // {
      //   icon: <InformationCircleIcon {...icon} />,
      //   name: "notifications",
      //   path: "/notifications",
      //   element: <Notifications />,
      // },
      // {
      //   icon: <TableCellsIcon {...icon} />,
      //   name: "forms",
      //   path: "/forms",
      //   element: <Forms />,
      // },
      {
        icon: <BookOpenIcon {...icon} />,
        name: "recipes",
        path: "/recipes",
        element: <RecipeManagement />,
      },
    ],
  },
  {
    title: "auth pages",
    layout: "auth",
    pages: [
      {
        icon: <ServerStackIcon {...icon} />,
        name: "sign in",
        path: "/sign-in",
        element: <SignIn />,
      },
      {
        icon: <RectangleStackIcon {...icon} />,
        name: "sign up",
        path: "/sign-up",
        element: <SignUp />,
      },
      {
        icon: <InformationCircleIcon {...icon} />,
        name: "email confirmation",
        path: "/email-confirmation",
        element: <EmailConfirmation />,
      },
    ],
  },
];

export default routes;
