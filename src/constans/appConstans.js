import { Type, Image, MousePointer, Menu, FileText, Camera } from 'lucide-react';

export const elements = {
  free: [
    { id: 'text', name: 'Texto', icon: Type, type: 'text' },
    { id: 'image', name: 'Imagen', icon: Image, type: 'image' },
    { id: 'button', name: 'Botón', icon: MousePointer, type: 'button' }
  ],
  pro: [
    { id: 'text', name: 'Texto', icon: Type, type: 'text' },
    { id: 'image', name: 'Imagen', icon: Image, type: 'image' },
    { id: 'button', name: 'Botón', icon: MousePointer, type: 'button' },
    { id: 'menu', name: 'Menú', icon: Menu, type: 'menu' },
    { id: 'form', name: 'Formulario', icon: FileText, type: 'form' },
    { id: 'gallery', name: 'Galería', icon: Camera, type: 'gallery' }
  ]
};

export const plans = [
  {
    id: 'free',
    name: 'Free',
    price: '$0',
    features: ['3 elementos básicos', '1 proyecto', 'Solo previsualización'],
    color: 'gray'
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '$9.99/mes',
    features: ['Todos los elementos', 'Proyectos ilimitados', 'Exportar HTML', 'Plantillas'],
    color: 'blue',
    popular: true
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '$19.99/mes',
    features: ['Todo del plan Pro', 'Estadísticas avanzadas', 'Soporte prioritario'],
    color: 'purple'
  }
];
