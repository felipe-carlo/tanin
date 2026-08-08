import * as migration_20260808_030159_inicial from './20260808_030159_inicial';

export const migrations = [
  {
    up: migration_20260808_030159_inicial.up,
    down: migration_20260808_030159_inicial.down,
    name: '20260808_030159_inicial'
  },
];
