import * as migration_20260808_020000_limpeza_do_modelo_antigo from './20260808_020000_limpeza_do_modelo_antigo';
import * as migration_20260808_030159_inicial from './20260808_030159_inicial';
import * as migration_20260809_010000_editor_minimalista from './20260809_010000_editor_minimalista';

export const migrations = [
  {
    up: migration_20260808_020000_limpeza_do_modelo_antigo.up,
    down: migration_20260808_020000_limpeza_do_modelo_antigo.down,
    name: '20260808_020000_limpeza_do_modelo_antigo'
  },
  {
    up: migration_20260808_030159_inicial.up,
    down: migration_20260808_030159_inicial.down,
    name: '20260808_030159_inicial'
  },
  {
    up: migration_20260809_010000_editor_minimalista.up,
    down: migration_20260809_010000_editor_minimalista.down,
    name: '20260809_010000_editor_minimalista'
  },
];
