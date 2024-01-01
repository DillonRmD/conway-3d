import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

interface workerDataType {
    position: THREE.Vector3;
    visible: boolean;
}

export class Game {
    private scene: THREE.Scene;
    private renderer: THREE.WebGLRenderer;
    private controls: OrbitControls;
    private camera: THREE.PerspectiveCamera;

    private sceneWidth: number = 1280;
    private sceneHeight: number = 720;

    private cells: THREE.Mesh[] = [];
    private generationComputationWorker: Worker;

    constructor() {
        this.scene = this.setupScene();
        this.camera = this.setupCamera();
        this.renderer = this.setupRenderer();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);

        const gridLimit = 28;

        function getRandomNumber(min: number, max: number): number {
            return Math.random() * (max - min) + min;
        }

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        
        const lighterMaterial = new THREE.MeshLambertMaterial({ color: 0xFFFFFF });
        const darkerMaterial = new THREE.MeshLambertMaterial({color: 0xe8e8e8});
        let initialActiveCellCount: number = 0;
        for (let x = 0; x < gridLimit; x++) {
            for (let y = 0; y < gridLimit; y++) {
                for (let z = 0; z < gridLimit; z++) {
                    const isEvenCoordinate = x % 2 == 0 || y % 2 ==0 || z % 2 == 0;
                    const cell = this.createCell(new THREE.Vector3(x, y, z), geometry, isEvenCoordinate ? lighterMaterial : darkerMaterial);
                    cell.visible = getRandomNumber(1, 100) <= 5;
                    cell.castShadow = true;
                    this.cells.push(cell);
                    this.scene.add(cell);
                    if (cell.visible) {
                        initialActiveCellCount++;
                    }
                }
            }
        }
        this.updateActiveCellCountDOMElement(initialActiveCellCount);

        this.generationComputationWorker = new Worker(new URL('./worker.ts', import.meta.url), {type: 'module'});
        this.generationComputationWorker.onmessage = (event) => {
            const workerCells: workerDataType = event.data;
            let activeCellCount: number = 0;
            for (let i = 0; i < this.cells.length; i++) {
                const cell = this.cells[i];
                const workerCell = workerCells[i];
                cell.position.set(workerCell.position.x, workerCell.position.y, workerCell.position.z);
                cell.visible = workerCell.visible;
                if (cell.visible) {
                    activeCellCount++;
                }
            }

            this.updateActiveCellCountDOMElement(activeCellCount);
        }
    }

    public nextGeneration() {
        let workerData: workerDataType[] = [];
        for (let i = 0; i < this.cells.length; i++) {
            const currentCell = this.cells[i];

            workerData.push({
                position: new THREE.Vector3(currentCell.position.x, currentCell.position.y, currentCell.position.z),
                visible: currentCell.visible
            });
        }

        this.generationComputationWorker.postMessage(workerData);
    }

    public consumeDataFromWorker(cells: workerDataType[]) {
        for (let i = 0; i < cells.length; i++) {
            this.cells[i].visible = cells[i].visible;
        }
    }

    private createCell(position: THREE.Vector3, geometry: THREE.BoxGeometry, material: THREE.MeshLambertMaterial): THREE.Mesh {
        const cell = new THREE.Mesh(geometry, material);
        cell.position.set(position.x, position.y, position.z);

        return cell;
    }

    private setupRenderer(): THREE.WebGLRenderer {
        const canvasContainer = document.getElementById('canvas-container');

        if (!canvasContainer) {
            alert('fuck2');
        }

        const renderer = new THREE.WebGLRenderer();
        renderer.shadowMap.enabled = true;
        renderer.setSize(canvasContainer?.clientWidth ?? 800, canvasContainer?.clientHeight ?? 600);
        canvasContainer?.appendChild(renderer.domElement);

        return renderer;
    }

    private setupScene(): THREE.Scene {
        const scene = new THREE.Scene;

        const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.8);
        scene.add(ambientLight);
        
    
        const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.65);
        directionalLight.position.set(1, 1, 1).normalize();
        scene.add(directionalLight);

        return scene;
    }

    private setupCamera(): THREE.PerspectiveCamera {
        const camera = new THREE.PerspectiveCamera(75, this.sceneWidth / this.sceneHeight, 0.1, 1000);
        camera.position.y = 23;
        camera.position.x = 34;
        camera.position.z = 48;

        return camera;
    }

    public run() {
        requestAnimationFrame(() => this.run());
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
    }

    private updateActiveCellCountDOMElement(count: number) {
        const element = document.getElementById('active-cell-counter');
        if (element) {
            element.textContent = `${count}`;
        }
    }
}