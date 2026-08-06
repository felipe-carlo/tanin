import * as migration_20260806_184908_inicial from './20260806_184908_inicial';
import * as migration_20260806_195419_indice_de_busca from './20260806_195419_indice_de_busca';

export const migrations = [
  {
    up: migration_20260806_184908_inicial.up,
    down: migration_20260806_184908_inicial.down,
    name: '20260806_184908_inicial',
  },
  {
    up: migration_20260806_195419_indice_de_busca.up,
    down: migration_20260806_195419_indice_de_busca.down,
    name: '20260806_195419_indice_de_busca'
  },
];
