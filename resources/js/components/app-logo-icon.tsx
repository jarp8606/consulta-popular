import { ImgHTMLAttributes } from 'react';

export default function AppLogoIcon(props: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src="/images/mesa1.jpg" // <-- Cambiado de .jpg a .png
            alt="Logo IAPAM"
            {...props}
            className={`h-60 w-auto object-contain ${props.className || ''}`}
        />
    );
}