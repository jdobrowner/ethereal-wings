export type TubeConfiguration = {
  length: number;
  position: { x: number; y: number; z: number };
  soundFile: string;
};

export type CONTENTFUL_HARP = {
  modelName: string;
  tubeNotes: string[];
}