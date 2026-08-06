import * as migration_20260806_184908_inicial from './20260806_184908_inicial';

export const migrations = [
  {
    up: migration_20260806_184908_inicial.up,
    down: migration_20260806_184908_inicial.down,
    name: '20260806_184908_inicial'
  },
];
