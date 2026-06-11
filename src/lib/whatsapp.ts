// Reemplaza el número por el real de Caxandra (formato internacional, sin + ni espacios).
const PHONE = '3209090697'
const MESSAGE = 'Hola Caxandra, quiero info sobre los planes de predicciones.'

export const WA_LINK = `https://wa.me/${PHONE}?text=${encodeURIComponent(MESSAGE)}`