import c from "classnames";
import s from "./index.module.less";
// import Earth3D from "@/components/Earth";
import Earth3D from "@zlicom/gt-earth";

const Home = () => {
  return (
    <div className={c(s.home, "relative fbv fbac fbjc")}>
      <Earth3D />
    </div>
  );
};

export default Home;
