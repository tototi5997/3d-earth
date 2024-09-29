import { useEffect, useState } from "react";
import { Tween } from "@tweenjs/tween.js";

const TestTween = () => {
  const [count, setCount] = useState<number>();

  useEffect(() => {
    const tween = new Tween({ x: 0 })
      .to({ x: 100 })
      .onUpdate((v) => {
        setCount(Math.floor(v.x));
      })
      .start();

    const animation = () => {
      requestAnimationFrame(animation);
      tween.update();
    };

    animation();
  }, []);

  return <div className="wh100p fbh fbac fbjc white-1">Test Tween: {count}</div>;
};

export default TestTween;
