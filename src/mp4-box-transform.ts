import { Transform, TransformCallback } from 'stream'

export default class MP4BoxTransform extends Transform {
  private chunks: Buffer[] = [];
  private total: number = 0;

  private concat () {
    if (this.chunks.length <= 1) { return; }
    const result = Buffer.concat(this.chunks);
    this.chunks = [result];
    this.total = result.length;
  }

  public _transform (chunk: Buffer, encoding: string, callback: TransformCallback): void {
    this.chunks.push(chunk);
    this.total += chunk.length;

    while (true) {
      if (this.total < 8) {
        break;
      } else if (this.chunks[0].length < 8) {
        this.concat();
      }

      const size = this.chunks[0].readUInt32BE(0);
      if (size !== 1) {
        if (this.total >= size) {
          this.concat();
          this.push(this.chunks[0].slice(0, size));
          this.chunks = [this.chunks[0].slice(size)];
          this.total = this.chunks[0].length;
        } else {
          break;
        }
      } else if (this.total < 16) {
        break;
      } else {
        if (this.chunks[0].length < 16) {
          this.concat();
        }

        const large_size = Number(this.chunks[0].readBigUInt64BE(8));
        if (this.total >= large_size) {
          this.concat();
          this.push(this.chunks[0].slice(0, large_size));
          this.chunks = [this.chunks[0].slice(large_size)];
          this.total = this.chunks[0].length;
        } else {
          break;
        }
      }
    }
    callback();
  }

  public _flush (callback: TransformCallback): void {
    callback();
  }
}
