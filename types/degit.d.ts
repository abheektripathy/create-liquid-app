declare module 'degit' {
  interface DegitOptions {
    cache?: boolean;
    force?: boolean;
    verbose?: boolean;
    mode?: string;
  }

  interface Degit {
    clone(destination: string): Promise<void>;
  }

  function degit(src: string, options?: DegitOptions): Degit;

  export = degit;
}
