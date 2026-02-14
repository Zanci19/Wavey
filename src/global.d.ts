import { Buffer as BufferType } from 'buffer';
import ProcessType from 'process';

declare global {
  interface Window {
    Buffer: typeof BufferType;
    process: typeof ProcessType;
  }
}

export {};
