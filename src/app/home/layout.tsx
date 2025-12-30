import { HomeProvider } from "../_provider/homeProvider";

const HomePageLayout = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  <HomeProvider>{children}</HomeProvider>;
};

export default HomePageLayout;
