import * as THREE from "three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import { Tween, Easing, Group } from "@tweenjs/tween.js";
import City from "./city";

const LINK_COLOR = 0x24e5ff;

export default class Link {
  private city1: City;
  private city2: City;
  private linkGroup: THREE.Group;
  private tweens: Tween[];

  constructor(city1: City, city2: City) {
    this.city1 = city1;
    this.city2 = city2;
    this.linkGroup = new THREE.Group();
    this.tweens = [];

    this.drawLine();
    this.drawRing();
  }

  drawLine = () => {
    const v0 = this.city1.getPosition();
    const v3 = this.city2.getPosition();

    let curve;
    const angle = v0.angleTo(v3);
    if (angle > 1) {
      const { v1, v2 } = getBezierPoint(v0, v3);
      curve = new THREE.CubicBezierCurve3(v0, v1, v2, v3); // 三维三次贝赛尔曲线
    } else {
      const p0 = new THREE.Vector3(0, 0, 0); // 法线向量
      const rayLine = new THREE.Ray(p0, getVCenter(v0.clone(), v3.clone())); // 顶点坐标
      const vtop = rayLine.at(1.3, new THREE.Vector3()); // 位置
      curve = new THREE.QuadraticBezierCurve3(v0, vtop, v3); // 三维二次贝赛尔曲线
    }

    const curvePoints = curve.getPoints(100);
    const material = new MeshLineMaterial({
      color: new THREE.Color(LINK_COLOR),
      opacity: 0.7,
      lineWidth: 1,
      useMap: 0,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });

    const lineLength = { value: 0 };
    const line = new MeshLineGeometry();

    // line.setPoints(curvePoints);
    // 绘制
    const drawLineTween = new Tween(lineLength).to({ value: 100 }, 3000);
    drawLineTween.onUpdate(() => {
      const visiblePoints = Math.floor((lineLength.value / 100) * curvePoints.length);
      line.setPoints(curvePoints.slice(0, visiblePoints));
    });

    // 擦除
    const eraseLineTween = new Tween(lineLength).to({ value: 0 }, 3000);
    eraseLineTween
      .onUpdate(function () {
        line.setPoints(curvePoints.slice(curvePoints.length - lineLength.value, curvePoints.length));
      })
      .onComplete(() => {
        this.destroy();
      });

    drawLineTween.start();
    this.tweens.push(drawLineTween);
    this.tweens.push(eraseLineTween);
    setTimeout(() => eraseLineTween.start(), 6000);

    const mesh = new THREE.Mesh(line, material);
    this.linkGroup.add(mesh);
  };

  drawRing() {
    // 扩
    const outter = new THREE.RingGeometry(1, 1.3, 15);
    const materialOutter = new THREE.MeshBasicMaterial({
      color: LINK_COLOR,
      side: THREE.DoubleSide,
      opacity: 0,
      transparent: true,
    });

    const ringOutter = new THREE.Mesh(outter, materialOutter);
    ringOutter.position.copy(this.city2.getPosition());
    ringOutter.lookAt(new THREE.Vector3(0, 0, 0));

    const ringScale = { value: 1 };
    const drawRingTween = new Tween(ringScale).to({ value: 1.1 }, 200);

    const drawRingTweenBack = new Tween(ringScale).to({ value: 0 }, 200);
    drawRingTweenBack.easing(Easing.Circular.In).onUpdate(() => {
      materialOutter.opacity = ringScale.value - 1;
    });

    drawRingTween
      .delay(3000)
      .easing(Easing.Circular.Out)
      .onUpdate(function () {
        materialOutter.opacity = 0.5;
        ringOutter.scale.set(ringScale.value, ringScale.value, ringScale.value);
      })
      .chain(drawRingTweenBack)
      .start();

    this.linkGroup.add(ringOutter);
    this.tweens.push(drawRingTween);
    this.tweens.push(drawRingTweenBack);
  }

  getMesh() {
    return this.linkGroup;
  }

  destroy() {
    this.linkGroup.clear();
  }

  getTweenGroup() {
    return this.tweens;
  }
}

function getBezierPoint(v0: THREE.Vector3, v3: THREE.Vector3) {
  const angle = (v0.angleTo(v3) * 180) / Math.PI; // 0 ~ Math.PI       // 计算向量夹角
  // console.log('angle', v0.angleTo(v3))
  const aLen = angle;
  const p0 = new THREE.Vector3(0, 0, 0); // 法线向量
  const rayLine = new THREE.Ray(p0, getVCenter(v0.clone(), v3.clone())); // 顶点坐标
  const vtop = new THREE.Vector3(0, 0, 0); // 法线向量
  rayLine.at(100, vtop); // 位置
  // 控制点坐标
  const v1 = getLenVcetor(v0.clone(), vtop, aLen);
  const v2 = getLenVcetor(v3.clone(), vtop, aLen);
  return {
    v1: v1,
    v2: v2,
  };
}

function getVCenter(v1: THREE.Vector3, v2: THREE.Vector3) {
  const v = v1.add(v2);
  return v.divideScalar(2);
}

function getLenVcetor(v1: THREE.Vector3, v2: THREE.Vector3, len: number) {
  const v1v2Len = v1.distanceTo(v2);
  return v1.lerp(v2, len / v1v2Len);
}
