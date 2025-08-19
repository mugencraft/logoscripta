export interface ContainerDimensions {
  width: number;
  height: number;
}

export interface AreaDimensions extends ContainerDimensions {
  x: number;
  y: number;
}

export const coordinateTransforms = {
  toPixels: (
    percentArea: AreaDimensions,
    container: ContainerDimensions,
  ): AreaDimensions => ({
    x: (percentArea.x / 100) * container.width,
    y: (percentArea.y / 100) * container.height,
    width: (percentArea.width / 100) * container.width,
    height: (percentArea.height / 100) * container.height,
  }),

  toPercentage: (
    pixelArea: AreaDimensions,
    container: ContainerDimensions,
  ): AreaDimensions => ({
    x: (pixelArea.x / container.width) * 100,
    y: (pixelArea.y / container.height) * 100,
    width: (pixelArea.width / container.width) * 100,
    height: (pixelArea.height / container.height) * 100,
  }),

  constrainToContainer: (area: AreaDimensions): AreaDimensions => ({
    x: Math.max(0, Math.min(100 - area.width, area.x)),
    y: Math.max(0, Math.min(100 - area.height, area.y)),
    width: Math.max(5, Math.min(100, area.width)),
    height: Math.max(5, Math.min(100, area.height)),
  }),
};
