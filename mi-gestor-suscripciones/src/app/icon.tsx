import { ImageResponse } from 'next/og'

// Configuración de la imagen (Metadatos)
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            // Elemento JSX (Como si fuera HTML/CSS)
            <div
                style={{
                    fontSize: 20,
                    background: '#0f172a', // Tu color Slate-900
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    borderRadius: '6px', // Bordes redondeados
                    fontWeight: 800,
                    fontFamily: 'sans-serif',
                }}
            >
                R.
            </div>
        ),
        // Opciones de ImageResponse
        {
            ...size,
        }
    )
}