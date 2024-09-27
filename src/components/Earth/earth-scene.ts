import { AmbientLight, PerspectiveCamera, Scene, SpotLight, WebGLRenderer, Vector3, Group } from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Earth } from "./earth";
import * as TWEEN from "@tweenjs/tween.js";
import City from "./city";
import Link from "./link";
import { countries } from "@/constants/countries";

export class EarthScene {
  private containerWidth: number;
  private containerHeight: number;

  private scene: Scene;
  private camera: PerspectiveCamera;
  private renderer: WebGLRenderer;
  private composer: EffectComposer;
  private controls: OrbitControls;
  private earthGroup: Group; // 和地球一起旋转的内容

  private shanghai: City;
  private cities: { city: City; link: Link }[];

  constructor(parentDom: HTMLElement, size: number) {
    this.containerHeight = size;
    this.containerWidth = size * 1.2;

    // warpper
    const container = document.createElement("div");
    container.style.width = `${this.containerWidth}px`;
    container.style.height = `${this.containerHeight}px`;
    parentDom.append(container);

    this.scene = new Scene();
    this.camera = new PerspectiveCamera(45, this.containerWidth / this.containerHeight, 1, 1500);
    this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setClearColor(0xffffff, 0);
    this.renderer.autoClear = false; // 每次渲染前不自动清除画布
    this.renderer.setSize(this.containerWidth, this.containerHeight);
    this.renderer.toneMappingExposure = Math.pow(1, 4.0); // 调节色彩曝光度

    container.appendChild(this.renderer.domElement);
    window.addEventListener("resize", () => this.handleWindowResize());

    // 地球
    const theEarth = new Earth(100);
    const earth = theEarth.getMesh();
    const earthGlow = theEarth.getGlowMesh();
    const earthParticles = theEarth.getParticleMesh();

    this.composer = new EffectComposer(this.renderer);
    this.composer.setSize(this.containerWidth, this.containerHeight);

    const renderScene = new RenderPass(this.scene, this.camera);
    renderScene.clear = false;
    this.composer.addPass(renderScene);

    // 光源
    const spotLight = new SpotLight(0x404040, 2.5);
    spotLight.target = earth;
    this.scene.add(spotLight);

    const light = new AmbientLight(0xffffff, 0.25); // soft white light
    this.scene.add(light);

    this.shanghai = new City(countries[0].position);

    // 轨迹，鼠标控制
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableZoom = false;
    this.controls.minDistance = 320;
    this.controls.maxDistance = 320;
    this.controls.maxPolarAngle = 1.5;
    this.controls.minPolarAngle = 1;
    this.controls.enablePan = false;
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.rotateSpeed = 0.5;
    this.controls.addEventListener("change", () => {
      spotLight.position.copy(this.camera.position);
      earthGlow.lookAt(new Vector3(this.camera.position.x - 25, this.camera.position.y - 50, this.camera.position.z + 20));
    });

    this.earthGroup = new Group();
    this.earthGroup.add(earth);
    this.earthGroup.add(earthParticles);
    this.earthGroup.add(this.shanghai.getMesh());

    this.camera.layers.enable(1);
    earthGlow.layers.set(1);
    // this.earthGroup.layers.set(0)

    this.scene.add(this.earthGroup);
    this.scene.add(earthGlow);

    this.cities = [];
    window.setInterval(() => this.createActivity(), 4000);

    this.render();
  }

  private render() {
    // this.stats.begin()

    window.requestAnimationFrame(() => this.render());
    this.controls.update();
    this.earthGroup.rotation.y += 0.0003;

    this.renderer.clear();

    this.camera.layers.set(1);
    this.composer.render();

    this.renderer.clearDepth();

    this.camera.layers.set(0);
    this.renderer.render(this.scene, this.camera);

    TWEEN.update();

    // this.stats.end()
  }

  private createActivity() {
    const length = countries.length;
    const index = Math.floor(Math.random() * length);

    const fromCity = new City(countries[index].position);
    const link = new Link(fromCity, this.shanghai);
    this.earthGroup.add(fromCity.getMesh());
    this.earthGroup.add(link.getMesh());

    this.cities.push({ city: fromCity, link });
    if (this.cities.length > 5) {
      const drop = this.cities.shift() as { city: City; link: Link };
      this.earthGroup.remove(drop.city.getMesh());
      this.earthGroup.remove(drop.link.getMesh());
      drop.city.destroy();
      drop.link.destroy();
    }
  }

  private handleWindowResize() {
    const width = this.containerWidth;
    const height = this.containerHeight;

    this.renderer.setSize(width, height);
    this.composer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
