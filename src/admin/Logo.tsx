import React from 'react'

/** Marca da Tanin no topo da tela de login do painel. */
export const Logo: React.FC = () => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.5rem 0 1rem',
    }}
  >
    <span
      style={{
        fontFamily: 'Georgia, "Times New Roman", serif',
        fontSize: '2.75rem',
        letterSpacing: '-0.03em',
        lineHeight: 1,
        color: '#14110f',
      }}
    >
      Tanin
    </span>
    <span
      style={{
        fontSize: '0.65rem',
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color: '#6b2130',
      }}
    >
      Painel de publicação
    </span>
  </div>
)

/** Ícone reduzido, usado na barra lateral. */
export const Icone: React.FC = () => (
  <span
    style={{
      fontFamily: 'Georgia, "Times New Roman", serif',
      fontSize: '1.5rem',
      letterSpacing: '-0.03em',
      color: '#6b2130',
    }}
  >
    T
  </span>
)

export default Logo
