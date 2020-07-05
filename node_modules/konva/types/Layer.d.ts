import { Container, ContainerConfig } from './Container';
import { SceneCanvas, HitCanvas } from './Canvas';
import { Stage } from './Stage';
import { GetSet, Vector2d } from './types';
import { Group } from './Group';
import { Shape } from './Shape';
export interface LayerConfig extends ContainerConfig {
    clearBeforeDraw?: boolean;
    hitGraphEnabled?: boolean;
    imageSmoothingEnabled?: boolean;
}
export declare class Layer extends Container<Group | Shape> {
    canvas: SceneCanvas;
    hitCanvas: HitCanvas;
    _waitingForDraw: boolean;
    constructor(config?: LayerConfig);
    createPNGStream(): any;
    getCanvas(): SceneCanvas;
    getHitCanvas(): HitCanvas;
    getContext(): import("./Context").Context;
    clear(bounds?: any): this;
    setZIndex(index: any): this;
    moveToTop(): boolean;
    moveUp(): boolean;
    moveDown(): boolean;
    moveToBottom(): boolean;
    getLayer(): this;
    remove(): this;
    getStage(): Stage;
    setSize({ width, height }: {
        width: any;
        height: any;
    }): this;
    _validateAdd(child: any): void;
    _toKonvaCanvas(config: any): any;
    _checkVisibility(): void;
    _setSmoothEnabled(): void;
    getWidth(): number;
    setWidth(): void;
    getHeight(): number;
    setHeight(): void;
    batchDraw(): this;
    getIntersection(pos: Vector2d, selector?: string): any;
    _getIntersection(pos: any): {
        shape: any;
        antialiased?: undefined;
    } | {
        antialiased: boolean;
        shape?: undefined;
    } | {
        shape?: undefined;
        antialiased?: undefined;
    };
    drawScene(can: any, top: any): this;
    drawHit(can: any, top: any): this;
    enableHitGraph(): this;
    disableHitGraph(): this;
    setHitGraphEnabled(val: any): void;
    getHitGraphEnabled(val: any): boolean;
    toggleHitCanvas(): void;
    hitGraphEnabled: GetSet<boolean, this>;
    clearBeforeDraw: GetSet<boolean, this>;
    imageSmoothingEnabled: GetSet<boolean, this>;
}
