export const size = (box: Buffer) => {
  const size = box.readUInt32BE(0);
  if (size !== 1) { return size; }

  return Number(box.readBigUInt64BE(8));
}

export const type = (box: Buffer) => {
  return box.toString('ascii', 4, 8);
}